import os
import signal
import sys
import time
import random
from datetime import datetime, timezone, date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config
from modules.filter import is_job_offer, match_location
from modules.classifier import classify_offer, analyze_autonomous, AGE_LABELS_PL, AGE_COLORS
from modules.storage import SeenIdsManager, SourcesManager, OffersHistoryManager
from modules.scraper import scrape_oferteo_listing, scrape_oferteo_paginated, discover_multiple_queries
from modules.exporter import DiscordSender, ExcelExporter

seen_ids_mgr = SeenIdsManager()
sources_mgr = SourcesManager()
history_mgr = OffersHistoryManager()
discord = DiscordSender()
excel = ExcelExporter()
running = True


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(config.LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def handle_signal(sig, frame):
    global running
    log("Otrzymano sygnal stop, wylaczam...")
    running = False


def process_offers(offers, seen_ids, label=""):
    new_offers = []
    today = date.today()
    for offer in offers:
        if not running:
            break
        oid = str(offer["id"])
        if oid in seen_ids:
            continue
        if not is_job_offer(offer.get("title", "")):
            continue
        city_match = match_location(offer.get("city", ""))
        if city_match:
            offer["city"] = city_match.title()
        elif not offer.get("city"):
            offer["city"] = ""
        group = classify_offer(offer, today)
        offer["age_group"] = group
        seen_ids.add(oid)
        history_mgr.upsert(offer, group)
        new_offers.append(offer)
        log(f"   NOWE #{oid} | {group:10s} | {offer.get('date',''):10s} | {offer.get('city',''):12s} | {offer.get('metrage',''):10s} | {offer.get('name',''):12s} | {offer.get('title','')[:50]}")
    return new_offers


def report_analysis(groups, stats):
    lines = []
    lines.append(f"**Raport autonomiczny - Podlogi Hunter**")
    lines.append(f"Data: {date.today().isoformat()}")
    lines.append("")
    lines.append(f"Liczba ofert: {stats['total']}")
    for group in ["fresh", "new", "current", "outdated", "old", "expired", "unknown"]:
        count = len(groups[group])
        if count > 0:
            pl = AGE_LABELS_PL.get(group, group)
            lines.append(f"   {pl}: {count}")
    lines.append("")
    if stats["with_name"] > 0:
        lines.append(f"Z nazwami kontaktu: {stats['with_name']}")
    if stats["private_persons"] > 0:
        lines.append(f"Osoby prywatne: {stats['private_persons']}")
    if stats["companies"] > 0:
        lines.append(f"Firmy: {stats['companies']}")
    if stats["cities"]:
        top_cities = sorted(stats["cities"].items(), key=lambda x: -x[1])[:5]
        lines.append(f"Top miasta: {', '.join(f'{c}({n})' for c, n in top_cities)}")
    return "\n".join(lines)


def autonomous_pipeline(mode_name):
    log("=" * 60)
    log(f"TRYB {'A' if mode_name == 'basic' else 'B'} | AUTONOMICZNY")
    log("=" * 60)

    seen_ids = seen_ids_mgr.load()
    all_new = []

    for slug, label in config.OFERTEO_QUERIES:
        if not running:
            break
        log(f"\n--- {label} ---")
        offers, total_pages = scrape_oferteo_listing(
            f"https://www.oferteo.pl/zlecenia-na-{slug}-ni1", label
        )
        log(f"   Pobrano {len(offers)} ofert, {total_pages} stron")
        new_offers = process_offers(offers, seen_ids, label)
        all_new.extend(new_offers)
        time.sleep(random.uniform(0.5, 1.5))

        if mode_name == "agent" and total_pages > 1:
            max_p = min(total_pages, 3)
            for pg in range(2, max_p + 1):
                if not running:
                    break
                more, _ = scrape_oferteo_listing(
                    f"https://www.oferteo.pl/zlecenia-na-{slug}-ni1?page={pg}", label
                )
                n2 = process_offers(more, seen_ids, label)
                all_new.extend(n2)
                time.sleep(random.uniform(0.5, 1.5))

    if mode_name == "agent":
        log(f"\n--- Odkrywanie zrodel ---")
        discovered = discover_multiple_queries()
        if discovered:
            added = sources_mgr.add_if_new(discovered)
            log(f"   Odkryto {len(discovered)} zrodel, nowych: {len(added)}")
            for src in added[:5]:
                log(f"      {src['url']}")
        log(f"\n--- Wykonanie taskow ---")
        if os.path.exists(config.TASKS_DIR):
            for fname in sorted(os.listdir(config.TASKS_DIR)):
                if fname.endswith(".md"):
                    log(f"   Task: {fname}")

    seen_ids_mgr.save(seen_ids)

    today = date.today()
    all_offers = [o for o in all_new] + [
        v for v in history_mgr.get_active().values()
    ]
    groups, stats = analyze_autonomous(all_new if all_new else list(history_mgr.get_active().values()), today)

    if all_new:
        log(f"\n--- NOWE ZLECENIA: {len(all_new)} ---")
        for g in ["fresh", "new", "current"]:
            for o in groups[g]:
                log(f"   [{AGE_LABELS_PL[g]:10s}] #{o['id']} | {o['city']:12s} | {o['metrage']:10s} | {o['name']:12s} | {o['title'][:50]}")
        discord.send_offers(all_new)
        fname = excel.save(all_new)
        if fname:
            log(f"   Excel: {fname}")
        for o in all_new:
            history_mgr.mark_notified(str(o["id"]))
    else:
        log(f"\nBrak nowych.")

    analysis = analyze_autonomous(list(history_mgr.get_active().values()), today)
    groups2, stats2 = analysis
    log(f"\n--- ANALIZA AUTONOMICZNA ---")
    log(f"   Ofert aktywnych: {stats2['total']}")
    for g in ["fresh", "new", "current", "outdated", "old"]:
        c = len(groups2[g])
        if c > 0:
            log(f"   {AGE_LABELS_PL[g]}: {c}")
    if stats2['private_persons'] > 0:
        log(f"   Osoby prywatne: {stats2['private_persons']}")
    if stats2['companies'] > 0:
        log(f"   Firmy: {stats2['companies']}")
    if stats2['cities']:
        top = sorted(stats2['cities'].items(), key=lambda x: -x[1])[:5]
        log(f"   Top miasta: {', '.join(f'{c}({n})' for c, n in top)}")

    return len(all_new)


def daemon_loop(mode_name):
    global running
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)
    with open(config.PID_FILE, "w") as f:
        f.write(str(os.getpid()))
    log(f"Demon uruchomiony (PID: {os.getpid()}), interwal: {config.DAEMON_INTERVAL}s, tryb: {mode_name}")
    while running:
        autonomous_pipeline(mode_name)
        if running:
            log(f"Sleep {config.DAEMON_INTERVAL}s...")
            for _ in range(config.DAEMON_INTERVAL):
                if not running:
                    break
                time.sleep(1)
    if os.path.exists(config.PID_FILE):
        os.remove(config.PID_FILE)
    log("Demon zatrzymany.")


def main():
    if len(sys.argv) > 1 and sys.argv[1] in ("--stop", "-s"):
        if os.path.exists(config.PID_FILE):
            with open(config.PID_FILE) as f:
                pid = int(f.read().strip())
            os.kill(pid, signal.SIGTERM)
            print(f"Wyslano SIGTERM do PID {pid}")
        else:
            print("Demon nie jest uruchomiony")
        return

    if len(sys.argv) > 1 and sys.argv[1] in ("--status", "-st"):
        if os.path.exists(config.PID_FILE):
            with open(config.PID_FILE) as f:
                pid = int(f.read().strip())
            try:
                os.kill(pid, 0)
                print(f"Demon dziala (PID: {pid})")
            except OSError:
                print(f"Stary PID ({pid}), demon nie zyje")
                os.remove(config.PID_FILE)
        else:
            print("Demon nie jest uruchomiony")
        return

    mode = "agent" if "--mode" in sys.argv and "agent" in sys.argv else "basic"
    is_daemon = "--daemon" in sys.argv or "-d" in sys.argv
    mode_label = "AGENT (B)" if mode == "agent" else "BASIC (A)"

    print(f"\nPodlogi Hunter v4 | Tryb: {mode_label} | AUTONOMICZNY")
    if is_daemon:
        daemon_loop(mode)
    else:
        autonomous_pipeline(mode)


if __name__ == "__main__":
    main()
