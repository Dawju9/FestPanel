import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.scraper import scrape_oferteo_listing


def test_oferteo_listing():
    offers, total_pages = scrape_oferteo_listing(
        "https://www.oferteo.pl/zlecenia-na-ukladanie-paneli-ni1",
        "test"
    )
    assert len(offers) > 0, "Should find at least 1 offer"
    assert total_pages >= 1, "Should detect pagination"

    offer = offers[0]
    assert "id" in offer
    assert str(offer["id"]).isdigit()
    assert "date" in offer
    assert len(offer["date"]) >= 10  # YYYY-MM-DD
    assert "title" in offer
    assert len(offer["title"]) > 0
    assert "city" in offer
    assert "source" in offer
    assert offer["source"] == "oferteo.pl"
    assert "metrage" in offer
    assert "query" in offer
    assert offer["query"] == "test"


def test_oferteo_listing_structure():
    offers, _ = scrape_oferteo_listing(
        "https://www.oferteo.pl/zlecenia-na-ukladanie-paneli-ni1",
        "test"
    )
    for o in offers[:5]:
        assert isinstance(o["id"], (str, int))
        assert isinstance(o["title"], str)
        assert isinstance(o["city"], str)
        assert isinstance(o["date"], str)


def test_oferteo_pagination_detected():
    _, total_pages = scrape_oferteo_listing(
        "https://www.oferteo.pl/zlecenia-na-ukladanie-paneli-ni1",
        "test"
    )
    assert total_pages >= 100, "ukladanie-paneli should have 100+ pages"


def test_oferteo_bad_url():
    offers, pages = scrape_oferteo_listing(
        "https://www.oferteo.pl/zlecenia-na-non-existing-category-ni1",
        "test"
    )
    assert offers == []
    assert pages == 1


def test_oferteo_cyklinowanie():
    offers, pages = scrape_oferteo_listing(
        "https://www.oferteo.pl/zlecenia-na-cyklinowanie-ni1",
        "test"
    )
    assert len(offers) > 0, "cyklinowanie should have offers"
    assert offers[0]["metrage"] is not None


def run():
    tests = [
        test_oferteo_listing,
        test_oferteo_listing_structure,
        test_oferteo_pagination_detected,
        test_oferteo_bad_url,
        test_oferteo_cyklinowanie,
    ]
    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  ✓ {t.__name__}")
            passed += 1
        except AssertionError as e:
            print(f"  ✗ {t.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ {t.__name__}: {e}")
            failed += 1
    return passed, failed


if __name__ == "__main__":
    p, f = run()
    print(f"\nScraper (network): {p} passed, {f} failed")
