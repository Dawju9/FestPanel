import sys
import os
from datetime import date, timedelta
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.classifier import classify_by_age, AGE_LABELS_PL, AGE_ORDER, AGE_COLORS


TODAY = date(2026, 6, 5)


def test_classify_fresh():
    fmt = TODAY.isoformat()
    assert classify_by_age(fmt, TODAY) == "fresh"
    assert classify_by_age(fmt) == "fresh"


def test_classify_new():
    d = (TODAY - timedelta(days=1)).isoformat()
    assert classify_by_age(d, TODAY) == "new"
    d2 = (TODAY - timedelta(days=1, hours=1)).isoformat()
    # only date matters, should still be new (1 day old)
    assert classify_by_age(d2, TODAY) == "new"


def test_classify_current():
    d = (TODAY - timedelta(days=2)).isoformat()
    assert classify_by_age(d, TODAY) == "current", f"{d} should be current"
    d2 = (TODAY - timedelta(days=3)).isoformat()
    assert classify_by_age(d2, TODAY) == "current"
    d3 = (TODAY - timedelta(days=6)).isoformat()
    assert classify_by_age(d3, TODAY) == "current"


def test_classify_outdated():
    d = (TODAY - timedelta(days=8)).isoformat()
    assert classify_by_age(d, TODAY) == "outdated"
    d2 = (TODAY - timedelta(days=13)).isoformat()
    assert classify_by_age(d2, TODAY) == "outdated"


def test_classify_old():
    d = (TODAY - timedelta(days=15)).isoformat()
    assert classify_by_age(d, TODAY) == "old"
    d2 = (TODAY - timedelta(days=29)).isoformat()
    assert classify_by_age(d2, TODAY) == "old"


def test_classify_expired():
    d = (TODAY - timedelta(days=31)).isoformat()
    assert classify_by_age(d, TODAY) == "expired"
    d2 = (TODAY - timedelta(days=365)).isoformat()
    assert classify_by_age(d2, TODAY) == "expired"


def test_classify_unknown():
    assert classify_by_age("", TODAY) == "unknown"
    assert classify_by_age(None, TODAY) == "unknown"
    assert classify_by_age("invalid-date", TODAY) == "unknown"
    assert classify_by_age("2026-13-01", TODAY) == "unknown"


def test_classify_future_date():
    d = (TODAY + timedelta(days=1)).isoformat()
    assert classify_by_age(d, TODAY) == "fresh"


def test_age_labels_exist():
    for group in AGE_ORDER:
        assert group in AGE_LABELS_PL
        assert isinstance(AGE_LABELS_PL[group], str)
        assert len(AGE_LABELS_PL[group]) > 0


def test_age_colors_exist():
    for group in AGE_ORDER:
        assert group in AGE_COLORS
        assert isinstance(AGE_COLORS[group], int)


def run():
    tests = [
        test_classify_fresh,
        test_classify_new,
        test_classify_current,
        test_classify_outdated,
        test_classify_old,
        test_classify_expired,
        test_classify_unknown,
        test_classify_future_date,
        test_age_labels_exist,
        test_age_colors_exist,
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
    print(f"\nClassifier: {p} passed, {f} failed")
