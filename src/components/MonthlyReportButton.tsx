"use client";

import { useAgentStream } from "@/lib/useAgentStream";
import { ActivityLog } from "./ActivityLog";
import { MonthlyReportView } from "./MonthlyReportView";
import type { MonthlyReportData } from "@/lib/types";

export function MonthlyReportButton() {
  const { steps, running, structured, run } = useAgentStream("/api/agent/monthly-report");
  const report = structured["submit_monthly_report"] as MonthlyReportData | undefined;

  return (
    <div className="card">
      <div className="card-header-row">
        <h3>Mesačná súhrnná správa</h3>
        <button className="btn btn-primary" disabled={running} onClick={() => run({})}>
          {running ? "Generujem..." : "Vygeneruj mesačnú správu"}
        </button>
      </div>
      <ActivityLog steps={steps} running={running} />
      {report && <MonthlyReportView report={report} />}
    </div>
  );
}
