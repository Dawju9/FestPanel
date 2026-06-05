import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

ALL_TESTS = [
    ("Parser", "test_parser"),
    ("Filter", "test_filter"),
    ("Classifier", "test_classifier"),
    ("Storage", "test_storage"),
    ("Exporter", "test_exporter"),
    ("Watcher", "test_watcher"),
    ("Scraper (network)", "test_scraper"),
    ("AI Classifier (Ollama)", "test_ai_classifier"),
]


def run_all():
    results = {}
    total_p = 0
    total_f = 0
    start = time.time()

    print("=" * 60)
    print("Podlogi Hunter - Suite testow modulowych")
    print("=" * 60)

    for label, module_name in ALL_TESTS:
        print(f"\n--- {label} ---")
        try:
            mod = __import__(f"test_{module_name.split('_', 1)[1] if '_' in module_name else module_name}")
            # Actually, just import by full name
            mod = __import__(module_name)
        except ImportError:
            mod = __import__(f"tests.{module_name}", fromlist=[""])

        p, f = mod.run()
        results[label] = (p, f)
        total_p += p
        total_f += f

    elapsed = time.time() - start
    print("\n" + "=" * 60)
    print(f"SUMA: {total_p} passed, {total_f} failed ({elapsed:.2f}s)")
    print("=" * 60)

    for label, (p, f) in results.items():
        status = "✓" if f == 0 else "✗"
        print(f"  {status} {label}: {p}/{p+f}")

    return total_f == 0


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)
