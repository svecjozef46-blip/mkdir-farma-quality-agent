# Agent Skill: Mesačná CAPA/deviations súhrnná správa

## Cieľ
Zostaviť krátku, prehľadnú mesačnú správu pre QA manažéra o stave kvalitatívnych
odchýlok (deviations) a nápravných/preventívnych opatrení (CAPA actions).

## Postup

1. Načítaj všetky odchýlky nástrojom `get_deviations` (bez filtra, aby si mal/a
   celkový prehľad).
2. Spočítaj:
   - celkový počet odchýlok podľa `severity` (Critical / Major / Minor),
   - najčastejšie `root_cause_category` (top 3),
   - podiel odchýlok so `status = 'Closed'` vs. stále otvorených.
3. Načítaj CAPA akcie po termíne nástrojom `get_open_capa_past_due`.
4. Pre každú CAPA po termíne uveď: `capa_id`, súvisiace `deviation_id`,
   `owner_role` a o koľko dní je po termíne (today - due_date).
5. Na základe bodov 2-4 sformuluj 2-4 konkrétne odporúčania (napr. "zamerať sa na
   root cause kategóriu X", "eskalovať CAPA akcie oddelenia Y").

## Požadovaná štruktúra výstupu (Markdown)

```
## Mesačná správa - Quality Deviations & CAPA

### Prehľad
- Celkovo odchýlok: N (Critical: X, Major: Y, Minor: Z)
- Uzavreté: N / Otvorené: N

### Najčastejšie príčiny
1. ...
2. ...
3. ...

### CAPA po termíne (N)
- CAPA-xxxx (súvisí s DEV-xxxx, vlastník: ..., X dní po termíne)
- ...

### Odporúčania
- ...
```

## Poznámka
Toto je demo/portfóliový projekt na 100 % fiktívnych dátach. Správa slúži na
ukážku, ako agent oddeľuje "čo má robiť" (tento súbor) od "ako to technicky
vykoná" (kód appky) - rovnaký princíp ako Agent Skills v Claude Code.
