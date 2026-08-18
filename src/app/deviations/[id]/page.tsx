"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SeverityBadge, StatusBadge, OverdueBadge } from "@/components/Badges";
import { ActivityLog } from "@/components/ActivityLog";
import { AgentAnswer } from "@/components/AgentAnswer";
import { useAgentStream } from "@/lib/useAgentStream";
import type { AiInsight, CapaAction, Deviation } from "@/lib/types";

export default function DeviationDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<{ deviation: Deviation; capaActions: CapaAction[]; insights: AiInsight[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { steps, running, finalText, run } = useAgentStream("/api/agent/categorize");

  useEffect(() => {
    fetch(`/api/deviations/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) setError(d.error);
        else setData(d);
      })
      .catch((e) => setError(String(e)));
  }, [params.id]);

  const today = new Date().toISOString().slice(0, 10);

  if (error) {
    return (
      <div className="card" style={{ borderColor: "var(--crit-line)" }}>
        <strong style={{ color: "var(--crit-ink)" }}>Chyba:</strong> {error}
      </div>
    );
  }

  if (!data) return <p className="muted">Načítavam...</p>;

  const { deviation, capaActions, insights } = data;

  return (
    <div>
      <Link href="/" className="muted" style={{ textDecoration: "none" }}>&larr; Späť na dashboard</Link>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-header-row">
          <h1 style={{ margin: 0 }}>{deviation.deviation_id}</h1>
          <button className="btn btn-primary" disabled={running} onClick={() => run({ deviation_id: deviation.deviation_id })}>
            {running ? "Analyzujem..." : "Analyzuj agentom"}
          </button>
        </div>
        <p style={{ marginTop: 8 }}>{deviation.description}</p>

        <div className="detail-grid" style={{ marginTop: 12 }}>
          <div className="detail-item"><div className="label">Produkt</div><div className="value">{deviation.product_line}</div></div>
          <div className="detail-item"><div className="label">Oddelenie</div><div className="value">{deviation.department}</div></div>
          <div className="detail-item"><div className="label">Závažnosť</div><div className="value"><SeverityBadge severity={deviation.severity} /></div></div>
          <div className="detail-item"><div className="label">Status</div><div className="value"><StatusBadge status={deviation.status} /></div></div>
          <div className="detail-item"><div className="label">Kategória príčiny</div><div className="value">{deviation.root_cause_category ?? "—"}</div></div>
          <div className="detail-item"><div className="label">Dátum otvorenia / uzavretia</div><div className="value">{deviation.date_opened} {deviation.date_closed ? `→ ${deviation.date_closed}` : ""}</div></div>
        </div>

        <ActivityLog steps={steps} running={running} />
        {finalText && <AgentAnswer label="Výsledok analýzy" text={finalText} />}
      </div>

      <div className="card">
        <h3>Súvisiace CAPA akcie ({capaActions.length})</h3>
        {capaActions.length === 0 && <div className="empty-note">Pre túto odchýlku zatiaľ nie sú žiadne CAPA akcie.</div>}
        {capaActions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>CAPA ID</th>
                <th>Akcia</th>
                <th>Typ</th>
                <th>Vlastník</th>
                <th>Termín</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {capaActions.map((c) => {
                const overdue = !!c.due_date && c.due_date < today && c.status !== "Closed";
                return (
                  <tr key={c.capa_id}>
                    <td>{c.capa_id}</td>
                    <td style={{ maxWidth: 280 }}>{c.action_description}</td>
                    <td>{c.action_type}</td>
                    <td>{c.owner_role}</td>
                    <td>{c.due_date} {overdue && <OverdueBadge overdue={overdue} />}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {insights.length > 0 && (
        <div className="card">
          <h3>História AI analýz</h3>
          {insights.map((ins) => (
            <div key={ins.id} style={{ marginBottom: 10 }}>
              <AgentAnswer
                label={`${ins.insight_type} · ${new Date(ins.created_at).toLocaleString("sk-SK")}`}
                text={ins.content}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
