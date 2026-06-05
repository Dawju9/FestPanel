# FestPanel — Profesjonalny Montaż Paneli Podłogowych

Hybrydowy projekt **Next.js (Node.js) + Python** — strona internetowa firmy świadczącej usługi montażu paneli podłogowych na terenie Gdańska i całej Polski. Zawiera publiczną witrynę marketingową oraz zabezpieczony panel administratora z integracją crawlera ofert.

---

## Funkcjonalności

### Strona publiczna
- **Landing page** — hero z animacjami, 4 usługi (montaż paneli winylowych, laminowanych, przygotowanie podłoża, listwy), 4 cechy (szybkość, jakość, gwarancja, terminowość), formularz kontaktowy z Google reCAPTCHA
- **QR Generator** — generuje kod QR do ulotki elektronicznej (`/qr`)
- **Ulotka elektroniczna** — flip-card z przodem/tyłem ulotki firmowej (`/ulotka`)
- **Kontakt popup** — rozszerzony formularz (imię, telefon, email, metraż, usługi przygotowania, listwy, wiadomość + reCAPTCHA)
- **Rezerwacje** — panel boczny do umawiania terminów (imię, data, metry, typ podłogi)
- **Przełącznik motywów** — 6 kompletnych motywów CSS wybieranych przez użytkownika

### Panel administratora (`/js/auth/*`)
Wszystkie strony chronione przez **NextAuth** (CredentialsProvider, bcrypt, JWT 24h):
- **Dashboard** — 6 kart statystyk (liczba crawl, wyników, słów kluczowych, zadań, zdarzeń, współczynnik trafień) + lista zgłoszeń z formularza
- **Crawler** — panel sterowania (status, start/stop, ustawienia interwału, max wyników, webhook Discord, symulowany log)
- **Wyniki** — tabela zleceń (tytuł, lokalizacja, kod, data, wynagrodzenie, metry, źródło) + wyszukiwarka
- **Słowa kluczowe** — CRUD dla zapytań crawlera ze statystykami trafień
- **Raporty** — statystyki, wykres tygodniowy, wydajność źródeł, log zdarzeń
- **Zadania** — CRUD z priorytetami (wysoki/średni/niski) + filtrowanie, zapis w localStorage
- **Logi** — podgląd logów systemowych/crawlera z kolorowaniem
- **Notatki** — CRUD z kategoriami, grupowane
- **Rezerwacje** — przeglądarka rezerwacji grupowanych datami
- **Insights** — podstawowe SEO (ocena, słowa kluczowe, ruch, wydajność)

### Crawler ofert (Python)
Samodzielny skrypt Python wykorzystujący **DuckDuckGo API** do wyszukiwania zleceń montażu podłóg na polskich portalach:
- 8 zapytań wyszukiwania
- 8 targetowanych domen (olx.pl, fixly.pl, oferteo.pl, zleca.pl, zleceniomat.pl, forum, muratordom, eurobudowa)
- Deduplikacja przez `seen_links.json`
- Wysyłka nowych ofert na Discord (embed z tytułem, URL, snippetem, zapytaniem, źródłem)
- Zapis do pliku Excel z timestampem
- **Całkowicie niezależny** od aplikacji Node.js

### System motywów
6 pełnych motywów CSS zdefiniowanych w `theme_config.yml` i `thems_ideas.data`:
| ID | Nazwa | Kolor |
|---|---|---|
| `default` | Klasyczny Czerwony | #D32F2F |
| `modern_dark` | Nowoczesny Ciemny | #00BCD4 |
| `forest_green` | Leśna Zieleń | #2E7D32 |
| `sunset_orange` | Zachód Słońca | #EF6C00 |
| `ocean_blue` | Głębia Oceanu | #1565C0 |
| `royal_purple` | Królewska Purpura | #6A1B9A |

Wybór motywu persistowany w `localStorage` przez `ThemeContext`.

---

## Stos technologiczny

| Warstwa | Technologia |
|---|---|
| Frontend | Next.js 15 (Pages Router), React 18, Framer Motion, Lucide React |
| Autoryzacja | NextAuth v4 (CredentialsProvider), bcryptjs, JWT (24h expiry) |
| UI/UX | 6 motywów CSS, przełącznik motywów, responsywność |
| Backend | Next.js API Routes (`/api/*`) |
| Baza danych | **Brak** — pliki JSON (`data/submissions.json`, `data/notes.json`, `data/reservations.json`) |
| Crawler | Python 3, DuckDuckGo API, pandas, openpyxl |
| Notyfikacje | Discord Webhook |
| CAPTCHA | Google reCAPTCHA Enterprise |
| Analityka | Vercel Analytics, Vercel Speed Insights |
| Linting | ESLint + TypeScript (strict) |

---

## Szybki start

### Wymagania
- Node.js >= 18.18.0
- Python >= 3.8 (dla crawlera)
- npm

### Instalacja

```bash
# 1. Zainstaluj zależności Node.js
npm install

# 2. Skonfiguruj konto administratora (generuje ADMIN_HASH i NEXTAUTH_SECRET do .env)
npm run setup:admin

# 3. Skopiuj i uzupełnij zmienne środowiskowe
cp .env.example .env
# Edytuj .env — uzupełnij ADMIN_HASH, NEXTAUTH_SECRET, NEXTAUTH_URL

# 4. Uruchom w trybie deweloperskim
npm run dev
```

### Zmienne środowiskowe (.env)

| Zmienna | Opis |
|---|---|
| `ADMIN_USER` | Nazwa użytkownika admina (domyślnie: whitekali) |
| `ADMIN_HASH` | Hash bcrypt hasła administratora |
| `NEXTAUTH_SECRET` | Sekret do podpisywania JWT |
| `NEXTAUTH_URL` | URL aplikacji (np. `http://localhost:3099`) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Klucz site Google reCAPTCHA |
| `RECAPTCHA_PROJECT_ID` | ID projektu reCAPTCHA Enterprise |
| `DISCORD_WEBHOOK` | Webhook URL Discorda (dla formularza i crawlera) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ścieżka do pliku JSON konta serwisowego Google |

### Uruchomienie

```bash
npm run dev       # Tryb deweloperski (port 3000)
npm run build     # Budowa wersji produkcyjnej
npm run start     # Uruchomienie wersji produkcyjnej
bash manage.sh    # Menadżer procesu (start/stop/restart/status)
```

---

## Struktura projektu

```
FestPanel/
├── src/
│   ├── pages/
│   │   ├── index.js                 # Landing page (strona główna)
│   │   ├── qr.js                    # Generator QR
│   │   ├── ulotka.js                # Ulotka elektroniczna
│   │   ├── _app.js                  # Custom App (SessionProvider, ThemeProvider, AnimatePresence)
│   │   ├── js/auth/
│   │   │   ├── login.js             # Logowanie admina
│   │   │   ├── dashboard.js         # Dashboard
│   │   │   ├── crawler.js           # Panel sterowania crawlerem
│   │   │   ├── results.js           # Wyniki wyszukiwania
│   │   │   ├── keywords.js          # Słowa kluczowe
│   │   │   ├── reports.js           # Raporty
│   │   │   ├── todo.js              # Zadania
│   │   │   ├── logs/                # Logi systemowe
│   │   │   ├── notes.js             # Notatki
│   │   │   ├── insights.js          # SEO insights
│   │   │   └── reservations.js      # Rezerwacje
│   │   └── api/
│   │       ├── health.js            # Health check
│   │       ├── contact.js           # Formularz kontaktowy → zapis JSON + Discord
│   │       ├── reservations.js      # CRUD rezerwacji (JSON)
│   │       ├── notes.js             # CRUD notatek (JSON)
│   │       └── auth/[...nextauth].js # NextAuth endpoint
│   ├── components/
│   │   ├── AdminLayout.js           # Layout panelu admina (sidebar)
│   │   ├── ContactPopup.js          # Modal formularza kontaktowego
│   │   ├── ReservationSlider.js     # Panel rezerwacji
│   │   └── ThemeSwitcher.js         # Przełącznik motywów
│   ├── context/
│   │   └── ThemeContext.js          # React Context dla motywów
│   ├── lib/
│   │   └── auth.js                  # Konfiguracja NextAuth + requireAuth()
│   └── styles/
│       └── globals.css              # Globalny CSS (726 linii, 6 motywów)
├── crawler/
│   ├── floor_crawler_discord.py     # Główny skrypt crawlera
│   ├── requirements.txt             # Zależności Python
│   ├── seen_links.json              # Stan — odwiedzone linki
│   ├── strony.dodatkowe             # Lista dodatkowych stron
│   └── README.md                    # Dokumentacja crawlera
├── data/
│   ├── submissions.json             # Zgłoszenia z formularza
│   ├── reservations.json            # Rezerwacje
│   └── notes.json                   # Notatki
├── scripts/
│   ├── setup-admin.js               # Konfiguracja konta admina
│   ├── setup-welcome.js             # Konfiguracja powitalna
│   └── watch-lint.js                # Auto-linting na żywo
├── public/
│   └── images/                      # Grafiki (ulotka front/back)
├── theme_config.yml                 # Definicje kolorów motywów
├── thems_ideas.data                 # Dokumentacja motywów
├── welcome_config.yml               # Konfiguracja powitalna
├── manage.sh                        # Menadżer procesu (bash)
└── AGENTS.md                        # Dokumentacja dla AI/automatyków
```

---

## Architektura — przepływ danych

### Formularz kontaktowy
```
Użytkownik → formularz + reCAPTCHA → POST /api/contact
  → Weryfikacja reCAPTCHA (Google API)
  → Zapis do data/submissions.json
  → Wysłanie notyfikacji na Discord webhook
  → Zwrot sukcesu/błędu
```

### Rezerwacje
```
Użytkownik → ReservationSlider → POST /api/reservations
  → Zapis do data/reservations.json
  → Zwrot zaktualizowanej listy
```

### Autoryzacja admina
```
Użytkownik → /js/auth/*
  → getServerSideProps → requireAuth()
    → getServerSession() → sprawdzenie JWT cookie
    → Brak sesji → redirect do /js/auth/login
  → Logowanie: POST credentials + reCAPTCHA
    → NextAuth CredentialsProvider
      → bcrypt.compare(password, ADMIN_HASH)
      → Zwrot JWT token (24h)
```

### Crawler (Python, niezależny)
```
Skrypt uruchomiony ręcznie / cron
  → DuckDuckGo API — 8 zapytań
  → Filtrowanie wyników do 8 targetowanych domen
  → Porównanie z seen_links.json (deduplikacja)
  → Nowe wyniki:
    → Discord webhook (embedy, max 8)
    → Zapis do Excela (nowe_zlecenia_podlogi_YYYYMMDD_HHMM.xlsx)
  → Aktualizacja seen_links.json
```

> **Uwaga:** Panel admina (wyniki, słowa kluczowe, logi, raporty) używa obecnie danych mock. Nie ma bezpośredniego połączenia między crawlerem a dashboardem.

---

## Skrypty

| Komenda | Opis |
|---|---|
| `npm run dev` | Uruchomienie dev (port 3000, HOST 0.0.0.0) |
| `npm run build` | Budowa produkcyjna (standalone output) |
| `npm run start` | Uruchomienie wersji produkcyjnej |
| `npm run lint` | ESLint auto-fix |
| `npm run lint:check` | ESLint sprawdzenie |
| `npm run typecheck` | TypeScript type check |
| `npm run watch` | Auto-linting na żywo (chokidar) |
| `npm run setup:admin` | Konfiguracja konta admina |
| `npm run setup:welcome` | Konfiguracja powitalna |
| `bash manage.sh` | Menadżer procesu (build/clean/start/stop/restart/status/deploy) |

---

## Crawler Python

Szczegółowa dokumentacja w [crawler/README.md](crawler/README.md).

```bash
cd crawler
pip install -r requirements.txt
# Utwórz .env z DISCORD_WEBHOOK=<url>
python3 floor_crawler_discord.py
```

Zalecana częstotliwość uruchamiania: co 4-8 godzin (cron / Task Scheduler).

---

## Licencja

[Unlicense](LICENSE) — domena publiczna.
