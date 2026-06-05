import config


def is_job_offer(title, snippet=""):
    text = (title + " " + snippet).lower()
    has_job = any(ind in text for ind in config.JOB_INDICATORS)
    has_noise = any(noi in text for noi in config.NOISE_INDICATORS)
    return has_job and not has_noise


def match_location(city):
    if not city:
        return ""
    c = city.lower().strip()
    for loc in config.LOCATIONS:
        if loc in c or c in loc:
            return loc.capitalize()
    return ""


def is_offer_url(link):
    if not link:
        return False
    link_lower = link.lower()
    for excl in config.COMMON_EXCLUDES:
        if excl in link_lower:
            return False
    for pattern in config.LISTING_PATTERNS:
        if pattern in link_lower:
            return True
    return False
