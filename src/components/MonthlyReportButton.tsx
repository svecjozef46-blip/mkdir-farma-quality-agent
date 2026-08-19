"use client";

import { useState } from "react";
import { useAgentStream } from "@/lib/useAgentStream";
import { ActivityLog } from "./ActivityLog";
import { MonthlyReportView } from "./MonthlyReportView";
import type { MonthlyReportData } from "@/lib/types";

export function MonthlyReportButton() {
  const [dismissed, setDismissed] = useState(false);
  const { steps, running, structured, run } = useAgentStream("/api/agent/monthly-report");
  const report = structured["submit_monthly_report"] as MonthlyReportData | undefined;
  const hasOutput = !dismissed && (steps.length > 0 || running);

  return (
    <div className="card">
      <div className="card-header-row">
        <h3>Mesačná súhrnná správa</h3>
        <button
          className="btn btn-primary"
          disabled={running}
          onClick={() => {
            setDismissed(false);
            run({});
          }}
        >
          {running ? "Generujem..." : "Vygeneruj mesačnú správu"}
        </button>
      </div>

      {hasOutput && (
        <>
          <div className="output-close-row">
            <button type="button" className="btn btn-secondary btn-close-output" onClick={() => setDismissed(true)}>
              ✕ Zavrieť výstup
            </button>
          </div>

          <ActivityLog steps={steps} running={running} />
          {report && <MonthlyReportView report={report} />}
        </>
      )}
    </div>
  );
}
