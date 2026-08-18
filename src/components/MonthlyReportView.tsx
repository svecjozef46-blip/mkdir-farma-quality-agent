"use client";

import { useState } from "react";
import { BarChart } from "./BarChart";
import { OverdueBadge } from "./Badges";
import type { MonthlyReportData } from "@/lib/types";

export function MonthlyReportView({ report }: { report: MonthlyReportData }) {
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    setDownloading(true);
    try {
      const res = await fetch("/api/agent/monthly-report/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (!res.ok) throw new Error(`PDF sa nepodarilo vygenerovať (${res.status}).`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mesacna-sprava-capa.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message ?? "Chyba pri sťahovaní PDF.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="agent-answer" style={{ marginTop: 14 }}>
      <div className="card-header-row" style={{ marginBottom: 4 }}>
        <div className="agent-answer-label" style={{ marginBottom: 0 }}>Mesačná správa</div>
        <button className="btn btn-secondary" onClick={downloadPdf} disabled={downloading}>
          {downloading ? "Pripravujem PDF..." : "Stiahnuť ako PDF"}
        </button>
      </div>

      <div className="stat-grid" style={{ marginTop: 10 }}>
        <div className="stat-card">
          <div className="stat-num">{report.total_deviations}</div>
          <div className="stat-label">odchýlok spolu</div>
        </div>
        <div className="stat-card crit">
          <div className="stat-num" style={{ color: "var(--crit-ink)" }}>{report.critical_count}</div>
          <div className="stat-label">critical</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-num" style={{ color: "var(--warn-ink)" }}>{report.open_count}</div>
          <div className="stat-label">otvorených</div>
        </div>
        <div className="stat-card ok">
          <div className="stat-num" style={{ color: "var(--ok-ink)" }}>{report.closed_count}</div>
          <div className="stat-label">uzavretých</div>
        </div>
      </div>

      {report.top_causes.length > 0 && (
        <BarChart title="Najčastejšie príčiny (root cause)" data={report.top_causes.map((c) => ({ label: c.category, value: c.count }))} />
      )}

      <div className="agent-answer-label" style={{ marginTop: 6 }}>
        CAPA po termíne ({report.overdue_capa.length})
      </div>
      {report.overdue_capa.length === 0 && (
        <div className="empty-note" style={{ marginBottom: 10 }}>Žiadna CAPA akcia nie je po termíne. </div>
      )}
      {report.overdue_capa.length > 0 && (
        <table style={{ marginBottom: 14 }}>
          <thead>
            <tr>
              <th>CAPA ID</th>
              <th>Odchýlka</th>
              <th>Vlastník</th>
              <th>Termín</th>
              <th>Dní po termíne</th>
            </tr>
          </thead>
          <tbody>
            {report.overdue_capa.map((c) => (
              <tr key={c.capa_id}>
                <td>{c.capa_id}</td>
                <td>{c.deviation_id}</td>
                <td>{c.owner_role}</td>
                <td>{c.due_date}</td>
                <td>
                  <OverdueBadge overdue={true} /> {c.days_overdue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {report.recommendations.length > 0 && (
        <>
          <div className="agent-answer-label">Odporúčania</div>
          <ul style={{ margin: "0 0 4px", paddingLeft: 20 }}>
            {report.recommendations.map((r, i) => (
              <li key={i} style={{ fontSize: 13.5, marginBottom: 4 }}>{r}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
