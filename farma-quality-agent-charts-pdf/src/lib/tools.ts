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
      "Zapíše výsledok analýzy agenta do tabuľky ai_insights v databáze. Použi pri kategorizácii jednej odchýlky alebo pri odpovedi na voľnú otázku, aby zostal auditovateľný záznam.",
    input_schema: {
      type: "object" as const,
      properties: {
        related_table: { type: "string", description: "Názov tabuľky, ku ktorej sa insight viaže, napr. 'deviations' alebo 'capa_actions'." },
        related_id: { type: "string", description: "ID súvisiaceho záznamu (napr. deviation_id), alebo 'ALL' pre súhrnné analýzy naprieč celou tabuľkou." },
        insight_type: { type: "string", description: "Typ výstupu, napr. 'categorization', 'qa_answer'." },
        content: { type: "string", description: "Samotný text výsledku (Markdown je v poriadku)." },
      },
      required: ["related_table", "related_id", "insight_type", "content"],
    },
  },
  {
    name: "submit_monthly_report",
    description:
      "Odovzdá hotovú mesačnú súhrnnú správu ako štruktúrované dáta (nie voľný text) - appka z nich sama vykreslí prehľadné tabuľky a graf. Zavolaj PRESNE RAZ, na záver, po tom, čo si si cez get_deviations a get_open_capa_past_due overil/a skutočné dáta. Zoznam CAPA po termíne a počet dní omeškania appka dopočíta sama priamo z databázy - neposielaj ho, len súhrnné čísla a interpretáciu.",
    input_schema: {
      type: "object" as const,
      properties: {
        total_deviations: { type: "number", description: "Celkový počet odchýlok." },
        critical_count: { type: "number", description: "Počet odchýlok so severity='Critical'." },
        major_count: { type: "number", description: "Počet odchýlok so severity='Major'." },
        minor_count: { type: "number", description: "Počet odchýlok so severity='Minor'." },
        closed_count: { type: "number", description: "Počet odchýlok so status='Closed'." },
        open_count: { type: "number", description: "Počet odchýlok, ktoré NIE SÚ status='Closed'." },
        top_causes: {
          type: "array",
          description: "Najčastejšie root_cause_category, zoradené od najčastejšej, max 5 položiek.",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              count: { type: "number" },
            },
            required: ["category", "count"],
          },
        },
        recommendations: {
          type: "array",
          description: "2-4 konkrétne odporúčania na základe dát (krátke vety, po slovensky).",
          items: { type: "string" },
        },
      },
      required: ["total_deviations", "critical_count", "major_count", "minor_count", "closed_count", "open_count", "top_causes", "recommendations"],
    },
  },
  {
    name: "show_chart",
    description:
      "Voliteľné: ak odpoveď na otázku používateľa obsahuje porovnanie čísel naprieč kategóriami (napr. počet odchýlok podľa produktu, podľa oddelenia, podľa mesiaca), zavolaj tento nástroj, aby appka popri textovej odpovedi zobrazila aj jednoduchý stĺpcový graf. Nepoužívaj pri otázkach, kde graf nedáva zmysel (napr. detail jedného konkrétneho záznamu).",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Krátky názov grafu, napr. 'Odchýlky podľa produktu'." },
        data: {
          type: "array",
          description: "Dvojice label/value na zobrazenie ako stĺpce, max 8 položiek.",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              value: { type: "number" },
            },
            required: ["label", "value"],
          },
        },
      },
      required: ["title", "data"],
    },
  },
];

function todayIso() {
  // Next.js edge/node runtime - bežný Date je v poriadku (beží na serveri appky, nie v tomto build skripte).
  return new Date().toISOString().slice(0, 10);
}

function daysOverdue(dueDateIso: string): number {
  const due = new Date(dueDateIso + "T00:00:00Z").getTime();
  const today = new Date(todayIso() + "T00:00:00Z").getTime();
  return Math.max(0, Math.round((today - due) / (1000 * 60 * 60 * 24)));
}

// Nezávisle od toho, čo model povie - appka si zoznam CAPA po termíne aj počet dní
// omeškania VŽDY dopočíta sama priamo z databázy, aby čísla v tabuľke boli vždy presné.
async function fetchOverdueCapaWithDays(supabase: ReturnType<typeof getSupabaseAdmin>) {
  const { data, error } = await supabase
    .from("capa_actions")
    .select("*")
    .lt("due_date", todayIso())
    .neq("status", "Closed")
    .order("due_date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({
    capa_id: c.capa_id,
    deviation_id: c.deviation_id,
    owner_role: c.owner_role,
    due_date: c.due_date,
    days_overdue: c.due_date ? daysOverdue(c.due_date) : 0,
  }));
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

    case "submit_monthly_report": {
      const overdueCapa = await fetchOverdueCapaWithDays(supabase);

      const report = {
        generated_at: new Date().toISOString(),
        total_deviations: input.total_deviations,
        critical_count: input.critical_count,
        major_count: input.major_count,
        minor_count: input.minor_count,
        closed_count: input.closed_count,
        open_count: input.open_count,
        top_causes: input.top_causes ?? [],
        overdue_capa: overdueCapa,
        recommendations: input.recommendations ?? [],
      };

      // Čitateľná Markdown verzia sa generuje deterministicky z tých istých dát (nie ako
      // samostatný text od modelu), aby číslo v tabuľke a v histórii vždy presne sedelo.
      const md = [
        `## Mesačná správa - Quality Deviations & CAPA`,
        ``,
        `### Prehľad`,
        `- Celkovo odchýlok: ${report.total_deviations} (Critical: ${report.critical_count}, Major: ${report.major_count}, Minor: ${report.minor_count})`,
        `- Uzavreté: ${report.closed_count} / Otvorené: ${report.open_count}`,
        ``,
        `### Najčastejšie príčiny`,
        ...report.top_causes.map((c: any, i: number) => `${i + 1}. ${c.category} (${c.count})`),
        ``,
        `### CAPA po termíne (${overdueCapa.length})`,
        ...overdueCapa.map((c) => `- ${c.capa_id} (súvisí s ${c.deviation_id ?? "?"}, vlastník: ${c.owner_role ?? "?"}, ${c.days_overdue} dní po termíne)`),
        ``,
        `### Odporúčania`,
        ...report.recommendations.map((r: string) => `- ${r}`),
      ].join("\n");

      const { error } = await supabase.from("ai_insights").insert({
        related_table: "deviations",
        related_id: "ALL",
        insight_type: "monthly_report",
        content: md,
      });
      if (error) throw new Error(error.message);

      return report;
    }

    case "show_chart": {
      // Čisto zobrazovacia inštrukcia - nič sa nezapisuje do databázy, len sa vráti späť
      // modelu ako potvrdenie a appka ju zachytí a vykreslí ako graf popri textovej odpovedi.
      return { title: input.title, data: input.data };
    }

    default:
      throw new Error(`Neznámy nástroj: ${name}`);
  }
}
