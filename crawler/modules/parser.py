import re

METRAGE_PATTERN = re.compile(r'(\d+)\s*(?:[-–])\s*(\d+)\s*m[²2]|(\d+)\s*m[²2]')

DATE_NORMALIZE_PATTERN = re.compile(r'(\d{4}-\d{2}-\d{2})')


def parse_metrage(title):
    if not title:
        return ""
    m = METRAGE_PATTERN.search(title)
    if m:
        if m.group(3):
            return f"{m.group(3)}m2"
        return f"{m.group(1)}-{m.group(2)}m2"
    return ""


def extract_date(text):
    if not text:
        return ""
    m = DATE_NORMALIZE_PATTERN.search(text)
    return m.group(1) if m else ""


def parse_price(text):
    if not text:
        return ""
    digits = re.sub(r'[^0-9]', '', text)
    if digits:
        return f"{digits}zł"
    return ""


def normalize_city(city):
    if not city:
        return ""
    replacements = {
        "warszawa": "Warszawa", "krakow": "Kraków", "kraków": "Kraków",
        "wroclaw": "Wrocław", "wrocław": "Wrocław",
        "poznan": "Poznań", "poznań": "Poznań",
        "lodz": "Łódź", "łódź": "Łódź",
        "gdansk": "Gdańsk", "gdańsk": "Gdańsk",
        "bialystok": "Białystok", "białystok": "Białystok",
        "czestochowa": "Częstochowa", "częstochowa": "Częstochowa",
        "rzeszow": "Rzeszów", "rzeszów": "Rzeszów",
        "torun": "Toruń", "toruń": "Toruń",
        "gorzow": "Gorzów", "gorzów": "Gorzów",
        "zielona gora": "Zielona Góra", "zielona góra": "Zielona Góra",
    }
    c = city.lower().strip()
    if c in replacements:
        return replacements[c]
    return city.strip().capitalize()
