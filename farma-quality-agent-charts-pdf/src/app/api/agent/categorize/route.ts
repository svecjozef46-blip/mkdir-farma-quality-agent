import { runAgent, SYSTEM_PROMPT } from "@/lib/agent";
import { toNdjsonStream } from "@/lib/stream";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { deviation_id } = await req.json();

  if (!deviation_id) {
    return new Response(JSON.stringify({ type: "error", text: "Chýba deviation_id." }), { status: 400 });
  }

  const userMessage = `Over si detail odchýlky ${deviation_id} (nástroj get_deviation_by_id) a súvisiace CAPA akcie (nástroj get_capa_actions s deviation_id=${deviation_id}). Na základe toho over/potvrď alebo naprav jej root_cause_category a napíš krátke (2-4 vety) zdôvodnenie po slovensky. Na záver zavolaj write_insight s related_table='deviations', related_id='${deviation_id}', insight_type='categorization'.`;

  const gen = runAgent(SYSTEM_PROMPT, userMessage);
  return new Response(toNdjsonStream(gen), {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
