import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.watcher import classify_by_age, count_groups, AGE_LABELS_PL


# Test the watcher's core logic via imported modules
def test_watcher_classify_pipeline():
    from datetime import date, timedelta
    from modules.watcher import reclassify_all, deactivate_expired
    from modules.storage import OffersHistoryManager
    import tempfile
    import json

    today = date(2026, 6, 5)
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        fname = f.name
        json.dump({
            "fresh_offer": {
                "id": "fresh_offer", "title": "Fresh", "date": "2026-06-05",
                "city": "Warszawa", "active": True, "age_group": "new",
                "status_history": [{"date": "2026-06-04", "group": "fresh"}],
            },
            "outdated_offer": {
                "id": "outdated_offer", "title": "Outdated", "date": "2026-05-28",
                "city": "Kraków", "active": True, "age_group": "current",
                "status_history": [{"date": "2026-05-28", "group": "current"}],
            },
            "old_offer": {
                "id": "old_offer", "title": "Stary", "date": "2026-05-10",
                "city": "Gdańsk", "active": True, "age_group": "current",
                "status_history": [{"date": "2026-05-10", "group": "current"}],
            },
            "expired_offer": {
                "id": "expired_offer", "title": "Wygasly", "date": "2025-01-01",
                "city": "Poznań", "active": True, "age_group": "old",
                "status_history": [{"date": "2025-01-01", "group": "old"}],
            },
        }, f)
        f.close()

        import config
        original = config.OFFERS_HISTORY_FILE
        config.OFFERS_HISTORY_FILE = fname

        mgr = OffersHistoryManager(fname)
        # Hijack reclassify to test on our data
        history = mgr.load()
        for oid, entry in history.items():
            if not entry.get("active", True):
                continue
            old_group = entry.get("age_group", "unknown")
            new_group = classify_by_age(entry.get("date", ""), today)
            assert new_group is not None
            entry["age_group"] = new_group
        mgr.save(history)

        history = mgr.load()
        assert history["fresh_offer"]["age_group"] == "fresh"
        assert history["outdated_offer"]["age_group"] == "outdated"
        assert history["old_offer"]["age_group"] == "old"
        assert history["expired_offer"]["age_group"] == "expired"

        config.OFFERS_HISTORY_FILE = original
        os.unlink(fname)


def test_age_labels_integrity():
    from modules.classifier import AGE_LABELS_PL
    assert len(AGE_LABELS_PL) == 7
    assert "fresh" in AGE_LABELS_PL
    assert "expired" in AGE_LABELS_PL


def run():
    tests = [
        test_watcher_classify_pipeline,
        test_age_labels_integrity,
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
    print(f"\nWatcher: {p} passed, {f} failed")
