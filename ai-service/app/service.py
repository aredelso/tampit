"""Business logic for the AI service.

The HTTP client is injected, so tests can replace it with a fake.
"""

import asyncio
import io

import httpx
import pytesseract
from PIL import Image

from .extractors import find_contact_email, parse_label_text, suggest_website_urls
from .parsing import email_search_text, normalize_url

FETCH_TIMEOUT_SECONDS = 10
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


class AiError(Exception):
    """An error caused by bad input or a failed step. Maps to an HTTP status."""

    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


class AiService:
    def __init__(self, http: httpx.AsyncClient | None = None):
        self._http = http

    async def extract_coffee_data(self, image_bytes: bytes) -> dict:
        """OCR the label image, then pull out the coffee fields."""
        if not image_bytes:
            raise AiError(400, "Image data is required")

        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.load()
            ocr_text = await asyncio.to_thread(
                pytesseract.image_to_string, image, lang="eng"
            )
        except Exception as error:  # Pillow and Tesseract raise varied errors
            raise AiError(400, f"Failed to extract text from image: {error}") from error

        if not ocr_text.strip():
            raise AiError(400, "Could not extract any text from the image")

        fields = parse_label_text(ocr_text)
        if not fields:
            raise AiError(400, "Could not identify any coffee details in the image")
        return fields

    async def extract_contact_email_from_website(
        self,
        website_url: str | None = None,
        website_content: str | None = None,
    ) -> str | None:
        if not website_url and not website_content:
            raise AiError(400, "Either websiteUrl or websiteContent is required")

        if website_content:
            return find_contact_email(website_content)

        try:
            html = await self.fetch_website_html(website_url)
        except Exception as error:
            raise AiError(
                400, f"Failed to fetch website content from {website_url}"
            ) from error
        return find_contact_email(email_search_text(html))

    async def extract_contact_email_by_roaster_name(
        self, roaster_name: str
    ) -> str | None:
        if not roaster_name or not roaster_name.strip():
            raise AiError(400, "Roaster name is required")

        for url in suggest_website_urls(roaster_name):
            try:
                email = await self.extract_contact_email_from_website(website_url=url)
            except AiError:
                continue  # This guessed domain is unreachable; try the next
            if email:
                return email
        return None

    async def fetch_website_html(self, url: str) -> str:
        """Download a page's HTML. Raises on any HTTP or network error."""
        client = self._http or httpx.AsyncClient(
            timeout=FETCH_TIMEOUT_SECONDS,
            follow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        )
        try:
            response = await client.get(normalize_url(url))
            response.raise_for_status()
            return response.text
        finally:
            if self._http is None:
                await client.aclose()
