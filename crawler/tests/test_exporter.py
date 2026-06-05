import sys
import os
import json
import tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.exporter import DiscordSender, ExcelExporter


def test_discord_embed_building():
    discord = DiscordSender("https://discord.com/api/webhooks/test")
    offers = [
        {
            "id": "12345",
            "date": "2026-06-05",
            "city": "Warszawa",
            "metrage": "26-50m2",
            "price": "1000zł",
            "source": "oferteo.pl",
            "title": "Test zlecenie na montaż paneli",
            "url": "https://example.com",
            "query": "ukladanie-paneli",
            "age_group": "fresh",
            "snippet": "",
        }
    ]

    discord.send_offers(offers)
    # No assertion needed - just verify no crash with test webhook


def test_discord_empty():
    discord = DiscordSender("https://discord.com/api/webhooks/test")
    discord.send_offers([])
    discord.send_offers(None)


def test_excel_export():
    with tempfile.TemporaryDirectory() as tmpdir:
        orig = os.getcwd()
        os.chdir(tmpdir)
        try:
            exporter = ExcelExporter(max_files=5)
            offers = [
                {"id": "1", "title": "Oferta 1", "city": "Warszawa",
                 "date": "2026-06-05", "metrage": "26m2", "source": "oferteo.pl"},
                {"id": "2", "title": "Oferta 2", "city": "Kraków",
                 "date": "2026-06-04", "metrage": "50m2", "source": "oferteo.pl"},
            ]
            fname = exporter.save(offers)
            assert fname is not None
            assert fname.endswith(".xlsx")
            assert os.path.exists(fname)
        finally:
            os.chdir(orig)


def test_excel_empty():
    with tempfile.TemporaryDirectory() as tmpdir:
        orig = os.getcwd()
        os.chdir(tmpdir)
        try:
            exporter = ExcelExporter()
            fname = exporter.save([])
            assert fname is None
        finally:
            os.chdir(orig)


def run():
    tests = [
        test_discord_embed_building,
        test_discord_empty,
        test_excel_export,
        test_excel_empty,
    ]
    passed = 0
    failed = 0
    for t in tests:
        try:
            t()
            print(f"  ✓ {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  ✗ {t.__name__}: {e}")
            failed += 1
    return passed, failed


if __name__ == "__main__":
    p, f = run()
    print(f"\nExporter: {p} passed, {f} failed")
