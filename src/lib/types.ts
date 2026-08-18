export type Deviation = {
  deviation_id: string;
  date_opened: string | null;
  product_line: string | null;
  description: string | null;
  root_cause_category: string | null;
  severity: string | null;
  status: string | null;
  date_closed: string | null;
  department: string | null;
};

export type CapaAction = {
  capa_id: string;
  deviation_id: string | null;
  action_description: string | null;
  action_type: string | null;
  owner_role: string | null;
  due_date: string | null;
  status: string | null;
  date_closed: string | null;
};

export type AiInsight = {
  id: number;
  related_table: string;
  related_id: string | null;
  insight_type: string;
  content: string;
  created_at: string;
};

// Jeden krok, ktorý sa v reálnom čase posiela do "Agent Activity Log" panelu na frontende.
// "structured" nesie dáta zo "submit_*"/"show_*" nástrojov (napr. mesačná správa, graf) -
// namiesto toho, aby appka musela parsovať čísla zo surového textu odpovede.
export type ActivityStep = {
  type: "thinking" | "tool_call" | "tool_result" | "write" | "final" | "error" | "structured";
  text: string;
  detail?: string;
  structuredKind?: string;
  data?: unknown;
};

export type TopCause = { category: string; count: number };

export type OverdueCapaRow = {
  capa_id: string;
  deviation_id: string | null;
  owner_role: string | null;
  due_date: string | null;
  days_overdue: number;
};

// Výstup nástroja submit_monthly_report - časť (súčty, top príčiny, odporúčania) pochádza
// od Claude (vyžaduje interpretáciu), zoznam CAPA po termíne a počet dní omeškania appka
// vždy dopočíta sama priamo z databázy (nespolieha sa na to, že si to LLM správne spočíta).
export type MonthlyReportData = {
  generated_at: string;
  total_deviations: number;
  critical_count: number;
  major_count: number;
  minor_count: number;
  closed_count: number;
  open_count: number;
  top_causes: TopCause[];
  overdue_capa: OverdueCapaRow[];
  recommendations: string[];
};

export type ChartData = {
  title: string;
  data: { label: string; value: number }[];
};
