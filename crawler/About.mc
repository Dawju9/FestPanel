**✅ Gotowe! Crawler z DuckDuckGo API.**  

Zaktualizowana wersja używa DuckDuckGo zamiast Google (Google blokuje scraping bez JavaScript). Działa tak samo — zapamiętuje seen_links, wysyła na Discord, zapisuje Excel.

### 1. Instalacja
```bash
pip install requests beautifulsoup4 pandas openpyxl lxml python-dotenv duckduckgo_search
```

### 2. Uruchomienie
```bash
cd crawler
python3 floor_crawler_discord.py
```

### 3. Plik `.env` (w tym samym folderze)
```
DISCORD_WEBHOOK=https://discord.com/api/webhooks/TWOJ_WEBHOOK_TUTAJ
```

### Dodatkowe rady na 2026:
- Uruchamiaj co 4-8 godzin (cron / Task Scheduler).
- Crawler zapisuje seen_links.json — tylko nowe wyniki.
- Pełny kod skryptu: `floor_crawler_discord.py`
- Do integracji z dashboardem admina: wyniki w `/js/auth/results`
