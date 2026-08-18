# Quality Deviation & CAPA Insight Agent

## Problém
QA/kvalitárske tímy vo farma/medtech výrobe evidujú kvalitatívne odchýlky (deviations)
a nápravné/preventívne opatrenia (CAPA) v tabuľkách - je náročné rýchlo zistiť trendy,
najčastejšie príčiny alebo to, ktoré CAPA akcie sú po termíne, a mesačné súhrny sa
zvyčajne píšu ručne.

## Riešenie
Appka je demo prototyp AI agenta, ktorý nad Supabase databázou:
- zobrazuje dashboard odchýlok a CAPA akcií s farebným označením podľa závažnosti/statusu a zvýraznením akcií po termíne,
- na tlačidlo vygeneruje mesačnú súhrnnú správu (stat prehľad, graf najčastejších príčin, prehľadná tabuľka CAPA po termíne s presným počtom dní omeškania, odporúčania) a vie ju exportovať ako PDF na stiahnutie,
- na tlačidlo pri konkrétnej odchýlke overí/spresní jej kategóriu príčiny,
- odpovedá na ĽUBOVOĽNÚ voľnú otázku používateľa o dátach cez pole "Opýtaj sa agenta", a keď to dáva zmysel (napr. porovnanie naprieč kategóriami), pridá k odpovedi aj jemný stĺpcový graf,
- pri každom spustení agenta ukazuje v reálnom čase "Agent Activity Log" - presne to, ktoré nástroje agent volá a s akým výsledkom, ako dôkaz viackrokovej agentovej (tool use) logiky, nie len jedného AI textu.

**Dôležité:** appka beží na 100 % fiktívnych dátach fiktívnej firmy. Je to portfóliové
demo, nie produkčný QMS systém pre reálnu firmu.

## Tech stack
Next.js 14 (App Router, TypeScript), Supabase (Postgres + JS klient), oficiálny
Anthropic TypeScript SDK s tool use (`claude-sonnet-4-5`), `@react-pdf/renderer`
na PDF export mesačnej správy priamo na serveri appky (bez potreby prehliadača/Puppeteer).
Voliteľné rozšírenie: logika mesačnej správy je zabalená ako Agent Skill
(`skills/capa-monthly-report/SKILL.md`) - agent si ho pri generovaní správy sám
načíta a použije ako inštrukcie, namiesto toho aby bol celý postup napevno
zapísaný v kóde appky. Číselné údaje (súčty, počty dní po termíne) appka vždy
nezávisle prepočíta z databázy - nikdy sa nespolieha len na aritmetiku modelu.

## Ako appku spustiť

### 1. Nainštaluj závislosti
```
npm install
```

### 2. Priprav .env
Skopíruj `.env.example` ako `.env` a vyplň tri hodnoty (presný postup, kde ich v
Supabase/Anthropic nájsť, je v návode `Navod_AI_Demo_Projekty_Claude_Code`, sekcie 2 a 3):
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
```

### 3. Priprav dáta v Supabase
V Supabase SQL Editore vytvor tabuľky (SQL je v návode, sekcia 6) a cez Table Editor
naimportuj CSV s deviations a capa_actions.

### 4. Spusti appku lokálne
```
npm run dev
```
Appka pobeží na http://localhost:3000

### 5. Nasadenie naživo (bez terminálu)
Na vercel.com: "Add New" → "Project" → vyber tento GitHub repozitár → v "Environment
Variables" vlož rovnaké tri hodnoty ako do `.env` → "Deploy". Vercel appku sám
rozpozná a postaví, žiadny terminál ani CLI netreba.

## Ako appku neskôr upravovať
Nie si vývojár - to je v poriadku. Popíš v chate s Claude (Kariéra a CV projekt),
čo chceš zmeniť, dostaneš späť upravené súbory, tie nahradíš v priečinku a v
GitHub Desktop klikneš "Commit to main" → "Push origin". Vercel appku po pushnutí
zmien automaticky prenasadí.

## Štruktúra projektu
```
src/lib/         - Supabase klient, definície nástrojov (tools), agentová slučka (tool use)
src/app/api/     - API routes (dátové aj agentové, streamované ako NDJSON)
src/app/         - stránky (dashboard, detail odchýlky, CAPA zoznam)
src/components/  - Activity Log panel, "Opýtaj sa agenta", zdieľané UI prvky
skills/          - voliteľný Agent Skill pre mesačnú správu
```
