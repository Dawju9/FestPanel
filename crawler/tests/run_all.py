#!/usr/bin/env python3
"""Run all module tests individually"""

import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

TESTS = [
    "test_parser",
    "test_filter",
    "test_classifier",
    "test_storage",
    "test_exporter",
    "test_watcher",
    "test_scraper",
    "test_ai_classifier",
]


def run_all():
    total_p = 0
    total_f = 0
    start = time.time()

    print("=" * 60)
    print("Podlogi Hunter v3 - Testy modulowe")
    print("=" * 60)

    for tname in TESTS:
        print(f"\n--- {tname} ---")
        try:
            mod = __import__(tname)
        except ImportError:
            print(f"  SKIP: cannot import {tname}")
            continue
        p, f = mod.run()
        total_p += p
        total_f += f

    elapsed = time.time() - start
    print("\n" + "=" * 60)
    print(f"SUMA: {total_p} passed, {total_f} failed ({elapsed:.2f}s)")
    print("=" * 60)

    return total_f == 0


if __name__ == "__main__":
    success = run_all()
    sys.exit(0 if success else 1)
