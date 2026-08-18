import { renderToBuffer } from "@react-pdf/renderer";
import { MonthlyReportPdfDocument } from "@/lib/monthlyReportPdf";
import type { MonthlyReportData } from "@/lib/types";

export const dynamic = "force-dynamic";

// Táto route neposkytuje ŽIADNU vlastnú logiku ani volanie agenta - iba zoberie
// presne tie dáta, ktoré appka už zobrazuje na obrazovke (MonthlyReportData z
// nástroja submit_monthly_report), a vyrenderuje z nich PDF. Vďaka tomu je PDF
// vždy 1:1 zhodné s tým, čo používateľ vidí v prehliadači pred stiahnutím.
export async function POST(req: Request) {
  let report: MonthlyReportData;
  try {
    report = (await req.json()) as MonthlyReportData;
  } catch {
    return new Response(JSON.stringify({ error: "Neplatné dáta správy." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!report || typeof report.total_deviations !== "number") {
    return new Response(JSON.stringify({ error: "Chýbajú dáta mesačnej správy." }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const buffer = await renderToBuffer(MonthlyReportPdfDocument({ report }));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="mesacna-sprava-capa.pdf"',
    },
  });
}
