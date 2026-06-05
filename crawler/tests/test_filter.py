import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.filter import is_job_offer, match_location, is_offer_url


def test_is_job_offer_positive():
    assert is_job_offer("Dam zlecenie na montaż paneli")
    assert is_job_offer("Zlecę ułożenie paneli")
    assert is_job_offer("Szukam specjalisty do paneli")
    assert is_job_offer("Potrzebuję ekipy do paneli")
    assert is_job_offer("Poszukuję fachowca od podłóg")
    assert is_job_offer("Zapytanie o układanie paneli PCV")
    assert is_job_offer("Potrzebny montaz paneli")


def test_is_job_offer_negative():
    assert not is_job_offer("Cennik układania paneli")
    assert not is_job_offer("Firma wykonawcza poleca")
    assert not is_job_offer("Kurs montażu paneli")
    assert not is_job_offer("Ranking najlepszych paneli")
    assert not is_job_offer("Sklep z panelami")
    assert not is_job_offer("Ile kosztuje ułożenie paneli")


def test_is_job_offer_noise_overrides():
    assert is_job_offer("Szukam firmy do paneli")  # "firmy" != "firma"
    assert not is_job_offer("Zlecę, ale oferuję też inne usługi")
    assert not is_job_offer("Potrzebuję cennik paneli")
    assert not is_job_offer("Szukam firma poleca")  # "firma" matches


def test_is_job_offer_snippet():
    assert is_job_offer("Montaż paneli", "zlecę wykonanie")
    assert not is_job_offer("Montaż paneli", "cennik 2026")


def test_match_location_known():
    assert match_location("Warszawa") == "Warszawa"
    assert match_location("Kraków") == "Kraków"
    assert match_location("wroclaw") == "Wroclaw"
    assert match_location("GDAŃSK") == "Gdańsk"
    assert match_location("poznań") == "Poznań"


def test_match_location_district():
    assert match_location("Mokotów") == "Mokotów"
    assert match_location("Śródmieście") == "Śródmieście"
    assert match_location("Nowa Huta") == "Nowa huta"


def test_match_location_unknown():
    assert match_location("") == ""
    assert match_location(None) == ""
    assert match_location("Paryż") == ""
    assert match_location("Nowy Jork") == ""


def test_is_offer_url():
    assert is_offer_url("https://www.oferteo.pl/zlecenia-na-ukladanie-paneli-ni1")
    assert is_offer_url("https://olx.pl/uslugi/remonty/")
    assert not is_offer_url("https://forum.gazeta.pl/")
    assert not is_offer_url("https://facebook.com/")
    assert not is_offer_url("")
    assert not is_offer_url(None)


def run():
    tests = [
        test_is_job_offer_positive,
        test_is_job_offer_negative,
        test_is_job_offer_noise_overrides,
        test_is_job_offer_snippet,
        test_match_location_known,
        test_match_location_district,
        test_match_location_unknown,
        test_is_offer_url,
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
    print(f"\nFilter: {p} passed, {f} failed")
