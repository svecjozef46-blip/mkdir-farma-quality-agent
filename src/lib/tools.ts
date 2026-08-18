import { getSupabaseAdmin } from "./supabase";

// Definície nástrojov (tool use) presne podľa Anthropic Messages API formátu.
// Agent si sám vyberá, ktoré z nich a v akom poradí zavolá - nedostáva všetky dáta naraz v jednom prompte.
export const TOOL_DEFINITIONS = [
  {
    name: "get_deviations",
    description:
      "Vráti zoznam odchýlok (deviations) z databázy, voliteľne filtrovaný podľa statusu, závažnosti (severity) alebo produktovej línie. Použi na prieskum dát pred kategorizáciou alebo mesačnou správou.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: { type: "string", description: "Filter podľa poľa status (napr. 'Open', 'Closed'). Nepovinné." },
        severity: { type: "string", description: "Filter podľa poľa severity (napr. 'Critical', 'Major', 'Minor'). Nepovinné." },
        product_line: { type: "string", description: "Filter podľa produktovej línie. Nepovinné." },
        limit: { type: "number", description: "Maximálny počet vrátených záznamov (predvolené 200)." },
      },
    },
  },
  {
    name: "get_deviation_by_id",
    description: "Vráti detail jednej konkrétnej odchýlky podľa deviation_id.",
    input_schema: {
      type: "object" as const,
      properties: {
        deviation_id: { type: "string", description: "ID odchýlky, napr. DEV-2025001." },
      },
      required: ["deviation_id"],
    },
  },
  {
    name: "get_capa_actions",
    description:
      "Vráti zoznam CAPA akcií (nápravné/preventívne opatrenia), voliteľne filtrovaný podľa deviation_id alebo statusu.",
    input_schema: {
      type: "object" as const,
      properties: {
        deviation_id: { type: "string", description: "Ak je zadané, vráti len CAPA akcie súvisiace s touto odchýlkou." },
        status: { type: "string", description: "Filter podľa poľa status (napr. 'Open', 'In Progress', 'Closed')." },
        limit: { type: "number", description: "Maximálny počet vrátených záznamov (predvolené 200)." },
      },
    },
  },
  {
    name: "get_open_capa_past_due",
    description:
      "Vráti CAPA akcie, ktoré sú PO TERMÍNE (due_date je v minulosti) a zároveň nemajú status 'Closed'. Použi na identifikáciu rizikových/omeškaných úloh.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "write_insight",
    description:
      "Zapíše výsledok analýzy agenta do tabuľky ai_insights v databáze. Vždy zavolaj na konci, keď máš finálny výsledok (kategorizáciu, mesačnú správu alebo odpoveď na otázku), aby zostal auditovateľný záznam.",
    input_schema: {
      type: "object" as const,
      properties: {
        related_table: { type: "string", description: "Názov tabuľky, ku ktorej sa insight viaže, napr. 'deviations' alebo 'capa_actions'." },
        related_id: { type: "string", description: "ID súvisiaceho záznamu (napr. deviation_id), alebo 'ALL' pre súhrnné analýzy naprieč celou tabuľkou." },
        insight_type: { type: "string", description: "Typ výstupu, napr. 'categorization', 'monthly_report', 'qa_answer'." },
        content: { type: "string", description: "Samotný text výsledku (Markdown je v poriadku)." },
      },
      required: ["related_table", "related_id", "insight_type", "content"],
    },
  },
];

function todayIso() {
  // Next.js edge/node runtime - bežný Date je v poriadku (beží na serveri appky, nie v tomto build skripte).
  return new Date().toISOString().slice(0, 10);
}

// Vykoná daný nástroj a vráti výsledok, ktorý sa pošle späť modelu ako tool_result.
export async function executeTool(name: string, input: any): Promise<any> {
  const supabase = getSupabaseAdmin();

  switch (name) {
    case "get_deviations": {
      let q = supabase.from("deviations").select("*").limit(input?.limit ?? 200);
      if (input?.status) q = q.eq("status", input.status);
      if (input?.severity) q = q.eq("severity", input.severity);
      if (input?.product_line) q = q.eq("product_line", input.product_line);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data;
    }

    case "get_deviation_by_id": {
      const { data, error } = await supabase
        .from("deviations")
        .select("*")
        .eq("deviation_id", input.deviation_id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    }

    case "get_capa_actions": {
      let q = supabase.from("capa_actions").select("*").limit(input?.limit ?? 200);
      if (input?.deviation_id) q = q.eq("deviation_id", input.deviation_id);
      if (input?.status) q = q.eq("status", input.status);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data;
    }

    case "get_open_capa_past_due": {
      const { data, error } = await supabase
        .from("capa_actions")
        .select("*")
        .lt("due_date", todayIso())
        .neq("status", "Closed");
      if (error) throw new Error(error.message);
      return data;
    }

    case "write_insight": {
      const { data, error } = await supabase
        .from("ai_insights")
        .insert({
          related_table: input.related_table,
          related_id: input.related_id,
          insight_type: input.insight_type,
          content: input.content,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    default:
      throw new Error(`Neznámy nástroj: ${name}`);
  }
}
