import re
from datetime import datetime, date

import config


AGE_ORDER = ["fresh", "new", "current", "outdated", "old", "expired", "unknown"]

AGE_LABELS_PL = {
    "fresh": "świeże",
    "new": "nowe",
    "current": "aktualne",
    "outdated": "przestarzałe",
    "old": "stare",
    "expired": "wygasłe",
    "unknown": "nieznane",
}

AGE_COLORS = {
    "fresh": 0x00FF00,
    "new": 0x00B8D4,
    "current": 0xFFA000,
    "outdated": 0xFF6D00,
    "old": 0x9E9E9E,
    "expired": 0x616161,
    "unknown": 0x757575,
}


def classify_by_age(offer_date_str, reference_date=None):
    if not offer_date_str:
        return "unknown"
    try:
        offer_date = datetime.strptime(offer_date_str, "%Y-%m-%d").date()
    except ValueError:
        return "unknown"
    if reference_date is None:
        reference_date = date.today()
    days_old = (reference_date - offer_date).days
    if days_old < 0:
        return "fresh"
    if days_old < config.AGE_THRESHOLDS["fresh"]:
        return "fresh"
    if days_old < config.AGE_THRESHOLDS["new"]:
        return "new"
    if days_old < config.AGE_THRESHOLDS["current"]:
        return "current"
    if days_old < config.AGE_THRESHOLDS["outdated"]:
        return "outdated"
    if days_old < config.AGE_THRESHOLDS["old"]:
        return "old"
    return "expired"


def platform_expiry_days(source):
    return config.PLATFORM_EXPIRY_DAYS.get(source, 30)


def calculate_effective_expiry(offer):
    source = offer.get("source", "")
    platform_days = platform_expiry_days(source)
    timeline_days = _timeline_to_days(offer.get("timeline", ""))
    if timeline_days and timeline_days < platform_days:
        return timeline_days
    return platform_days


def _timeline_to_days(timeline):
    if not timeline:
        return None
    t = timeline.lower().strip()
    for key, days in config.TIMELINE_MAP.items():
        if key in t:
            return days
    nums = re.findall(r'\d+', t)
    if nums:
        return int(nums[0])
    return None


def is_expired_by_platform(offer, reference_date=None):
    if reference_date is None:
        reference_date = date.today()
    if not offer.get("date"):
        return False
    try:
        offer_date = datetime.strptime(offer["date"], "%Y-%m-%d").date()
    except ValueError:
        return False
    days_allowed = calculate_effective_expiry(offer)
    days_old = (reference_date - offer_date).days
    return days_old >= days_allowed


def classify_offer(offer, reference_date=None):
    age_group = classify_by_age(offer.get("date", ""), reference_date)
    if age_group in ("old", "expired"):
        return age_group
    if is_expired_by_platform(offer, reference_date):
        return "expired"
    return age_group


def analyze_autonomous(offers, reference_date=None):
    if reference_date is None:
        reference_date = date.today()
    groups = {g: [] for g in ["fresh", "new", "current", "outdated", "old", "expired", "unknown"]}
    stats = {
        "total": len(offers),
        "with_name": 0,
        "private_persons": 0,
        "companies": 0,
        "with_timeline": 0,
        "cities": {},
        "sources": {},
    }
    for offer in offers:
        group = classify_offer(offer, reference_date)
        groups[group].append(offer)
        if offer.get("name"):
            stats["with_name"] += 1
        if offer.get("person_type") == "osoba prywatna":
            stats["private_persons"] += 1
        elif offer.get("person_type") == "firma":
            stats["companies"] += 1
        if offer.get("timeline"):
            stats["with_timeline"] += 1
        city = offer.get("city", "")
        if city:
            stats["cities"][city] = stats["cities"].get(city, 0) + 1
        src = offer.get("source", "unknown")
        stats["sources"][src] = stats["sources"].get(src, 0) + 1

    return groups, stats
