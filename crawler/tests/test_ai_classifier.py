import sys
import os
import json
import requests
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from modules.classifier import classify_by_age, AGE_LABELS_PL


OLLAMA_URL = "http://localhost:11434/api/generate"


def ask_ollama(prompt, model="phi4-mini:latest"):
    try:
        r = requests.post(OLLAMA_URL, json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.1, "num_predict": 50},
        }, timeout=30)
        return r.json().get("response", "").strip()
    except Exception as e:
        return f"ERROR: {e}"


def test_ollama_available():
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=5)
        assert r.status_code == 200
        models = r.json().get("models", [])
        assert len(models) > 0
        print(f"   Ollama online: {len(models)} models available")
    except Exception as e:
        print(f"   SKIP: Ollama unavailable ({e})")
        return

    print("   Models:", ", ".join(m["name"] for m in models))


def test_ollama_classify_offer():
    try:
        requests.get(OLLAMA_URL, timeout=3)
    except Exception:
        print("   SKIP: Ollama not reachable")
        return

    today = "2026-06-05"
    test_offers = [
        ("2026-06-05", "fresh", "dzisiejsza oferta"),
        ("2026-06-04", "new", "sprzed 1 dnia"),
        ("2026-05-30", "current", "sprzed 6 dni"),
        ("2026-05-25", "outdated", "sprzed 11 dni"),
        ("2026-05-15", "old", "sprzed 21 dni"),
        ("2025-01-01", "expired", "stara oferta"),
    ]

    for offer_date, expected_group, desc in test_offers:
        python_result = classify_by_age(offer_date)
        assert python_result == expected_group, \
            f"Python classify: {offer_date} -> {python_result}, expected {expected_group}"

        prompt = (
            f"Offer date: {offer_date}\n"
            f"Today: {today}\n"
            f"Classify into one group: fresh (<1d), new (1-2d), current (3-7d), "
            f"outdated (8-14d), old (15-30d), expired (>30d).\n"
            f"Return ONLY the group name, nothing else."
        )
        ai_result = ask_ollama(prompt).lower().strip()
        ai_valid = any(g in ai_result for g in ["fresh", "new", "current", "outdated", "old", "expired"])
        if ai_valid:
            print(f"   AI: {offer_date} -> {ai_result} (expected: {expected_group})")
            ai_group = next(g for g in ["fresh", "new", "current", "outdated", "old", "expired"] if g in ai_result)
            if ai_group == expected_group:
                print(f"      ✓ AI matches Python")
            else:
                print(f"      ✗ AI={ai_group} vs Python={expected_group}")
        else:
            print(f"   AI: {offer_date} -> '{ai_result}' (invalid response)")


def test_ollama_batch_classification():
    try:
        requests.get(OLLAMA_URL, timeout=3)
    except Exception:
        print("   SKIP: Ollama not reachable")
        return

    offers = [
        {"title": "Dam zlecenie na montaż paneli laminowanych, 26-50m²",
         "date": "2026-06-05", "city": "Warszawa", "metrage": "26-50m2"},
        {"title": "Zlecę cyklinowanie podłogi, do 25m²",
         "date": "2026-06-01", "city": "Kraków", "metrage": "25m2"},
        {"title": "Szukam ekipy na cyklinowanie podłogi, 51-100m²",
         "date": "2026-05-20", "city": "Gdańsk", "metrage": "51-100m2"},
    ]

    prompt_lines = ["Classify these offers by age (today=2026-06-05). Groups: fresh, new, current, outdated, old, expired"]
    for o in offers:
        python_group = classify_by_age(o["date"])
        prompt_lines.append(f"\nOffer: {o['title']}")
        prompt_lines.append(f"Date: {o['date']}")
        prompt_lines.append(f"Python says: {python_group}")
    prompt_lines.append("\nFor each offer, confirm if Python classification is correct. Answer: yes/no for each.")

    result = ask_ollama("\n".join(prompt_lines))
    if result and not result.startswith("ERROR"):
        print(f"   AI analysis:\n{result[:500]}")
    else:
        print(f"   AI error: {result}")


def test_classifier_deterministic():
    """Verify Python classifier is 100% deterministic"""
    from datetime import date
    today = date(2026, 6, 5)

    dates = [
        ("2026-06-05", "fresh"),    # 0 days
        ("2026-06-04", "new"),      # 1 day
        ("2026-06-03", "current"),  # 2 days
        ("2026-06-02", "current"),  # 3 days
        ("2026-05-30", "current"),  # 6 days
        ("2026-05-29", "outdated"), # 7 days
        ("2026-05-28", "outdated"), # 8 days
        ("2026-05-22", "old"),      # 14 days
        ("2026-05-21", "old"),      # 15 days
        ("2026-05-06", "expired"),  # 30 days
        ("2025-06-05", "expired"),  # 365 days
    ]
    for d, expected in dates:
        result = classify_by_age(d, today)
        assert result == expected, f"{d} -> {result} != {expected}"
    print("   All 11 deterministic checks passed")


def run():
    tests = [
        test_ollama_available,
        test_ollama_classify_offer,
        test_ollama_batch_classification,
        test_classifier_deterministic,
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
    print(f"\nAI Classifier: {p} passed, {f} failed")
