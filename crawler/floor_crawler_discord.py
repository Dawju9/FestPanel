import requests
from bs4 import BeautifulSoup
import time
import pandas as pd
import json
import random
from urllib.parse import quote
from datetime import datetime
import os
from dotenv import load_dotenv
from duckduckgo_search import DDGS

load_dotenv()

# ================== KONFIGURACJA ==================
DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")

QUERIES = [
    "Zlecę położenie paneli podłogowych",
    "Zlecę układanie paneli",
    "montaż paneli winylowych zlecenie",
    "potrzebny montaż paneli podłogowych",
    "zlecę panele winylowe OR montaż paneli PCV",
    "przygotowanie podłoża pod panele zlecę",
    '"zlecę położenie paneli" OR "układanie paneli zlecę"',
    "zlecę cyklinowanie podłóg",
]

SITES = ["olx.pl", "fixly.pl", "oferteo.pl", "zleca.pl", "zleceniomat.pl", "forum", "muratordom", "eurobudowa"]

SEEN_FILE = "seen_links.json"


def load_seen():
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()


def save_seen(seen):
    with open(SEEN_FILE, "w", encoding="utf-8") as f:
        json.dump(list(seen), f, ensure_ascii=False, indent=2)


def send_discord(new_results):
    if not DISCORD_WEBHOOK or not new_results:
        return

    for res in new_results[:8]:
        embed = {
            "title": res["title"][:256],
            "url": res["link"],
            "description": res["snippet"][:500],
            "color": 0x00ff00,
            "fields": [
                {"name": "Zapytanie", "value": res["query"], "inline": True},
                {"name": "Źródło", "value": res["link"].split("/")[2], "inline": True},
            ],
            "timestamp": datetime.utcnow().isoformat(),
        }

        data = {
            "username": "Podłogi Hunter",
            "embeds": [embed],
            "content": "🔨 **Nowe zlecenie na podłogi!**",
        }

        try:
            requests.post(DISCORD_WEBHOOK, json=data, timeout=10)
            time.sleep(1)
        except Exception:
            pass


def search_leads(query, max_results=15):
    results = []
    try:
        with DDGS() as ddgs:
            for r in list(ddgs.text(query, region="pl-pl", max_results=max_results)):
                link = r.get("href", "") or ""
                if not any(site in link for site in SITES):
                    continue
                results.append(
                    {
                        "title": r.get("title", ""),
                        "link": link,
                        "snippet": r.get("body", "")[:350],
                        "query": query,
                    }
                )
    except Exception as e:
        print(f"   ❌ Błąd: {e}")
    return results


def main():
    seen = load_seen()
    all_new = []
    print("🚀 Uruchamiam Podłogi Hunter z DuckDuckGo...\n")

    for q in QUERIES:
        print(f"🔍 Szukam: {q}")
        results = search_leads(q)

        for r in results:
            if r["link"] not in seen:
                seen.add(r["link"])
                all_new.append(r)
                print(f"   ✅ NOWE: {r['title'][:70]}...")

        time.sleep(random.uniform(1, 3))

    if all_new:
        send_discord(all_new)
        df = pd.DataFrame(all_new)
        filename = f"nowe_zlecenia_podlogi_{time.strftime('%Y%m%d_%H%M')}.xlsx"
        df.to_excel(filename, index=False)

        print(f"\n🎉 Znaleziono {len(all_new)} NOWYCH zleceń!")
        print(f"💾 Zapisano do: {filename}")
        save_seen(seen)
    else:
        print("🟢 Brak nowych zleceń tym razem.")


if __name__ == "__main__":
    main()
