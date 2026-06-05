import os
from dotenv import load_dotenv

load_dotenv()

OFERTEO_QUERIES = [
    ("ukladanie-paneli", "Układanie paneli"),
    ("cyklinowanie", "Cyklinowanie podłóg"),
    ("posadzki", "Posadzki"),
    ("wykladziny-podlogowe", "Wykładziny podłogowe"),
]

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
    "mokotow", "mokotów", "praga", "srodmiescie", "śródmieście",
    "ochota", "wola", "bielany", "ursynow", "ursynów", "wlochy", "włochy",
    "targowek", "targówek", "bemowo", "wesola", "wesoła", "wawer",
    "wilanow", "wilanów", "ursus", "bialoleka", "białołęka", "zoliborz", "żoliborz",
    "rembertow", "rembertów",
    "krowodrza", "zwierzyniec", "grzegorzki", "grzegórzki",
    "podgorze", "podgórze", "nowa huta", "pradnik", "prądnik", "bronowice",
    "fabryczna", "krzyki", "psie pole", "stare miasto",
    "jezyce", "jeżyce", "starowka", "starówka", "wilda", "grunwald", "nowe miasto",
    "orunia", "wrzeszcz", "przymorze", "zabianka", "żabianka",
]

JOB_INDICATORS = [
    "zlecę", "zlece", "szukam", "potrzebuję", "potrzebuje",
    "poszukuję", "poszukuje", "dam zlecenie", "zapytanie o",
    "zlecę usługę", "zlec", "potrzebny",
]

NOISE_INDICATORS = [
    "cena", "cennik", "koszt", "ranking", "najlepszych",
    "opinie", "firma", "wykonawca", "specjalista", "ile kosztuje",
    "sprzedam", "kupię", "kupie", "oferuję", "oferuje",
    "wykonam", "producent", "sklep", "promocja", "wynajmę",
    "wynajme", "kurs", "szkolenie", "poradnik",
]

AGE_THRESHOLDS = {
    "fresh": 1,
    "new": 2,
    "current": 7,
    "outdated": 14,
    "old": 30,
}

PLATFORM_EXPIRY_DAYS = {
    "oferteo.pl": 45,
    "olx.pl": 30,
    "zleca.pl": 30,
}

EXPIRY_STRATEGY = "auto"

PERSON_TYPE_PRIORITY = {
    "osoba prywatna": 10,
    "firma": 5,
}

TIMELINE_MAP = {
    "w ciągu miesiąca": 30,
    "najbliższy wolny termin": 14,
    "do uzgodnienia": 14,
    "w ciągu tygodnia": 7,
    "pilne": 3,
    "na już": 1,
}

DDG_DISCOVERY_QUERIES = [
    "zlecenie ukladanie paneli podlogowych",
    "zlecę położenie paneli",
    "montaż paneli zlecenie",
    "szukam wykonawcy paneli podlogowych",
    "potrzebuje fachowca do paneli",
]

CRAWLER_DIR = os.path.dirname(os.path.abspath(__file__))
PID_FILE = os.path.join(CRAWLER_DIR, "crawler.pid")
LOG_FILE = os.path.join(CRAWLER_DIR, "crawler.log")
SEEN_IDS_FILE = os.path.join(CRAWLER_DIR, "seen_ids.json")
SEEN_LINKS_FILE = os.path.join(CRAWLER_DIR, "seen_links.json")
OFFERS_HISTORY_FILE = os.path.join(CRAWLER_DIR, "data", "offers_history.json")
SOURCES_FILE = os.path.join(CRAWLER_DIR, "knowledge", "sources.json")
KEYWORDS_FILE = os.path.join(CRAWLER_DIR, "knowledge", "keywords.json")
TASKS_DIR = os.path.join(CRAWLER_DIR, "tasks")

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK", "")
DAEMON_INTERVAL = int(os.getenv("CRAWLER_INTERVAL", "3600"))
MAX_EXCEL_FILES = int(os.getenv("CRAWLER_MAX_EXCEL", "20"))
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

COMMON_EXCLUDES = ["forum.", "facebook", "youtube", "instagram", "twitter", "tiktok"]

LISTING_PATTERNS = [
    "oferteo.pl/zlecenia", "olx.pl/uslugi", "zleca.pl/zlecenia",
    "zleceniomat.pl", "ekspertbudowlany.pl/zlecenia",
    "znajdzwykonawce.pl", "muratordom.pl",
]
