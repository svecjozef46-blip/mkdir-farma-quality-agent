import { runAgent, SYSTEM_PROMPT } from "@/lib/agent";
import { toNdjsonStream } from "@/lib/stream";
import { readMonthlyReportSkill } from "@/lib/skill";

export const dynamic = "force-dynamic";

export async function POST() {
  // Ak existuje skills/capa-monthly-report/SKILL.md, načíta sa a použije ako inštrukcie -
  // "ČO má agent robiť" (čitateľný SKILL.md) oddelené od "AKO to appka technicky vykoná" (kód).
  const skill = readMonthlyReportSkill();

  const userMessage = skill
    ? `Vygeneruj mesačnú súhrnnú správu presne podľa nasledujúceho postupu (Agent Skill):\n\n${skill}\n\nNa záver zavolaj write_insight s related_table='deviations', related_id='ALL', insight_type='monthly_report'.`
    : `Vygeneruj mesačnú súhrnnú správu: over si všetky odchýlky (get_deviations), zisti trendy a najčastejšie root_cause_category, over CAPA akcie po termíne (get_open_capa_past_due) a napíš odporúčania. Formátuj ako Markdown. Na záver zavolaj write_insight s related_table='deviations', related_id='ALL', insight_type='monthly_report'.`;

  const gen = runAgent(SYSTEM_PROMPT, userMessage);
  return new Response(toNdjsonStream(gen), {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
