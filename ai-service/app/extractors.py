"""Rule-based extraction for coffee labels and roaster contact details.

Everything here is deterministic and uses only the Python standard library. It
works from known vocabularies (countries, processing methods, varieties), label
keywords such as "Origin:", and regular expressions. It is less flexible than a
language model: unusual label layouts may yield fewer fields.
"""

import re

MAX_URL_SUGGESTIONS = 3

# Known vocabularies. Longer phrases come first so that "Pulped natural" wins
# over "Natural".
PROCESSES = [
    "Carbonic maceration",
    "Pulped natural",
    "Semi-washed",
    "Anaerobic",
    "Wet-hulled",
    "Washed",
    "Natural",
    "Honey",
]

VARIETIES = [
    "Maragogype",
    "Pacamara",
    "Heirloom",
    "Bourbon",
    "Caturra",
    "Catuai",
    "Castillo",
    "Geisha",
    "Gesha",
    "Pacas",
    "Typica",
    "SL28",
    "SL34",
]

ORIGINS = [
    "Ethiopia",
    "Kenya",
    "Colombia",
    "Brazil",
    "Guatemala",
    "Costa Rica",
    "Rwanda",
    "Burundi",
    "Tanzania",
    "Uganda",
    "Peru",
    "Honduras",
    "Panama",
    "El Salvador",
    "Mexico",
    "Nicaragua",
    "Bolivia",
    "Ecuador",
    "Yemen",
    "Indonesia",
    "India",
    "Papua New Guinea",
]

# Label keywords that introduce a field, e.g. "Origin: Kenya".
ORIGIN_LABELS = ["origin", "country", "region"]
FARM_LABELS = ["farm", "estate", "station", "washing station", "cooperative", "co-op"]
ROASTER_LABELS = ["roasted by", "roaster", "roasted"]
ALL_LABELS = ORIGIN_LABELS + FARM_LABELS + ROASTER_LABELS + ["variety", "process"]

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
IGNORED_EMAIL_SUFFIXES = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
IGNORED_EMAIL_DOMAINS = {"example.com", "example.org", "sentry.io", "wixpress.com"}
PREFERRED_MAILBOXES = ["info", "contact", "hello", "hi", "sales", "wholesale", "support", "team"]

# Words that describe a company, not its brand. They are dropped when guessing
# website addresses.
NAME_NOISE = {
    "coffee",
    "coffees",
    "roasters",
    "roastery",
    "roasting",
    "roaster",
    "company",
    "co",
    "the",
    "and",
    "inc",
    "llc",
}


def _first_match(text: str, words: list[str]) -> str | None:
    """Return the first vocabulary word found in text, as written in the vocabulary."""
    for word in words:
        pattern = r"(?<![A-Za-z])" + re.escape(word) + r"(?![A-Za-z])"
        if re.search(pattern, text, flags=re.IGNORECASE):
            return word
    return None


def _label_value(text: str, labels: list[str]) -> str | None:
    """Return the value after a label such as "Farm: X".

    The value stops at a double space, a pipe, or the next known label, so that
    "Origin: Kenya  Farm: Nyeri" gives "Kenya" for origin.
    """
    label_alt = "|".join(re.escape(label) for label in labels)
    match = re.search(rf"(?i)\b(?:{label_alt})\s*[:\-]\s*([^\n]+)", text)
    if not match:
        return None
    value = match.group(1)
    value = re.split(r"\s{2,}|\s*\|\s*", value)[0]
    next_label = "|".join(re.escape(label) for label in ALL_LABELS)
    value = re.split(rf"\s+(?=(?i:{next_label})\s*[:\-])", value)[0]
    value = value.strip(" .,;-")
    return value[:80] or None


def _guess_name(text: str) -> str | None:
    """Use the first line that has letters and is not a labelled field."""
    label_pattern = re.compile(rf"(?i)^\s*(?:{'|'.join(re.escape(x) for x in ALL_LABELS)})\b")
    for raw_line in text.splitlines():
        line = raw_line.strip(" |-–")
        if len(re.findall(r"[A-Za-z]", line)) < 3:
            continue
        if ":" in line or label_pattern.match(line):
            continue
        return line[:80]
    return None


def parse_label_text(text: str) -> dict:
    """Turn OCR text from a coffee label into the ExtractedCoffeeData fields.

    Fields that cannot be found are omitted.
    """
    result: dict[str, str] = {}

    name = _guess_name(text)
    if name:
        result["name"] = name

    origin = _label_value(text, ORIGIN_LABELS) or _first_match(text, ORIGINS)
    if origin:
        result["origin"] = origin

    variety = _label_value(text, ["variety", "varietal", "cultivar"]) or _first_match(
        text, VARIETIES
    )
    if variety:
        result["variety"] = variety

    farm = _label_value(text, FARM_LABELS)
    if farm:
        result["farm"] = farm

    process = _label_value(text, ["process", "processing"]) or _first_match(text, PROCESSES)
    if process:
        result["process"] = process

    roaster = _label_value(text, ROASTER_LABELS)
    if roaster:
        result["roasterName"] = roaster

    return result


def find_contact_email(text: str) -> str | None:
    """Pick the most likely contact address from page text.

    Image file names and placeholder domains are skipped. Mailboxes such as
    info@ or hello@ are preferred over personal-looking addresses.
    """
    candidates = []
    for email in EMAIL_RE.findall(text):
        lowered = email.lower()
        domain = lowered.split("@", 1)[1]
        if lowered.endswith(IGNORED_EMAIL_SUFFIXES) or domain in IGNORED_EMAIL_DOMAINS:
            continue
        if email not in candidates:
            candidates.append(email)
    if not candidates:
        return None
    for email in candidates:
        if email.split("@", 1)[0].lower() in PREFERRED_MAILBOXES:
            return email
    return candidates[0]


def suggest_website_urls(roaster_name: str) -> list[str]:
    """Guess likely website domains from a roaster's name."""
    words = re.findall(r"[a-z0-9]+", roaster_name.lower())
    brand = [word for word in words if word not in NAME_NOISE] or words
    if not brand:
        return []

    compact = "".join(brand)
    hyphen = "-".join(brand)
    candidates = [f"{compact}.com", f"{hyphen}.com", f"{compact}coffee.com"]

    unique: list[str] = []
    for candidate in candidates:
        if candidate not in unique:
            unique.append(candidate)
    return unique[:MAX_URL_SUGGESTIONS]
