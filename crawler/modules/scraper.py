import json
import time
import random
import re
from urllib.parse import urljoin
from datetime import datetime, timezone

import requests
from bs4 import BeautifulSoup

import config
from modules.parser import parse_metrage, extract_date
from modules.filter import is_offer_url

session = requests.Session()
session.headers.update({"User-Agent": config.USER_AGENT})


def extract_oferteo_card(item, listing_url, query_label):
    rfp_id = item.get("data-rfp-id", "")
    if not rfp_id:
        return None

    title_el = item.select_one("[data-test='rfp_list__item__title']")
    date_el = item.select_one("[data-test='rfp_list__item__date']")
    city_el = item.select_one("[data-test='rfp_list__item__location_city']")
    name_el = item.select_one("[data-test='rfp_list__item__first_name']")
    tags_el = item.select_one(".rfp-tile_tags")

    title = title_el.get_text(strip=True) if title_el else ""
    offer_link_el = title_el.find("a", href=True) if title_el else None
    offer_url = urljoin("https://www.oferteo.pl", offer_link_el["href"]) if offer_link_el else f"https://www.oferteo.pl/zlecenie/{rfp_id}"

    date = extract_date(date_el.get("title", "")) if date_el else ""
    city = city_el.get_text(strip=True) if city_el else ""
    name = name_el.get_text(strip=True) if name_el else ""
    metrage = parse_metrage(title)

    raw_tags = tags_el.get_text("|", strip=True).split("|") if tags_el else []

    person_type = ""
    timeline = ""
    metrage_tag = ""
    extra_tags = []

    for tag in raw_tags:
        t = tag.strip()
        if not t:
            continue
        if t in ("osoba prywatna", "firma", "firma usługowa"):
            person_type = t
        elif re.match(r'^\d+[-–]\d+\s*m[²2]|^\d+\s*m[²2]', t, re.IGNORECASE):
            metrage_tag = t
        elif any(k in t.lower() for k in ["termin", "miesiąc", "tydzień", "pilne", "uzgodnieni", "natychmiast"]):
            timeline = t
        else:
            extra_tags.append(t)

    if not metrage:
        metrage = parse_metrage(metrage_tag)

    return {
        "id": rfp_id,
        "date": date,
        "title": title,
        "city": city,
        "name": name,
        "metrage": metrage,
        "person_type": person_type,
        "timeline": timeline,
        "tags": extra_tags,
        "source": "oferteo.pl",
        "url": offer_url,
        "query": query_label,
    }


def scrape_oferteo_listing(url, query_label=""):
    try:
        r = session.get(url, timeout=15)
        if r.status_code != 200:
            return [], 1
        soup = BeautifulSoup(r.text, "lxml")
        items = soup.select("[data-rfp-id]")
        offers = [extract_oferteo_card(item, url, query_label) for item in items]
        offers = [o for o in offers if o]

        pagination = soup.get_text()
        pages = re.search(r'(\d+)\s*z\s*(\d+)', pagination)
        total_pages = int(pages.group(2)) if pages else 1
        return offers, total_pages

    except Exception:
        return [], 1


def scrape_oferteo_paginated(slug, label, max_pages=3):
    all_offers = []
    url = f"https://www.oferteo.pl/zlecenia-na-{slug}-ni1"
    offers, total_pages = scrape_oferteo_listing(url, label)
    all_offers.extend(offers)
    pages_to_fetch = min(total_pages, max_pages)
    for page in range(2, pages_to_fetch + 1):
        page_url = f"{url}?page={page}"
        more_offers, _ = scrape_oferteo_listing(page_url, label)
        all_offers.extend(more_offers)
        time.sleep(random.uniform(0.5, 1.5))
    return all_offers


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
            except Exception:
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
                "snippet": desc[:500] if desc else "",
                "city": city,
                "price": str(price) if price else "",
                "id": url.split("-ID")[-1].replace(".html", "") if "-ID" in url else "",
            }
        return None
    except Exception:
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
    except Exception:
        return []


def discover_new_sources_ddg(query, label=""):
    try:
        from ddgs import DDGS
        new_sources = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, region="pl-pl", max_results=10):
                link = r.get("href", "") or ""
                title = r.get("title", "") or ""
                if is_offer_url(link):
                    clean_url = link.split("?")[0].split("#")[0]
                    new_sources.append({
                        "url": clean_url,
                        "site": link.split("/")[2] if "//" in link else "",
                        "title": title[:100],
                        "found_by": label,
                        "found_at": datetime.now(timezone.utc).isoformat(),
                        "active": True,
                    })
        return new_sources
    except Exception:
        return []


def discover_multiple_queries(queries=None):
    if queries is None:
        queries = config.DDG_DISCOVERY_QUERIES
    all_sources = []
    for q in queries:
        sources = discover_new_sources_ddg(q, q[:30])
        all_sources.extend(sources)
        time.sleep(1)
    seen_urls = set()
    unique = []
    for s in all_sources:
        if s["url"] not in seen_urls:
            seen_urls.add(s["url"])
            unique.append(s)
    return unique
