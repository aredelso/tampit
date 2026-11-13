from app.parsing import email_search_text, html_to_text, mailto_addresses, normalize_url


def test_html_to_text_removes_scripts_styles_and_tags():
    html = (
        "<html><head><style>p{color:red}</style><script>var x=1;</script></head>"
        "<body><h1>Blue   Bottle</h1><p>Email us at hi@bb.com</p></body></html>"
    )
    assert html_to_text(html) == "Blue Bottle Email us at hi@bb.com"


def test_html_to_text_truncates():
    assert len(html_to_text("a" * 10000, limit=100)) == 100


def test_mailto_addresses_are_found_even_though_tags_are_stripped():
    html = '<a href="mailto:orders@bb.com?subject=hi">Write to us</a>'
    assert mailto_addresses(html) == ["orders@bb.com"]
    assert "orders@bb.com" in email_search_text(html)


def test_normalize_url_adds_https_only_when_missing():
    assert normalize_url("example.com") == "https://example.com"
    assert normalize_url("http://example.com") == "http://example.com"
    assert normalize_url("https://example.com") == "https://example.com"
