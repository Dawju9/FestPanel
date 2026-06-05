import os
import signal
import sys
import time
from datetime import date, datetime

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import config
from modules.storage import OffersHistoryManager
from modules.classifier import classify_by_age, AGE_LABELS_PL, AGE_ORDER
from modules.exporter import DiscordSender

history_mgr = OffersHistoryManager()
discord = DiscordSender()
running = True


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] [WATCHER] {msg}"
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


def reclassify_all():
    history = history_mgr.load()
    today = date.today()
    changes = {}
    for oid, entry in history.items():
        if not entry.get("active", True):
            continue
        old_group = entry.get("age_group", "unknown")
        new_group = classify_by_age(entry.get("date", ""), today)
        if new_group != old_group:
            entry["age_group"] = new_group
            entry["status_history"].append({
                "date": today.isoformat(),
                "group": new_group,
            })
            changes[oid] = {"title": entry.get("title", ""), "from": old_group, "to": new_group}

    history_mgr.save(history)
    return changes


def deactivate_expired():
    removed = history_mgr.deactivate_old()
    if removed:
        log(f"   Dezaktywowano {removed} wygaslych ofert")
    return removed


def count_groups():
    history = history_mgr.load()
    counts = {g: 0 for g in AGE_ORDER}
    for entry in history.values():
        g = entry.get("age_group", "unknown")
        if entry.get("active", True):
            counts[g] = counts.get(g, 0) + 1
        else:
            counts["expired"] = counts.get("expired", 0) + 1
    return {g: counts[g] for g in AGE_ORDER if counts[g] > 0}


def build_report(changes):
    counts = count_groups()
    lines = ["**Raport Watchera - Podlogi Hunter**", ""]
    lines.append(f"Data: {date.today().isoformat()}")
    lines.append("")
    lines.append("**Podsumowanie ofert:**")
    for group in AGE_ORDER:
        if group in counts and counts[group] > 0:
            pl = AGE_LABELS_PL.get(group, group)
            lines.append(f"   {pl}: {counts[group]}")
    lines.append("")
    if changes:
        lines.append("**Zmiany grup:**")
        for oid, ch in list(changes.items())[:15]:
            from_pl = AGE_LABELS_PL.get(ch["from"], ch["from"])
            to_pl = AGE_LABELS_PL.get(ch["to"], ch["to"])
            lines.append(f"   {ch['title'][:50]}... {from_pl} → {to_pl}")
        if len(changes) > 15:
            lines.append(f"   ... i {len(changes) - 15} innych")
    return "\n".join(lines)


def run_once():
    log("Rozpoczynam cykl klasyfikacji...")
    changes = reclassify_all()
    deactivated = deactivate_expired()
    counts = count_groups()
    total = sum(counts.values())
    log(f"   Ofert aktywnych: {total}")
    for g, c in counts.items():
        log(f"   {AGE_LABELS_PL.get(g, g)}: {c}")
    if changes:
        log(f"   Zmieniono grupy: {len(changes)} ofert")
    if deactivated:
        log(f"   Wygaslo: {deactivated}")

    report = build_report(changes)
    log("Wysylam raport...")
    discord.send_report(report)
    log("Cykl zakonczony.")
    return len(changes)


def daemon():
    global running
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)
    pid_file = os.path.join(config.CRAWLER_DIR, "watcher.pid")
    with open(pid_file, "w") as f:
        f.write(str(os.getpid()))
    log(f"Watcher daemon uruchomiony (PID: {os.getpid()})")
    while running:
        run_once()
        if running:
            for _ in range(86400):
                if not running:
                    break
                time.sleep(1)
    if os.path.exists(pid_file):
        os.remove(pid_file)
    log("Watcher zatrzymany.")


def main():
    if len(sys.argv) > 1 and sys.argv[1] in ("--stop", "-s"):
        pid_file = os.path.join(config.CRAWLER_DIR, "watcher.pid")
        if os.path.exists(pid_file):
            with open(pid_file) as f:
                pid = int(f.read().strip())
            os.kill(pid, signal.SIGTERM)
            print(f"Wyslano SIGTERM do watcher PID {pid}")
        else:
            print("Watcher nie jest uruchomiony")
        return

    if len(sys.argv) > 1 and sys.argv[1] in ("--status", "-st"):
        pid_file = os.path.join(config.CRAWLER_DIR, "watcher.pid")
        if os.path.exists(pid_file):
            with open(pid_file) as f:
                pid = int(f.read().strip())
            try:
                os.kill(pid, 0)
                print(f"Watcher dziala (PID: {pid})")
            except OSError:
                print("Watcher nie zyje (stary PID)")
                os.remove(pid_file)
        else:
            print("Watcher nie jest uruchomiony")
        return

    if "--daemon" in sys.argv or "-d" in sys.argv:
        daemon()
    else:
        run_once()


if __name__ == "__main__":
    main()
