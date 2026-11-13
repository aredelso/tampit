from app.extractors import find_contact_email, parse_label_text, suggest_website_urls


def test_parses_labelled_fields_on_one_line():
    text = "Kenya AA Washed\nOrigin: Kenya  Farm: Nyeri"
    fields = parse_label_text(text)
    assert fields["name"] == "Kenya AA Washed"
    assert fields["origin"] == "Kenya"
    assert fields["farm"] == "Nyeri"
    assert fields["process"] == "Washed"


def test_parses_one_field_per_line():
    text = "Ethiopia Yirgacheffe\nProcess: Natural\nVariety: Heirloom\nRoasted by: Blue Bottle"
    fields = parse_label_text(text)
    assert fields["name"] == "Ethiopia Yirgacheffe"
    assert fields["process"] == "Natural"
    assert fields["variety"] == "Heirloom"
    assert fields["roasterName"] == "Blue Bottle"


def test_origin_falls_back_to_known_country_names():
    fields = parse_label_text("Colombia Huila Bourbon Honey")
    assert fields["origin"] == "Colombia"
    assert fields["variety"] == "Bourbon"
    assert fields["process"] == "Honey"


def test_pulped_natural_wins_over_natural():
    assert parse_label_text("Pulped natural Geisha")["process"] == "Pulped natural"


def test_missing_fields_are_omitted():
    fields = parse_label_text("   \n  ")
    assert fields == {}


def test_label_words_are_not_used_as_the_name():
    fields = parse_label_text("Origin: Kenya\nFarm: Nyeri")
    assert "name" not in fields


def test_find_contact_email_prefers_mailboxes_like_info():
    text = "Written by jane.smith@roaster.com. Write to info@roaster.com for orders."
    assert find_contact_email(text) == "info@roaster.com"


def test_find_contact_email_ignores_image_names_and_placeholders():
    text = "logo@2x.png user@example.com real@roaster.co"
    assert find_contact_email(text) == "real@roaster.co"


def test_find_contact_email_returns_none_when_absent():
    assert find_contact_email("no addresses here") is None


def test_suggest_website_urls_drops_company_words():
    assert suggest_website_urls("Blue Bottle Coffee") == [
        "bluebottle.com",
        "blue-bottle.com",
        "bluebottlecoffee.com",
    ]


def test_suggest_website_urls_handles_empty_names():
    assert suggest_website_urls("  ") == []
