import { runAgent, SYSTEM_PROMPT } from "@/lib/agent";
import { toNdjsonStream } from "@/lib/stream";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { question } = await req.json();

  if (!question || typeof question !== "string" || !question.trim()) {
    return new Response(JSON.stringify({ type: "error", text: "Chýba otázka." }), { status: 400 });
  }

  const userMessage = `Používateľ sa pýta (voľná otázka, nie preddefinovaný scenár): "${question.trim()}"\n\nOver si potrebné dáta cez nástroje a odpovedz. Ak je vhodné, na záver zavolaj write_insight s related_table='deviations' (alebo 'capa_actions'), related_id='ALL', insight_type='qa_answer'.`;

  const gen = runAgent(SYSTEM_PROMPT, userMessage);
  return new Response(toNdjsonStream(gen), {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
