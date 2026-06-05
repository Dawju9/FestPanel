import requests
from bs4 import BeautifulSoup
import time
import pandas as pd
import json
import random
import re
import sys
import hashlib
import signal
import glob
import os
from urllib.parse import quote, urljoin
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")
DAEMON_INTERVAL = int(os.getenv("CRAWLER_INTERVAL", "3600"))
MAX_EXCEL_FILES = int(os.getenv("CRAWLER_MAX_EXCEL", "20"))
PID_FILE = "crawler.pid"
LOG_FILE = "crawler.log"
SEEN_IDS_FILE = "seen_ids.json"
SOURCES_FILE = "knowledge/sources.json"
KEYWORDS_FILE = "knowledge/keywords.json"

# === QUERIES ===
OFERTEO_QUERIES = [
    ("ukladanie-paneli", "Układanie paneli"),
    ("cyklinowanie", "Cyklinowanie podłóg"),
    ("posadzki", "Posadzki"),
    ("wykladziny-podlogowe", "Wykładziny podłogowe"),
]

# === LOCATIONS ===
LOCATIONS = [
    "warszawa", "krakow", "kraków", "wroclaw", "wrocław", "poznan", "poznań",
    "lodz", "łódź", "gdansk", "gdańsk", "gdynia", "sopot", "szczecin",
    "bydgoszcz", "torun", "toruń", "lublin", "katowice", "rzeszow", "rzeszów",
    "olsztyn", "bialystok", "białystok", "czestochowa", "częstochowa",
    "radom", "kielce", "opole", "gorzow", "gorzów", "zielona gora", "zielona góra",
    "tarnobrzeg", "sandomierz", "swidnik", "świdnik", "elblag", "elbląg",
    "plock", "płock", "wloclawek", "włocławek", "tarnow", "tarnów",
    "krosno", "przemysl", "przemyśl", "zamosc", "zamość", "chelm", "chełm",
    "biala podlaska", "biala", "siedlce", "lomza", "łomża", "ostroleka", "ostrołęka",
    "suwalki", "suwałki", "ełk", "legnica", "walbrzych", "wałbrzych",
    "jelenia gora", "jelenia góra", "kalisz", "konin", "koniń", "leszno",
    "piotrkow", "piotrków", "skierniewice", "sieradz", "nowy sacz", "nowy sącz",
    "nowy targ", "zakopane", "gliwice", "zabrze", "rybnik", "tychy", "bielsko",
    "bielsko-biala", "będzin", "dabrowa gornicza", "dąbrowa górnicza",
    "jaworzno", "sosnowiec", "mikolow", "myslowice", "ruda slaska", "ruda śląska",
    "chorzow", "chorzów", "jastrzebie", "jastrzębie", "swietochlowice",
    "siemianowice", "piekary", "bytom", "ciechanow", "ciechanów",
    "ostrow", "ostrów", "ostrow wielkopolski",
    # Warszawa dzielnice
    "mokotow", "mokotów", "praga", "srodmiescie", "śródmieście",
    "ochota", "wola", "bielany", "ursynow", "ursynów", "wlochy", "włochy",
    "targowek", "targówek", "bemowo", "wesola", "wesoła", "wawer",
    "wilanow", "wilanów", "ursus", "bialoleka", "białołęka", "zoliborz", "żoliborz",
    "rembertow", "rembertów",
    # Kraków
    "krowodrza", "zwierzyniec", "grzegorzki", "grzegórzki",
    "podgorze", "podgórze", "nowa huta", "pradnik", "prądnik", "bronowice",
    # Wrocław
    "fabryczna", "krzyki", "psie pole", "stare miasto",
    # Poznań
    "jezyce", "jeżyce", "starowka", "starówka", "wilda", "grunwald", "nowe miasto",
    # Gdańsk
    "orunia", "wrzeszcz", "przymorze", "zabianka", "żabianka",
]

# === KEYWORDS ===
JOB_INDICATORS = [
    "zlecę", "zlece", "szukam", "potrzebuję", "potrzebuje", "poszukuję", "poszukuje",
    "dam zlecenie", "zapytanie o", "zlecę usługę", "zlec", "potrzebny",
]

NOISE_INDICATORS = [
    "cena", "cennik", "koszt", "ranking", "najlepszych", "opinie", "firma",
    "wykonawca", "specjalista", "ile kosztuje", "sprzedam", "kupię", "kupie",
    "oferuję", "oferuje", "wykonam", "producent", "sklep", "promocja",
    "wynajmę", "wynajme", "kurs", "szkolenie", "poradnik",
]

METRAGE_PATTERN = re.compile(r'(\d+)\s*(?:[-–])\s*(\d+)\s*m[²2]|(\d+)\s*m[²2]')

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
})

running = True


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def handle_signal(sig, frame):
    global running
    log("Otrzymano sygnal stop, wylaczam...")
    running = False


def load_ids():
    if os.path.exists(SEEN_IDS_FILE):
        with open(SEEN_IDS_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()


def save_ids(ids):
    with open(SEEN_IDS_FILE, "w", encoding="utf-8") as f:
        json.dump(list(ids), f, ensure_ascii=False, indent=2)


def load_sources():
    if os.path.exists(SOURCES_FILE):
        with open(SOURCES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_sources(sources):
    os.makedirs(os.path.dirname(SOURCES_FILE), exist_ok=True)
    with open(SOURCES_FILE, "w", encoding="utf-8") as f:
        json.dump(sources, f, ensure_ascii=False, indent=2)


def load_keywords():
    if os.path.exists(KEYWORDS_FILE):
        with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_keywords(kw):
    os.makedirs(os.path.dirname(KEYWORDS_FILE), exist_ok=True)
    with open(KEYWORDS_FILE, "w", encoding="utf-8") as f:
        json.dump(kw, f, ensure_ascii=False, indent=2)


def cleanup_old_excel():
    files = sorted(glob.glob("zlecenia_podlogi_*.xlsx"))
    while len(files) > MAX_EXCEL_FILES:
        os.remove(files[0])
        log(f"   Usunieto stary plik: {files[0]}")
        files = files[1:]


def parse_metrage(title):
    m = METRAGE_PATTERN.search(title)
    if m:
        if m.group(3):
            return f"{m.group(3)}m2"
        else:
            return f"{m.group(1)}-{m.group(2)}m2"
    return ""


def match_location(city):
    if not city:
        return ""
    c = city.lower().strip()
    for loc in LOCATIONS:
        if loc in c or c in loc:
            return loc.capitalize()
    return ""


def is_job_offer(title, snippet=""):
    text = (title + " " + snippet).lower()
    has_job = any(ind in text for ind in JOB_INDICATORS)
    has_noise = any(noi in text for noi in NOISE_INDICATORS)
    return has_job and not has_noise


def send_discord(offers):
    if not DISCORD_WEBHOOK or not offers:
        return

    batch = []
    for offer in offers[:8]:
        color = 0x00b8d4
        fields = [
            {"name": "ID", "value": str(offer.get("id", "")), "inline": True},
            {"name": "Data", "value": offer.get("date", ""), "inline": True},
            {"name": "Lokalizacja", "value": offer.get("city", "?"), "inline": True},
        ]
        if offer.get("metrage"):
            fields.append({"name": "Metraz", "value": offer["metrage"], "inline": True})
        if offer.get("price"):
            fields.append({"name": "Cena", "value": offer["price"], "inline": True})
        if offer.get("source"):
            fields.append({"name": "Zrodlo", "value": offer["source"], "inline": True})

        embed = {
            "title": (offer.get("title", "Bez tytulu")[:200]),
            "url": offer.get("url", ""),
            "description": (offer.get("snippet", "")[:400] if offer.get("snippet") else ""),
            "color": color,
            "fields": fields,
            "footer": {"text": f"Podlogi Hunter v3 | {offer.get('query', '')}"},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        batch.append(embed)

    if batch:
        data = {
            "username": "Podlogi Hunter",
            "content": f"**Znaleziono {len(batch)} nowych zlecen!**",
            "embeds": batch,
        }
        try:
            r = requests.post(DISCORD_WEBHOOK, json=data, timeout=10)
            if r.status_code == 204:
                log(f"   Wyslano {len(batch)} powiadomien na Discorda")
            else:
                log(f"   Discord odpowiedzial kodem {r.status_code}")
        except Exception as e:
            log(f"   Blad wysylki Discord: {e}")


def save_excel(offers, filename_prefix="zlecenia_podlogi"):
    if not offers:
        return None
    df = pd.DataFrame(offers)
    filename = f"{filename_prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    df.to_excel(filename, index=False)
    return filename


# ========================
# MODE A: BASIC
# ========================
def scrape_oferteo_listing(url, query_label=""):
    try:
        r = session.get(url, timeout=15)
        if r.status_code != 200:
            return [], 1
        soup = BeautifulSoup(r.text, "lxml")
        items = soup.select("[data-rfp-id]")
        offers = []
        for item in items:
            rfp_id = item.get("data-rfp-id", "")
            if not rfp_id:
                continue

            title_el = item.select_one("[data-test='rfp_list__item__title']")
            date_el = item.select_one("[data-test='rfp_list__item__date']")
            city_el = item.select_one("[data-test='rfp_list__item__location_city']")
            name_el = item.select_one("[data-test='rfp_list__item__first_name']")

            title = title_el.get_text(strip=True) if title_el else ""
            date = date_el.get("title", "") if date_el else ""
            city = city_el.get_text(strip=True) if city_el else ""
            name = name_el.get_text(strip=True) if name_el else ""
            metrage = parse_metrage(title)

            offers.append({
                "id": rfp_id,
                "date": date,
                "title": title,
                "city": city,
                "name": name,
                "metrage": metrage,
                "source": "oferteo.pl",
                "url": url,
                "query": query_label,
            })

        pagination = soup.get_text()
        pages = re.search(r'(\d+)\s*z\s*(\d+)', pagination)
        total_pages = int(pages.group(2)) if pages else 1
        log(f"   Oferteo: {len(offers)} ofert, {total_pages} stron")
        return offers, total_pages

    except Exception as e:
        log(f"   Blad scrapowania Oferteo: {e}")
        return [], 1


def discover_new_sources_ddg(query, label=""):
    try:
        from ddgs import DDGS
        new_sources = []
        with DDGS() as ddgs:
            for r in ddgs.text(query + " zlecenie montaz paneli podlogowych", region="pl-pl", max_results=10):
                link = r.get("href", "") or ""
                title = r.get("title", "") or ""

                is_listing = False
                site_name = ""
                for site_pattern, sname in [
                    ("oferteo.pl/zlecenia", "oferteo"),
                    ("olx.pl/uslugi", "olx"),
                    ("zleca.pl/zlecenia", "zleca"),
                    ("zleceniomat.pl", "zleceniomat"),
                    ("ekspertbudowlany.pl/zlecenia", "ekspertbudowlany"),
                    ("znajdzwykonawce.pl", "znajdzwykonawce"),
                ]:
                    if site_pattern in link:
                        is_listing = True
                        site_name = sname
                        break

                if is_listing:
                    new_sources.append({
                        "url": link,
                        "site": site_name,
                        "title": title[:100],
                        "found_by": label,
                        "found_at": datetime.now(timezone.utc).isoformat(),
                        "active": True,
                    })
        return new_sources
    except Exception as e:
        log(f"   Blad DDG discovery: {e}")
        return []


def run_mode_a():
    seen_ids = load_ids()
    all_offers = []
    new_count = 0

    log("=" * 50)
    log("TRYB A: Bezposrednie scrapowanie Oferteo")
    log("=" * 50)

    for slug, label in OFERTEO_QUERIES:
        if not running:
            break
        url = f"https://www.oferteo.pl/zlecenia-na-{slug}-ni1"
        log(f"\n[{label}] {url}")
        offers, total_pages = scrape_oferteo_listing(url, label)

        for offer in offers:
            if not running:
                break
            if offer["id"] in seen_ids:
                continue
            if not is_job_offer(offer["title"]):
                continue

            city_match = match_location(offer["city"])
            if city_match:
                offer["city"] = city_match
            elif not offer["city"]:
                continue

            seen_ids.add(offer["id"])
            all_offers.append(offer)
            new_count += 1
            log(f"   NOWE #{offer['id']} | {offer['date']} | {offer['city']} | {offer['metrage']:8s} | {offer['title'][:60]}")

        time.sleep(random.uniform(0.5, 1.5))

    # Mode A also: discover new sources via DDG (silent, no AI)
    log("\n--- Odkrywanie zrodel (DDG) ---")
    new_sources_global = []
    for _, label in OFERTEO_QUERIES:
        if not running:
            break
        sources = discover_new_sources_ddg(label, label)
        for s in sources:
            s_exists = any(ex["url"] == s["url"] for ex in load_sources())
            if not s_exists:
                new_sources_global.append(s)
        time.sleep(1)

    if new_sources_global:
        existing = load_sources()
        existing.extend(new_sources_global)
        save_sources(existing)
        log(f"   Odkryto {len(new_sources_global)} nowych zrodel!")

    if all_offers:
        send_discord(all_offers)
        filename = save_excel(all_offers)
        save_ids(seen_ids)
        log(f"\nZebrano {new_count} NOWYCH zlecen!")
        if filename:
            log(f"Zapisano do: {filename}")
    else:
        log("\nBrak nowych zlecen.")

    return new_count


# ========================
# MODE B: AGENT
# ========================
def load_tasks():
    task_dir = "tasks"
    tasks = []
    if os.path.exists(task_dir):
        for f in sorted(glob.glob(os.path.join(task_dir, "*.md"))):
            with open(f, "r", encoding="utf-8") as fh:
                tasks.append({"file": f, "content": fh.read()})
    return tasks


def scrape_olx_offer(url):
    try:
        r = session.get(url, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "lxml")

        scripts = soup.find_all("script", type="application/ld+json")
        data = None
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and data.get("@type") in ("Service", "Product", "ItemPage"):
                    break
            except:
                continue

        if data:
            title = data.get("name", "")
            desc = data.get("description", "")
            address = data.get("location", {}).get("address", {}) if isinstance(data.get("location"), dict) else {}
            city = address.get("addressLocality", "") if isinstance(address, dict) else ""
            offers_data = data.get("offers", {}) if isinstance(data.get("offers"), dict) else {}
            price = offers_data.get("price", "")
            return {
                "title": title,
                "snippet": desc[:500],
                "city": city,
                "price": str(price) if price else "",
                "id": url.split("-ID")[-1].replace(".html", "") if "-ID" in url else "",
            }
        return None
    except Exception as e:
        log(f"   Blad OLX scrap: {e}")
        return None


def scrape_olx_listing(url):
    try:
        r = session.get(url, timeout=15)
        soup = BeautifulSoup(r.text, "lxml")
        offers = []

        cards = soup.select("[data-cy='l-card']")
        for card in cards[:20]:
            link_el = card.select_one("a[href*='/d/oferta/']")
            if not link_el:
                continue
            offer_url = urljoin("https://www.olx.pl", link_el.get("href", ""))
            if not offer_url:
                continue

            offer = scrape_olx_offer(offer_url)
            if offer and offer.get("title"):
                offer["url"] = offer_url
                offer["source"] = "olx.pl"
                offers.append(offer)
            time.sleep(0.5)

        return offers
    except Exception as e:
        log(f"   Blad OLX listing: {e}")
        return []


def scrape_zleca_listing(url):
    offers = []
    try:
        r = session.get(url, timeout=15)
        soup = BeautifulSoup(r.text, "lxml")
        items = soup.find_all(attrs={"data-E": True})
        for item in items:
            title = item.get("data-E", "")
            city = item.get("data-c", "")
            metrage = item.get("data-n", "")
            price = item.get("data-z", "")
            offers.append({
                "id": hashlib.md5(title.encode()).hexdigest()[:12] if hashlib else title[:20],
                "title": title,
                "city": city,
                "metrage": metrage,
                "price": price,
                "source": "zleca.pl",
                "url": url,
            })
    except:
        pass
    return offers


def run_mode_b():
    seen_ids = load_ids()
    all_offers = []
    new_count = 0

    log("=" * 50)
    log("TRYB B: Agent crawler (wielozrodlowy)")
    log("=" * 50)

    # Load tasks
    tasks = load_tasks()
    log(f"Zaladowano {len(tasks)} taskow")

    # Phase 1: Scrape known sources (Oferteo)
    log("\n--- Faza 1: Znan zrodla (Oferteo) ---")
    for slug, label in OFERTEO_QUERIES:
        if not running:
            break

        # Scrape first page
        url = f"https://www.oferteo.pl/zlecenia-na-{slug}-ni1"
        log(f"\n[{label}] {url}")
        offers, total_pages = scrape_oferteo_listing(url, label)

        for offer in offers:
            if not running:
                break
            if offer["id"] in seen_ids:
                continue
            if not is_job_offer(offer["title"]):
                continue
            city_match = match_location(offer["city"])
            if city_match:
                offer["city"] = city_match
            elif not offer["city"]:
                continue

            seen_ids.add(offer["id"])
            all_offers.append(offer)
            new_count += 1
            log(f"   NOWE #{offer['id']} | {offer['date']} | {offer['city']} | {offer['metrage']:8s} | {offer['title'][:60]}")

        # Paginate deeper in agent mode
        if total_pages > 1 and running:
            max_pages = min(total_pages, 3)
            for page in range(2, max_pages + 1):
                if not running:
                    break
                page_url = f"{url}?page={page}"
                log(f"   Strona {page}/{max_pages}...")
                more_offers, _ = scrape_oferteo_listing(page_url, label)
                for offer in more_offers:
                    if offer["id"] in seen_ids:
                        continue
                    if not is_job_offer(offer["title"]):
                        continue
                    city_match = match_location(offer["city"])
                    if city_match:
                        offer["city"] = city_match
                    elif not offer["city"]:
                        continue
                    seen_ids.add(offer["id"])
                    all_offers.append(offer)
                    new_count += 1
                    log(f"   NOWE #{offer['id']} | {offer['date']} | {offer['city']} | {offer['metrage']:8s} | {offer['title'][:60]}")
                time.sleep(random.uniform(1, 2))

        time.sleep(random.uniform(0.5, 1.5))

    # Phase 2: Discover new sources via DDG
    log("\n--- Faza 2: Odkrywanie nowych zrodel (DDG) ---")
    ddg_queries = [
        "zlecenie ukladanie paneli podlogowych",
        "zlecę położenie paneli",
        "montaż paneli zlecenie",
        "szukam wykonawcy paneli podlogowych",
        "potrzebuje fachowca do paneli",
    ]

    discovered = []
    for q in ddg_queries:
        if not running:
            break
        log(f"   Szukam: {q}")
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                for r in ddgs.text(q, region="pl-pl", max_results=15):
                    link = r.get("href", "") or ""
                    title = r.get("title", "") or ""

                    if any(excl in link for excl in ["forum.", "facebook", "youtube", "instagram"]):
                        continue

                    is_listing = any(p in link for p in [
                        "oferteo.pl/zlecenia", "olx.pl/uslugi", "zleca.pl/zlecenia",
                        "zleceniomat.pl", "ekspertbudowlany.pl/zlecenia",
                        "znajdzwykonawce.pl", "muratordom.pl",
                    ])

                    if is_listing:
                        source_url = link.split("?")[0].split("#")[0]
                        if source_url not in [s["url"] for s in discovered]:
                            discovered.append({
                                "url": source_url,
                                "title": title[:100],
                                "source": "ddg",
                                "query": q,
                                "found_at": datetime.now(timezone.utc).isoformat(),
                            })
        except Exception as e:
            log(f"   DDG error: {e}")
        time.sleep(1)

    if discovered:
        existing = load_sources()
        for s in discovered:
            if not any(ex["url"] == s["url"] for ex in existing):
                existing.append(s)
        save_sources(existing)
        log(f"   Odkryto {len(discovered)} nowych zrodel!")

        # Try scraping discovered sources
        log("\n--- Faza 3: Scrapowanie odkrytych zrodel ---")
        for source in discovered[:5]:
            if not running:
                break
            url = source["url"]
            log(f"   Scrapuje: {url}")
            if "olx.pl" in url:
                offers = scrape_olx_listing(url)
                for offer in offers:
                    oid = offer.get("id", "")
                    if oid and oid not in seen_ids:
                        if is_job_offer(offer.get("title", "")):
                            city_match = match_location(offer.get("city", ""))
                            if city_match or not offer.get("city"):
                                seen_ids.add(oid)
                                all_offers.append(offer)
                                new_count += 1
                                log(f"   NOWE(OLX) | {offer.get('city','')} | {offer.get('title','')[:60]}")
            elif "zleca.pl" in url:
                offers = scrape_zleca_listing(url)
                for offer in offers:
                    oid = offer.get("id", "")
                    if oid and oid not in seen_ids:
                        if is_job_offer(offer.get("title", "")):
                            city_match = match_location(offer.get("city", ""))
                            if city_match or not offer.get("city"):
                                seen_ids.add(oid)
                                all_offers.append(offer)
                                new_count += 1
                                log(f"   NOWE(Zleca) | {offer.get('title','')[:60]}")
            time.sleep(1)

    # Phase 4: Task execution
    log("\n--- Faza 4: Wykonanie taskow ---")
    for task in tasks:
        if not running:
            break
        log(f"   Task: {task['file']}")
        task_text = task["content"].lower()
        if "kontakt" in task_text or "contact" in task_text:
            log("   -> Contact extraction task detected (not implemented)")
        if "expir" in task_text or "przygas" in task_text or "czas" in task_text:
            log("   -> Expiry monitoring task detected (not implemented)")

    if all_offers:
        send_discord(all_offers)
        filename = save_excel(all_offers)
        save_ids(seen_ids)
        log(f"\nZebrano {new_count} NOWYCH zlecen!")
        if filename:
            log(f"Zapisano do: {filename}")
    else:
        log("\nBrak nowych zlecen.")

    return new_count


# ========================
# MAIN
# ========================
def daemon_loop(mode_func):
    signal.signal(signal.SIGTERM, handle_signal)
    signal.signal(signal.SIGINT, handle_signal)

    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))

    log(f"Demon uruchomiony (PID: {os.getpid()}), interwal: {DAEMON_INTERVAL}s")

    while running:
        log("=" * 50)
        log(f"Cykl: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        mode_func()
        log("=" * 50)

        if running:
            log(f"Sleep {DAEMON_INTERVAL}s...")
            for _ in range(DAEMON_INTERVAL):
                if not running:
                    break
                time.sleep(1)

    if os.path.exists(PID_FILE):
        os.remove(PID_FILE)
    log("Demon zatrzymany.")


def main():
    global DISCORD_WEBHOOK

    if len(sys.argv) > 1 and sys.argv[1] in ("--stop", "-s"):
        if os.path.exists(PID_FILE):
            with open(PID_FILE) as f:
                pid = int(f.read().strip())
            os.kill(pid, signal.SIGTERM)
            print(f"Wyslano SIGTERM do PID {pid}")
        else:
            print("Demon nie jest uruchomiony")
        return

    if len(sys.argv) > 1 and sys.argv[1] in ("--status", "-st"):
        if os.path.exists(PID_FILE):
            with open(PID_FILE) as f:
                pid = int(f.read().strip())
            try:
                os.kill(pid, 0)
                print(f"Demon dziala (PID: {pid})")
            except OSError:
                print(f"Stary PID file (PID: {pid}), demon nie zyje")
                os.remove(PID_FILE)
        else:
            print("Demon nie jest uruchomiony")
        return

    if not DISCORD_WEBHOOK and len(sys.argv) > 1 and not sys.argv[1].startswith("--"):
        DISCORD_WEBHOOK = sys.argv[1]

    if not DISCORD_WEBHOOK:
        print("Brak DISCORD_WEBHOOK. Podaj jako argument lub ustaw w .env")
        sys.exit(1)

    mode = "agent" if "--mode" in sys.argv and "agent" in sys.argv else "basic"
    is_daemon = "--daemon" in sys.argv or "-d" in sys.argv

    mode_func = run_mode_b if mode == "agent" else run_mode_a
    mode_name = "AGENT (B)" if mode == "agent" else "BASIC (A)"

    print(f"\nPodlogi Hunter v3 | Tryb: {mode_name}")

    if is_daemon:
        daemon_loop(mode_func)
    else:
        mode_func()


if __name__ == "__main__":
    main()
