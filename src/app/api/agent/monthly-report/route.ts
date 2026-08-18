import { runAgent, SYSTEM_PROMPT } from "@/lib/agent";
import { toNdjsonStream } from "@/lib/stream";
import { readMonthlyReportSkill } from "@/lib/skill";

export const dynamic = "force-dynamic";

export async function POST() {
  // Ak existuje skills/capa-monthly-report/SKILL.md, načíta sa a použije ako inštrukcie -
  // "ČO má agent robiť" (čitateľný SKILL.md) oddelené od "AKO to appka technicky vykoná" (kód).
  const skill = readMonthlyReportSkill();

  const userMessage = skill
    ? `Priprav podklady pre mesačnú súhrnnú správu presne podľa analýzy opísanej v nasledujúcom postupe (Agent Skill) - časť o presnej štruktúre výstupu v ňom je len orientačná, appka si výstup vykreslí sama z nástroja submit_monthly_report:\n\n${skill}\n\nNa záver zavolaj submit_monthly_report so spočítanými číslami (total_deviations, critical_count, major_count, minor_count, closed_count, open_count, top_causes, recommendations). NEZAVOLAJ write_insight - zoznam CAPA po termíne appka dopočíta sama.`
    : `Priprav mesačnú súhrnnú správu: over si všetky odchýlky (get_deviations), presne spočítaj total/critical/major/minor/closed/open a najčastejšie root_cause_category (top_causes), napíš 2-4 odporúčania. Na záver zavolaj submit_monthly_report s týmito číslami. NEZAVOLAJ write_insight.`;

  const gen = runAgent(SYSTEM_PROMPT, userMessage);
  return new Response(toNdjsonStream(gen), {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
