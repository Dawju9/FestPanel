# FestPanel - Plan Rozwoju Projektu

## Spis treści
1. [Struktura Branchy](#struktura-branzy)
2. [Minigra - Układanie Paneli Podłogowych](#minigra---układanie-paneli-podłogowych)
3. [Zadania do wykonania](#zadania-do-wykonania)

---

## Struktura Branchy

### Obecna struktura
```
 FestPanel/ (repozytorium)
 ├── src/              # Aplikacja Next.js
 ├── crawler/          # Python crawler
 ├── data/             # Pliki JSON
 ├── scripts/          # Skrypty JS
 └── public/           # Static files
```

### Docelowa struktura branchy

| Branch | Zawiera | Cel |
|--------|---------|-----|
| **main-website** | Strona główna, ulotka, QR, podstawowe komponenty | Główna strona firmy |
| **admin-app** | Panel admina, NextAuth, API zarządzania | Zarządzanie firmą |
| **floorgame** | Minigra, komponenty gry, system punktacji | Gra edukacyjna |
| **crawler** | Python scraper + dane | Zbieranie ofert (już istnieje) |

---

### Utworzenie branzy - komendy

```bash
# 1. Utwórz main-website z obecnego stanu
git checkout -b main-website
git push -u origin main-website

# 2. Utwórz admin-app z main-website
git checkout main-website -b admin-app
git push -u origin admin-app

# 3. Utwórz floorgame z main-website
git checkout main-website -b floorgame
git push -u origin floorgame
```

---

## Minigra - Układanie Paneli Podłogowych

### Opis gry
Gra edukacyjna ucząca techniki układania paneli podłogowych metodą 1/3 (przesunięcie co 1/3 długości panelu) z systemem zakładek.

### Mechanika gry

#### Technika 1/3 (wzór międzyrzędowy)
```
Rząd 1: [████████████] ← pełny panel (0%)
Rząd 2:     [████████████] ← przesunięty o 1/3
Rząd 3:        [████████████] ← przesunięty o 2/3
Rząd 4: [████████████] ← powtórka cyklu
```

#### Zakładki (system Click)
- Każdy panel ma "ząbki" na krótszych krawędziach
- Prawidłowe połączenie = panel "wskakuje" na miejsce
- Błędne połączenie = podświetlenie czerwone + dźwięk błędu

#### Walidacja w czasie rzeczywistym
- Sprawdzenie przesunięcia co 1/3
- Sprawdzenie zakładek (czy panele się łączą)
- Obliczanie zużycia materiału (%)

---

### System misji (30 poziomów)

| Poziom | Pokoje | Trudność | Punkty bazowe | Wymagania |
|--------|--------|----------|---------------|-----------|
| 1 (Łatwy) | 1-4 | Prostokątny, mały (8m²) | 100 | Proste kształty |
| 2 (Średni) | 5-7 | Z występem (15m²) | 200 | Jedna przeszkoda |
| 3 (Trudny) | 8-10 | Skomplikowany (25m²+) | 300 | Wiele przeszkód |

**Każdy pokój ma:**
- Wymiary (szerokość × długość)
- Położenie okna (wpływa na kierunek paneli)
- Przeszkody (kolumny, schody)

---

### System punktacji

| Akcja | Punkty |
|-------|--------|
| Ukończenie pokoju | 100-300 (wg trudności) |
| Technika 1/3 ✓ | +50 pkt |
| Zakładki ✓ | +30 pkt |
| Czas <30 sek | +20 pkt |
| Zużycie >95% | +40 pkt |
| Błąd | -10 pkt |

**Gwiazdki (1-3):**
- ⭐⭐⭐: Wszystko poprawne + czas <45s + materiał >95%
- ⭐⭐: Poprawne lub czas <60s
- ⭐: Ukończone (nawet z błędami)

---

### Profil gracza (cookies)

```javascript
{
  playerId: "uuid",
  nickname: "TwójNick",
  createdAt: timestamp,
  totalPoints: number,
  completedLevels: ["1-1", "1-2", ...],
  badges: ["first_room", "master_13", ...],
  levelStats: {
    "1-1": { points: 150, time: 45, materials: 97%, stars: 3 }
  },
  currentStreak: number,
  longestStreak: number
}
```

---

### Odznaki (9 sztuk)

| ID | Nazwa | Warunek | Ikona |
|----|-------|---------|-------|
| first_room | Pierwsze kroki | Ukończ 1. pokój | 🏠 |
| master_13 | Mistrz 1/3 | 10x technika 1/3 | 📐 |
| speed_demon | Szybki Montaż | <30 sek | ⚡ |
| saver | Oszczędny | >95% materiału | 🎯 |
| streak_5 | Seria | 5 poziomów z rzędu | 🔥 |
| professional | Zawodowiec | Ukończ poziom 1 | ⭐ |
| expert | Ekspert | Ukończ poziom 2 | 🌟 |
| master_panel | Mistrz Paneli | Wszystkie 30 | 👑 |
| grand_master | Wielki Mistrz | Wszystkie odznaki | 🏆 |

**PNG odznaki:** 200×200px z nickiem gracza i datą zdobycia - możliwość pobrania

---

### Dźwięki (8 sztuk)

| Dźwięk | Sytuacja |
|--------|----------|
| ✓ | Poprawny panel |
| ❌ | Błąd |
| 🏆 | Nowa odznaka |
| ⏱️ | Timer tyka |
| 🎉 | Ukończenie poziomu |
| 🆗 | Nowy rekord |
| 🔔 | Bonus zdobyty |
| 🎵 | Muzyka w tle (opcjonalne) |

---

### Widget profilu

**Floating button** (prawy dolny róg):
- Ikona: 🎮 lub kostka panelu
- Po kliknięciu → popup z:
  - Nick gracza
  - Łączne punkty
  - Pasek postępu (ukonczono X/30)
  - Zdobyte odznaki (ikony)
  - Przycisk "Mój profil" → pełny modal

**Modal profilu:**
- Avatar + nick
- Statystyki: punkty, misje, seria, ulubiony pokój
- Tabela wyników (sortowalna)
- Odznaki (klik → szczegóły + pobierz PNG)
- Przycisk "Wyloguj"

---

### Styl wizualny paneli

**Panele w grze - styl na prawdziwe panele podłogowe:**
- Imitacja struktury drewna (dąb, jasny buk, orzech)
- Wymiary zgodne z rzeczywistymi (1200mm × 200mm × 8mm)
- Ząbki/zakładki widoczne na krawędziach (system Click)
- Podświetlenie aktywnego panelu

**Kolorystyka paneli:**
- 🟤 Jasny dąb (najpopularniejszy)
- 🟤 Średni brąz (orzech)
- 🟤 Ciemny mahoń (elegancki)
- ⚪ Biały (nowoczesny)

---

### Strona `/floorgame`

**Sekcje:**
1. Header: Tytuł gry + widget profilu
2. Menu poziomów: Wybór poziomu (1/2/3) → pokój (1-10)
3. Game area: Pokój + stojak z panelami
4. Info bar: Timer + punkty + postęp
5. Footer: Linki do strony głównej

**Responsywność:**
- Desktop: Pełna plansza, sterowanie myszką
- Tablet: Dotyk + przeciąganie
- Mobilny: Pionowy układ, powiększone panele

---

## Zadania do wykonania

### Faza 1: Przygotowanie infrastruktury branchy

- [ ] Utworzyć branch `main-website` z obecnego stanu
- [ ] Utworzyć branch `admin-app` z main-website
- [ ] Utworzyć branch `floorgame` z main-website
- [ ] Ustawić `main-website` jako domyślny branch
- [ ] Wyczyścić niepotrzebne pliki z każdego branchu

### Faza 2: Implementacja silnika gry

- [ ] Utworzyć `/src/pages/floorgame.js`
- [ ] Utworzyć `/src/context/GameContext.js`
- [ ] Utworzyć `/src/styles/floorgame.css`
- [ ] Zaimplementować logikę tworzenia planszy (pokój)
- [ ] Zaimplementować system paneli (FloorPanel.jsx)
- [ ] Zaimplementować przeciąganie i upuszczanie

### Faza 3: Walidacja i punkty

- [ ] Zaimplementować walidację techniki 1/3
- [ ] Zaimplementować system zakładek
- [ ] Dodać obliczanie zużycia materiału
- [ ] Dodać system punktacji (bazowe + bonusy)
- [ ] Dodać system gwiazdek

### Faza 4: Poziomy i pokoje

- [ ] Zdefiniować 10 pokoi z geometrią
- [ ] Podzielić na 3 poziomy trudności
- [ ] Utworzyć interfejs wyboru poziomu/pokoju
- [ ] Dodać timer
- [ ] Dodać ekran ukończenia poziomu (LevelComplete.jsx)

### Faza 5: Profil gracza

- [ ] Utworzyć modal wpisania nicku (NickModal.jsx)
- [ ] Zaimplementować zapis profilu w cookies
- [ ] Utworzyć widget profilu (ProfileWidget.jsx)
- [ ] Utworzyć pełny modal profilu (ProfileModal.jsx)
- [ ] Dodać statystyki i historię

### Faza 6: Odznaki i nagrody

- [ ] Zdefiniować 9 odznak
- [ ] Utworzyć modal odznaki (BadgeModal.jsx)
- [ ] Dodać logikę przyznawania odznak
- [ ] Dodać możliwość pobierania odznak jako PNG

### Faza 7: Dźwięki i multimedia

- [ ] Utworzyć SoundManager.jsx
- [ ] Dodać 8 dźwięków gry
- [ ] Dodać opcjonalną muzykę w tle

### Faza 8: UI/UX i wygląd

- [ ] Dostosować style do motywu strony
- [ ] Dodać animacje (glitch, scanlines)
- [ ] Zapewnić responsywność (desktop/tablet/mobile)
- [ ] Dodać efekty wizualne (podświetlenie paneli)

### Faza 9: Testowanie i optymalizacja

- [ ] Przetestować wszystkie 30 misji
- [ ] Sprawdzić responsywność na różnych urządzeniach
- [ ] Zoptymalizować wydajność
- [ ] Poprawić błędy

### Faza 10: Release

- [ ] Utworzyć branch floorgame (już powyżej)
- [ ] Wypchnąć na produkcję
- [ ] Dodać link do gry w nawigacji strony

---

## Pliki do utworzenia

### Struktura plików minigry

```
/src/pages/floorgame.js           # Główna strona gry
/src/components/FloorGame/
  ├── GameEngine.jsx              # Silnik gry
  ├── Room.jsx                    # Komponent pokoju
  ├── FloorPanel.jsx              # Panel podłogowy
  ├── PanelRack.jsx              # Stojak z panelami
  ├── ProfileWidget.jsx          # Widget profilu
  ├── ProfileModal.jsx           # Modal szczegółowy
  ├── LevelComplete.jsx          # Ekran ukończenia
  ├── BadgeModal.jsx             # Modal odznaki
  ├── NickModal.jsx              # Modal nicku
  └── SoundManager.jsx           # Manager dźwięków
/src/context/GameContext.js       # Context stanu gry
/src/styles/floorgame.css        # Style gry
/data/player-profiles.json       # Baza profili
```

---

## Status implementacji

| Faza | Status |
|------|--------|
| Faza 1: Infrastruktura | ⏳ Do wykonania |
| Faza 2: Silnik gry | ⏳ Do wykonania |
| Faza 3: Walidacja | ⏳ Do wykonania |
| Faza 4: Poziomy | ⏳ Do wykonania |
| Faza 5: Profil | ⏳ Do wykonania |
| Faza 6: Odznaki | ⏳ Do wykonania |
| Faza 7: Dźwięki | ⏳ Do wykonania |
| Faza 8: UI/UX | ⏳ Do wykonania |
| Faza 9: Testowanie | ⏳ Do wykonania |
| Faza 10: Release | ⏳ Do wykonania |

---

## Uwagi

- Wszystkie branche pozostają w jednym repozytorium
- Każdy branch ma własne node_modules (lub współdzielone)
- Crawler pozostaje w tym samym repozytorium
- Brak automatyzacji Vercel (ręczne wdrażanie)
- Gra używa istniejącego theme system