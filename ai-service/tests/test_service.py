import asyncio
import io

import pytest
from PIL import Image

from app import service as service_module
from app.service import AiError, AiService


def run(coro):
    return asyncio.run(coro)


def png_bytes():
    buf = io.BytesIO()
    Image.new("RGB", (4, 4), "white").save(buf, format="PNG")
    return buf.getvalue()


class FakeHttp:
    """Serves canned HTML per URL. Unknown URLs raise, like an unreachable host."""

    def __init__(self, pages):
        self.pages = pages
        self.requested = []

    async def get(self, url, **kwargs):
        self.requested.append(url)
        if url not in self.pages:
            raise RuntimeError(f"unreachable: {url}")

        pages = self.pages

        class Resp:
            text = pages[url]

            def raise_for_status(self):
                pass

        return Resp()

    async def aclose(self):
        pass


def test_contact_email_requires_a_url_or_content():
    with pytest.raises(AiError) as err:
        run(AiService().extract_contact_email_from_website())
    assert err.value.status_code == 400
    assert err.value.message == "Either websiteUrl or websiteContent is required"


def test_contact_email_is_found_in_supplied_content():
    email = run(
        AiService().extract_contact_email_from_website(
            website_content="Questions? Email info@roaster.com today."
        )
    )
    assert email == "info@roaster.com"


def test_contact_email_is_found_in_a_fetched_page_mailto_link():
    http = FakeHttp({"https://roaster.com": '<a href="mailto:hello@roaster.com">mail</a>'})
    email = run(
        AiService(http=http).extract_contact_email_from_website(website_url="roaster.com")
    )
    assert email == "hello@roaster.com"


def test_failed_fetch_becomes_a_400_error():
    with pytest.raises(AiError) as err:
        run(AiService(http=FakeHttp({})).extract_contact_email_from_website(website_url="bad.example"))
    assert err.value.message == "Failed to fetch website content from bad.example"


def test_roaster_lookup_tries_guessed_domains_until_an_email_is_found():
    http = FakeHttp(
        {
            "https://bluebottle.com": "<p>no contact here</p>",
            "https://blue-bottle.com": "<p>sales: wholesale@blue-bottle.com</p>",
        }
    )
    email = run(AiService(http=http).extract_contact_email_by_roaster_name("Blue Bottle Coffee"))
    assert email == "wholesale@blue-bottle.com"
    assert http.requested[:2] == ["https://bluebottle.com", "https://blue-bottle.com"]


def test_roaster_lookup_returns_none_when_no_site_has_an_email():
    http = FakeHttp({"https://nowhere.com": "<p>nothing</p>"})
    assert run(AiService(http=http).extract_contact_email_by_roaster_name("Nowhere")) is None


def test_roaster_name_is_required():
    with pytest.raises(AiError) as err:
        run(AiService().extract_contact_email_by_roaster_name("   "))
    assert err.value.message == "Roaster name is required"


def test_coffee_extraction_rejects_empty_image():
    with pytest.raises(AiError) as err:
        run(AiService().extract_coffee_data(b""))
    assert err.value.status_code == 400


def test_coffee_extraction_rejects_non_image_bytes():
    with pytest.raises(AiError) as err:
        run(AiService().extract_coffee_data(b"not an image"))
    assert err.value.message.startswith("Failed to extract text from image")


def test_coffee_extraction_returns_fields_from_ocr(monkeypatch):
    monkeypatch.setattr(service_module.pytesseract, "image_to_string", lambda *a, **k: "Kenya AA Washed\nOrigin: Kenya  Farm: Nyeri")
    fields = run(AiService().extract_coffee_data(png_bytes()))
    assert fields["origin"] == "Kenya"
    assert fields["farm"] == "Nyeri"


def test_coffee_extraction_reports_when_ocr_finds_no_text(monkeypatch):
    monkeypatch.setattr(service_module.pytesseract, "image_to_string", lambda *a, **k: "   ")
    with pytest.raises(AiError) as err:
        run(AiService().extract_coffee_data(png_bytes()))
    assert err.value.message == "Could not extract any text from the image"


def test_coffee_extraction_reports_when_no_fields_are_recognised(monkeypatch):
    monkeypatch.setattr(service_module.pytesseract, "image_to_string", lambda *a, **k: "12 34 56")
    with pytest.raises(AiError) as err:
        run(AiService().extract_coffee_data(png_bytes()))
    assert err.value.message == "Could not identify any coffee details in the image"
