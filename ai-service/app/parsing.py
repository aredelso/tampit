"""Helpers for turning fetched web pages into text.

Pure functions with no I/O, so they are easy to test.
"""

import re

# Maximum characters of page text kept for generic content use.
MAX_WEBSITE_TEXT = 5000
# Email search reads much more of the page, because contact details are often
# near the bottom.
MAX_EMAIL_SEARCH_TEXT = 200_000


def html_to_text(html: str, limit: int = MAX_WEBSITE_TEXT) -> str:
    """Strip scripts, styles and tags, collapse whitespace, and truncate."""
    text = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S | re.I)
    text = re.sub(r"<style[^>]*>.*?</style>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]*>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def mailto_addresses(html: str) -> list[str]:
    """Addresses from mailto: links. Tag stripping would otherwise lose them."""
    return [
        address.strip()
        for address in re.findall(r"mailto:([^\"'\s>?#]+)", html, flags=re.I)
    ]


def email_search_text(html: str) -> str:
    """Page text plus mailto addresses, prepared for contact-email search."""
    text = html_to_text(html, limit=MAX_EMAIL_SEARCH_TEXT)
    return f"{text} {' '.join(mailto_addresses(html))}"


def normalize_url(url: str) -> str:
    """Add https:// when the URL has no http(s) scheme."""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return "https://" + url
