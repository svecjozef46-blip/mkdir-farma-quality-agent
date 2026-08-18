# Agent Skill: Mesačná CAPA/deviations súhrnná správa

## Cieľ
Zostaviť krátku, prehľadnú mesačnú správu pre QA manažéra o stave kvalitatívnych
odchýlok (deviations) a nápravných/preventívnych opatrení (CAPA actions).

## Postup

1. Načítaj všetky odchýlky nástrojom `get_deviations` (bez filtra, aby si mal/a
   celkový prehľad).
2. Spočítaj presne (skutočný počet, nie odhad):
   - celkový počet odchýlok a počet podľa `severity` (Critical / Major / Minor),
   - najčastejšie `root_cause_category` (top 3-5, so skutočným počtom výskytov),
   - počet odchýlok so `status = 'Closed'` vs. stále otvorených.
3. CAPA akcie po termíne a počet dní omeškania NEPOČÍTAJ sám - appka si ich
   dopočíta priamo z databázy, aby čísla boli vždy presné.
4. Na základe bodov 2 sformuluj 2-4 konkrétne odporúčania (napr. "zamerať sa na
   root cause kategóriu X", "eskalovať CAPA akcie oddelenia Y").

## Výstup

Na záver zavolaj nástroj `submit_monthly_report` s poľami `total_deviations`,
`critical_count`, `major_count`, `minor_count`, `closed_count`, `open_count`,
`top_causes` (pole `{category, count}`) a `recommendations` (2-4 krátke vety).
Appka z týchto štruktúrovaných dát sama vykreslí prehľadné tabuľky, graf
najčastejších príčin a PDF export - nepíš samostatný Markdown text.

## Poznámka
Toto je demo/portfóliový projekt na 100 % fiktívnych dátach. Správa slúži na
ukážku, ako agent oddeľuje "čo má robiť" (tento súbor) od "ako to technicky
vykoná" (kód appky) - rovnaký princíp ako Agent Skills v Claude Code.
