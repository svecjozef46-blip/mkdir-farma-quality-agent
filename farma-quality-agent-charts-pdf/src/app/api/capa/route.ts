import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("capa_actions")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  const today = new Date().toISOString().slice(0, 10);
  const withFlag = (data ?? []).map((c) => ({
    ...c,
    is_overdue: !!c.due_date && c.due_date < today && c.status !== "Closed",
  }));

  return Response.json(withFlag);
}
