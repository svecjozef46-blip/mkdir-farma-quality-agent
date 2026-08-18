import Anthropic from "@anthropic-ai/sdk";
import { TOOL_DEFINITIONS, executeTool } from "./tools";
import type { ActivityStep } from "./types";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Chýba ANTHROPIC_API_KEY - skontroluj .env súbor (pozri .env.example).");
  }
  return new Anthropic({ apiKey });
}

const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOOL_ROUNDS = 8;

/**
 * Spustí viackrokového agenta s tool-use nad Supabase dátami.
 * Je to async generator - každý krok (volanie nástroja, výsledok, finálna odpoveď)
 * sa hneď posiela von cez `yield`, aby ho API route mohla priebežne streamovať
 * do "Agent Activity Log" panelu na frontende namiesto toho, aby používateľ čakal
 * na jednu veľkú odpoveď na konci.
 */
export async function* runAgent(
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<ActivityStep, void, unknown> {
  const client = getClient();

  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userMessage }];

  // Claude часто napíše samotnú odpoveď v TOM ISTOM kole, v ktorom aj zavolá write_insight
  // (text + tool_use v jednej správe) - v takom kole stop_reason je "tool_use", takže by sme
  // text zahodili, ak by sme za "finálnu odpoveď" považovali len text z posledného kola.
  // Preto zbierame text zo VŠETKÝCH kôl a na konci ich spojíme - odpoveď sa tak nikdy nestratí.
  const answerParts: string[] = [];

  yield { type: "thinking", text: "Agent prijal zadanie, rozhoduje, ktoré dáta potrebuje..." };

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: 2000,
        system: systemPrompt,
        tools: TOOL_DEFINITIONS,
        messages,
      });
    } catch (err: any) {
      yield { type: "error", text: "Chyba pri volaní Anthropic API.", detail: err?.message ?? String(err) };
      return;
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );

    for (const t of textBlocks) {
      if (t.text.trim()) {
        answerParts.push(t.text.trim());
        yield { type: "thinking", text: t.text.trim() };
      }
    }

    if (response.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
      const finalText = answerParts.join("\n\n").trim();
      yield { type: "final", text: finalText || "Agent neposkytol textovú odpoveď." };
      return;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const call of toolUseBlocks) {
      yield {
        type: "tool_call",
        text: `Volám nástroj: ${call.name}`,
        detail: JSON.stringify(call.input),
      };

      try {
        const result = await executeTool(call.name, call.input);
        const count = Array.isArray(result) ? result.length : 1;

        // Nástroje submit_* a show_* nesú štruktúrované dáta pre frontend (mesačná správa,
        // graf) - appka ich vie priamo vykresliť namiesto toho, aby ich musela parsovať z textu.
        const isStructured = call.name.startsWith("submit_") || call.name.startsWith("show_");

        if (isStructured) {
          yield {
            type: "structured",
            text: call.name === "submit_monthly_report" ? "Mesačná správa zostavená." : "Graf pripravený.",
            structuredKind: call.name,
            data: result,
          };
        } else {
          yield {
            type: call.name === "write_insight" ? "write" : "tool_result",
            text:
              call.name === "write_insight"
                ? "Zapísané do ai_insights."
                : `Výsledok: ${count} záznam(ov).`,
            detail: JSON.stringify(result).slice(0, 4000),
          };
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify(result),
        });
      } catch (err: any) {
        const errMsg = err?.message ?? String(err);
        yield { type: "error", text: `Nástroj ${call.name} zlyhal.`, detail: errMsg };
        toolResults.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: `Error: ${errMsg}`,
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  yield {
    type: "error",
    text: `Agent dosiahol limit ${MAX_TOOL_ROUNDS} krokov bez finálnej odpovede.`,
  };
}

export const SYSTEM_PROMPT = `Si "Quality Deviation & CAPA Insight Agent" - AI asistent nad demo databázou kvalitatívnych odchýlok (deviations) a nápravných opatrení (CAPA actions) fiktívnej farma/medtech firmy.

Pravidlá:
- Dáta si VŽDY over cez dostupné nástroje (tools). Nikdy si nevymýšľaj čísla, ID ani obsah záznamov.
- Buď stručný a konkrétny, píš po slovensky.
- Pri kategorizácii jednej odchýlky alebo odpovedi na voľnú otázku na záver zavolaj write_insight, aby zostal záznam v databáze.
- Pri generovaní MESAČNEJ SPRÁVY: over si dáta cez get_deviations (spočítaj presne total/critical/major/minor/closed/open a top_causes) a NEZAVOLAJ write_insight - namiesto toho na záver zavolaj submit_monthly_report so spočítanými číslami. Zoznam CAPA po termíne appka dopočíta sama, neposielaj ho.
- Pri odpovedi na voľnú otázku používateľa si najprv sám over, ktoré nástroje/dáta potrebuješ - neodpovedaj len z všeobecných znalostí o farma/QMS procesoch, odpoveď musí byť podložená skutočnými dátami z tejto databázy. Ak odpoveď porovnáva čísla naprieč kategóriami (napr. podľa produktu, oddelenia), zváž aj zavolanie show_chart, aby appka popri texte zobrazila aj graf.
- Ak dáta na zodpovedanie otázky neexistujú alebo je otázka mimo rozsah (deviations/CAPA), povedz to úprimne namiesto vymýšľania.`;
