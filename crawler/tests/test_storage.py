import sys
import os
import json
import tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.storage import SeenIdsManager, SourcesManager, OffersHistoryManager


def test_seen_ids():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        fname = f.name
        json.dump(["id1", "id2"], f)

    mgr = SeenIdsManager(fname)
    ids = mgr.load()
    assert "id1" in ids
    assert "id2" in ids
    assert "id3" not in ids

    mgr.add("id3")
    ids = mgr.load()
    assert "id3" in ids
    assert len(ids) == 3

    os.unlink(fname)


def test_seen_ids_empty():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        fname = f.name
        json.dump([], f)

    mgr = SeenIdsManager(fname)
    ids = mgr.load()
    assert len(ids) == 0

    os.unlink(fname)


def test_sources():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        fname = f.name
        json.dump([], f)

    mgr = SourcesManager(fname)
    sources = mgr.load()
    assert sources == []

    added = mgr.add_if_new([{"url": "https://example.com", "title": "test"}])
    assert len(added) == 1
    assert mgr.exists("https://example.com")

    added2 = mgr.add_if_new([{"url": "https://example.com", "title": "dupe"}])
    assert len(added2) == 0

    os.unlink(fname)


def test_offers_history():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        fname = f.name
        json.dump({}, f)

    mgr = OffersHistoryManager(fname)
    offer = {
        "id": "12345",
        "title": "Test zlecenie",
        "date": "2026-06-05",
        "city": "Warszawa",
        "metrage": "26-50m2",
        "source": "oferteo.pl",
        "url": "https://example.com",
        "query": "ukladanie-paneli",
    }

    mgr.upsert(offer, "fresh")
    history = mgr.load()
    assert "12345" in history
    assert history["12345"]["age_group"] == "fresh"
    assert len(history["12345"]["status_history"]) == 1
    assert history["12345"]["active"] == True
    assert history["12345"]["notified"] == False

    mgr.mark_notified("12345")
    history = mgr.load()
    assert history["12345"]["notified"] == True

    mgr.upsert(offer, "new")
    history = mgr.load()
    assert history["12345"]["age_group"] == "new"
    assert len(history["12345"]["status_history"]) == 2

    active = mgr.get_active()
    assert "12345" in active

    fresh = mgr.get_by_age_group("new")
    assert "12345" in fresh

    os.unlink(fname)


def test_offers_history_deactivate():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        fname = f.name
        json.dump({}, f)

    mgr = OffersHistoryManager(fname)
    offer = {
        "id": "oldie",
        "title": "Stara oferta",
        "date": "2024-01-01",
        "city": "Kraków",
        "metrage": "10m2",
        "source": "oferteo.pl",
        "url": "",
        "query": "test",
    }

    mgr.upsert(offer, "old")
    changed = mgr.deactivate_old(max_days=30)
    assert changed == 1

    history = mgr.load()
    assert history["oldie"]["active"] == False
    assert history["oldie"]["age_group"] == "expired"

    os.unlink(fname)


def run():
    tests = [
        test_seen_ids,
        test_seen_ids_empty,
        test_sources,
        test_offers_history,
        test_offers_history_deactivate,
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
    print(f"\nStorage: {p} passed, {f} failed")
