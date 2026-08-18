"use client";

import { useAgentStream } from "@/lib/useAgentStream";
import { ActivityLog } from "./ActivityLog";

export function MonthlyReportButton() {
  const { steps, running, finalText, run } = useAgentStream("/api/agent/monthly-report");

  return (
    <div className="card">
      <div className="card-header-row">
        <h3>Mesačná súhrnná správa</h3>
        <button className="btn btn-primary" disabled={running} onClick={() => run({})}>
          {running ? "Generujem..." : "Vygeneruj mesačnú správu"}
        </button>
      </div>
      <ActivityLog steps={steps} running={running} />
      {finalText && (
        <div className="agent-answer">
          <div className="agent-answer-label">Správa</div>
          <pre className="agent-answer-text agent-answer-pre">{finalText}</pre>
        </div>
      )}
    </div>
  );
}
