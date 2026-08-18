"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge, OverdueBadge } from "@/components/Badges";

type CapaRow = {
  capa_id: string;
  deviation_id: string | null;
  action_description: string | null;
  action_type: string | null;
  owner_role: string | null;
  due_date: string | null;
  status: string | null;
  is_overdue: boolean;
};

export default function CapaPage() {
  const [rows, setRows] = useState<CapaRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  useEffect(() => {
    fetch("/api/capa")
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else setRows(data);
      })
      .catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <div className="card" style={{ borderColor: "var(--crit-line)" }}>
        <strong style={{ color: "var(--crit-ink)" }}>Chyba:</strong> {error}
      </div>
    );
  }

  const overdueCount = (rows ?? []).filter((r) => r.is_overdue).length;
  const visible = onlyOverdue ? (rows ?? []).filter((r) => r.is_overdue) : rows ?? [];

  return (
    <div>
      <h1>CAPA akcie</h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        Nápravné a preventívne opatrenia naprieč všetkými odchýlkami. Zvýraznené sú tie po termíne.
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-num">{rows ? rows.length : "…"}</div>
          <div className="stat-label">CAPA akcií spolu</div>
        </div>
        <div className="stat-card crit">
          <div className="stat-num" style={{ color: "var(--crit-ink)" }}>{rows ? overdueCount : "…"}</div>
          <div className="stat-label">po termíne</div>
        </div>
      </div>

      <div className="card">
        <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} />
          Zobraziť len po termíne
        </label>

        {!rows && <p className="muted">Načítavam...</p>}

        {rows && (
          <table>
            <thead>
              <tr>
                <th>CAPA ID</th>
                <th>Odchýlka</th>
                <th>Akcia</th>
                <th>Vlastník</th>
                <th>Termín</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.capa_id}>
                  <td>{c.capa_id}</td>
                  <td>
                    {c.deviation_id && (
                      <Link className="row-link" href={`/deviations/${c.deviation_id}`}>
                        {c.deviation_id}
                      </Link>
                    )}
                  </td>
                  <td style={{ maxWidth: 300 }}>{c.action_description}</td>
                  <td>{c.owner_role}</td>
                  <td>{c.due_date} {c.is_overdue && <OverdueBadge overdue={c.is_overdue} />}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
