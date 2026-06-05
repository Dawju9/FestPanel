import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.parser import parse_metrage, extract_date, parse_price, normalize_city


def test_parse_metrage_range():
    assert parse_metrage("Dam zlecenie na montaz paneli, 26-50m2") == "26-50m2"
    assert parse_metrage("ukladanie paneli 26-50m²") == "26-50m2"
    assert parse_metrage("montaz 51-100m2") == "51-100m2"
    assert parse_metrage("101-250m² duza podloga") == "101-250m2"


def test_parse_metrage_single():
    assert parse_metrage("Potrzebuje ekipy, 25m2") == "25m2"
    assert parse_metrage("10m² mala powierzchnia") == "10m2"
    assert parse_metrage("34m2") == "34m2"
    assert parse_metrage("do 25m²") == "25m2"


def test_parse_metrage_empty():
    assert parse_metrage("") == ""
    assert parse_metrage("Zlece ułożenie paneli") == ""
    assert parse_metrage("Bez metrażu w tytule") == ""
    assert parse_metrage(None) == ""


def test_parse_metrage_funky():
    assert parse_metrage("Zlecę układanie 50m2 paneli") == "50m2"
    assert parse_metrage("Szukam ekipy 15 m2") == "15m2"
    assert parse_metrage("26–50m2 nietypowy myślnik") == "26-50m2"


def test_extract_date_iso():
    assert extract_date("2026-06-05") == "2026-06-05"
    assert extract_date("2026-06-05T00:00:00") == "2026-06-05"
    assert extract_date("2026-12-31T23:59:59") == "2026-12-31"


def test_extract_date_empty():
    assert extract_date("") == ""
    assert extract_date(None) == ""
    assert extract_date("invalid date") == ""
    assert extract_date("05-06-2026") == ""


def test_parse_price():
    assert parse_price("") == ""
    assert parse_price(None) == ""
    assert parse_price("1000 zł") == "1000zł"
    assert parse_price("500") == "500zł"
    assert parse_price("cena 2500 zl") == "2500zł"


def test_normalize_city():
    assert normalize_city("Warszawa") == "Warszawa"
    assert normalize_city("krakow") == "Kraków"
    assert normalize_city("łódź") == "Łódź"
    assert normalize_city("wroclaw") == "Wrocław"
    assert normalize_city("poznan") == "Poznań"
    assert normalize_city("gdansk") == "Gdańsk"
    assert normalize_city("SomeSmallCity") == "Somesmallcity"


def run():
    tests = [
        test_parse_metrage_range,
        test_parse_metrage_single,
        test_parse_metrage_empty,
        test_parse_metrage_funky,
        test_extract_date_iso,
        test_extract_date_empty,
        test_parse_price,
        test_normalize_city,
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
    return passed, failed


if __name__ == "__main__":
    p, f = run()
    print(f"\nParser: {p} passed, {f} failed")
