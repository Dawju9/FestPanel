# Task 001: Discover New Sources

## Goal
Find Polish websites that list floor installation job offers (zlecenia).

## Known Sources
- oferteo.pl (working)
- olx.pl/uslugi (partial: JSON-LD extraction works, no price on listing)
- zleca.pl (API obfuscated, data-E data-c attributes present but unclear structure)

## Search Method
Use DDG with queries like:
- "zlecenie ukladanie paneli podlogowych"
- "zlecę położenie paneli"
- "montaż paneli zlecenie"
- "szukam wykonawcy paneli podlogowych"
- "potrzebuje fachowca do paneli"

## Classification Rules
- If URL contains listing keywords (zlecenia, uslugi, oferty) → ADD to sources list
- If URL is a single offer page → EXTRACT offer data
- If URL is an article, forum, social media → SKIP

## Output
Save discovered sources to `knowledge/sources.json` with fields:
- url, site, title, found_by, found_at, active
