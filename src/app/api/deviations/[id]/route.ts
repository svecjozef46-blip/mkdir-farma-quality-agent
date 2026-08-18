import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();

  const { data: deviation, error: devErr } = await supabase
    .from("deviations")
    .select("*")
    .eq("deviation_id", params.id)
    .maybeSingle();

  if (devErr) return new Response(JSON.stringify({ error: devErr.message }), { status: 500 });
  if (!deviation) return new Response(JSON.stringify({ error: "Odchýlka nenájdená." }), { status: 404 });

  const { data: capaActions, error: capaErr } = await supabase
    .from("capa_actions")
    .select("*")
    .eq("deviation_id", params.id)
    .order("due_date", { ascending: true });

  if (capaErr) return new Response(JSON.stringify({ error: capaErr.message }), { status: 500 });

  const { data: insights } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("related_table", "deviations")
    .eq("related_id", params.id)
    .order("created_at", { ascending: false });

  return Response.json({ deviation, capaActions, insights: insights ?? [] });
}
