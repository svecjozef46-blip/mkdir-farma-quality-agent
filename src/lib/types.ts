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
export type ActivityStep = {
  type: "thinking" | "tool_call" | "tool_result" | "write" | "final" | "error";
  text: string;
  detail?: string;
};
