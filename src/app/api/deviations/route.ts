import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const product_line = searchParams.get("product_line");
  const root_cause_category = searchParams.get("root_cause_category");

  const supabase = getSupabaseAdmin();
  let q = supabase.from("deviations").select("*").order("date_opened", { ascending: false });
  if (product_line) q = q.eq("product_line", product_line);
  if (root_cause_category) q = q.eq("root_cause_category", root_cause_category);

  const { data, error } = await q;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return Response.json(data);
}
