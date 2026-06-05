# FestPanel Crawler v2 — DuckDuckGo API

Skrypt Python do automatycznego wyszukiwania zleceń montażu podłóg na polskich portalach ogłoszeniowych. Wykorzystuje **DuckDuckGo API** przez pakiet `ddgs`.

---

## Jak działa

```
DuckDuckGo API (8 zapytań)
  → Filtrowanie do 12 targetowanych domen
  → Filtracja treści po słowach kluczowych (FLOOR_KEYWORDS)
  → Porównanie z seen_links.json (pomija już znane linki)
  → Nowe wyniki:
    1. Scrapowanie strony (cena, metraż, lokalizacja)
    2. Wysyłka na Discord webhook (batch embed, max 8)
    3. Zapis do pliku Excel z timestampem
  → Aktualizacja seen_links.json
```

## Cechy v2

- **Scrapowanie** — odwiedza każdą znalezioną stronę i wyciąga cenę, metraż, lokalizację
- **Filtr śmieci** — blokuje wyniki niezwiązane z podłogami (Minecraft, fora zagraniczne itp.)
- **Detekcja kategorii** — automatyczny kolor Discorda w zależności od typu (cyklinowanie, winyl, montaż)
- **Wykrywanie miasta** — wyciąga lokalizację z tytułu/opisu
- **Batch Discord** — wszystkie embedy w jednym webhook callu
- **Bogaty Excel** — 9 kolumn: title, link, snippet, query, source, city, category, price, metrage

## Targetowane domeny (12)

- olx.pl
- fixly.pl
- oferteo.pl
- zleca.pl
- zleceniomat.pl
- zlecenia-budowlane.muratordom.pl
- eurobudowa.pl
- buildly.pl
- ekspertbudowlany.pl
- znajdzwykonawce.pl
- oferent.com.pl
- wykonawca.pl

## Dodatkowe strony

Plik [`strony.dodatkowe`](strony.dodatkowe) zawiera listę 30+ polskich portali ze zleceniami budowlanymi odkrytych podczas researchu (maj 2026). Mogą być użyte do rozszerzenia crawlera w przyszłości.

---

## Instalacja

### Wymagania
- Python >= 3.8
- pip

### Krok po kroku

```bash
# 1. Wejdź do katalogu crawlera
cd crawler

# 2. Utwórz virtual env (opcjonalne ale zalecane)
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 3. Zainstaluj zależności
pip install -r requirements.txt

# 4. Utwórz plik .env z webhookiem Discorda
echo "DISCORD_WEBHOOK=https://discord.com/api/webhooks/TWOJ_WEBHOOK_TUTAJ" > .env

# 5. Uruchom
python3 floor_crawler_discord.py

# Opcjonalnie: podaj webhook jako argument
python3 floor_crawler_discord.py https://discord.com/api/webhooks/...
```

---

## Konfiguracja

### Zmienne środowiskowe (`.env` w katalogu crawlera)

| Zmienna | Wymagany | Opis |
|---|---|---|
| `DISCORD_WEBHOOK` | Tak (dla Discord) | Webhook URL kanału Discord |

### Pliki stanu

| Plik | Opis |
|---|---|
| `seen_links.json` | Automatycznie tworzony. Przechowuje wszystkie odwiedzone URL-e, aby uniknąć duplikatów w przyszłych uruchomieniach. |

### Pliki wyjściowe

| Plik | Opis |
|---|---|
| `nowe_zlecenia_podlogi_YYYYMMDD_HHMM.xlsx` | Plik Excel z nowymi wynikami, tworzony przy każdym uruchomieniu (jeśli znaleziono nowe oferty). Zawiera kolumny: title, link, snippet, query. |

---

## Format danych

### Discord embed

```json
{
  "username": "Podłogi Hunter",
  "content": "🔨 **Nowe zlecenie na podłogi!**",
  "embeds": [{
    "title": "Tytuł ogłoszenia",
    "url": "https://...",
    "description": "Treść ogłoszenia (pierwsze 500 znaków)",
    "color": 65280,
    "fields": [
      {"name": "Zapytanie", "value": "użyte zapytanie", "inline": true},
      {"name": "Źródło", "value": "domena.pl", "inline": true}
    ],
    "timestamp": "2026-06-05T..."
  }]
}
```

### Excel output

| Kolumna | Opis |
|---|---|
| title | Tytuł ogłoszenia |
| link | Pełny URL ogłoszenia |
| snippet | Fragment treści (350 znaków) |
| query | Zapytanie DuckDuckGo, które znalazło to ogłoszenie |

---

## Uruchamianie cykliczne

Zalecana częstotliwość: **co 4-8 godzin**.

### Cron (Linux)

```bash
# Edytuj crontab: crontab -e
# Uruchamiaj codziennie o 6:00, 12:00, 18:00, 22:00
0 6,12,18,22 * * * cd /ścieżka/do/crawler && python3 floor_crawler_discord.py >> crawler.log 2>&1
```

### Task Scheduler (Windows)
Utwórz zadanie uruchamiające `python3 floor_crawler_discord.py` w katalogu crawlera.

---

## Uwagi

- **Crawler jest całkowicie niezależny** od aplikacji Node.js — nie ma punktu integracji z Next.js. Panel admina (`/js/auth/*`) używa danych mock dla wyników, słów kluczowych, logów i raportów.
- Jeśli brak pliku `.env` lub zmiennej `DISCORD_WEBHOOK`, notyfikacje Discord są pomijane (crawler nadal działa i zapisuje Excel).
- DuckDuckGo API nie wymaga klucza API, ale ma ograniczenia szybkości — skrypt dodaje 1-3s opóźnienia między zapytaniami.
- Wszystkie nowo odkryte linki są dodawane do `seen_links.json` nawet jeśli wysyłka Discorda się nie powiedzie.

---

## Rozwiązywanie problemów

| Problem | Rozwiązanie |
|---|---|
| Brak wyników | Sprawdź czy DuckDuckGo nie blokuje (uruchom ręcznie zapytanie w przeglądarce). |
| Brak notyfikacji Discord | Sprawdź `DISCORD_WEBHOOK` w `.env`, czy webhook jest aktywny. |
| Duplikaty w Excelu | Usuń `seen_links.json` — zacznie od nowa (niezalecane przy długim działaniu). |
| Błąd `ModuleNotFoundError` | Zainstaluj brakujące pakiety: `pip install -r requirements.txt`. |
