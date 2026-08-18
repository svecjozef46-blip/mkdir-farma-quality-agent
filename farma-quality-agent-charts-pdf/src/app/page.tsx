"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { AskAgent } from "@/components/AskAgent";
import { MonthlyReportButton } from "@/components/MonthlyReportButton";
import type { Deviation } from "@/lib/types";

export default function DashboardPage() {
  const [deviations, setDeviations] = useState<Deviation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetch("/api/deviations")
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else setDeviations(data);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const products = useMemo(
    () => Array.from(new Set((deviations ?? []).map((d) => d.product_line).filter(Boolean))) as string[],
    [deviations]
  );
  const categories = useMemo(
    () => Array.from(new Set((deviations ?? []).map((d) => d.root_cause_category).filter(Boolean))) as string[],
    [deviations]
  );

  const filtered = (deviations ?? []).filter(
    (d) =>
      (!productFilter || d.product_line === productFilter) &&
      (!categoryFilter || d.root_cause_category === categoryFilter)
  );

  const stats = useMemo(() => {
    const list = deviations ?? [];
    return {
      total: list.length,
      critical: list.filter((d) => (d.severity ?? "").toLowerCase() === "critical").length,
      open: list.filter((d) => (d.status ?? "").toLowerCase() !== "closed").length,
    };
  }, [deviations]);

  return (
    <div>
      <h1>Dashboard odchýlok</h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        Prehľad kvalitatívnych odchýlok (deviations) a AI agent, ktorý nad nimi vie kategorizovať, zhŕňať a odpovedať na otázky.
      </p>

      {error && (
        <div className="card" style={{ borderColor: "var(--crit-line)" }}>
          <strong style={{ color: "var(--crit-ink)" }}>Chyba pri načítaní dát:</strong> {error}
          <div className="muted" style={{ marginTop: 6 }}>
            Skontroluj .env súbor (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) a že tabuľka "deviations" existuje a má dáta.
          </div>
        </div>
      )}

      {!error && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-num">{deviations ? stats.total : "…"}</div>
            <div className="stat-label">odchýlok spolu</div>
          </div>
          <div className="stat-card crit">
            <div className="stat-num" style={{ color: "var(--crit-ink)" }}>{deviations ? stats.critical : "…"}</div>
            <div className="stat-label">kritických</div>
          </div>
          <div className="stat-card warn">
            <div className="stat-num" style={{ color: "var(--warn-ink)" }}>{deviations ? stats.open : "…"}</div>
            <div className="stat-label">stále otvorených</div>
          </div>
        </div>
      )}

      <MonthlyReportButton />

      <AskAgent />

      <div className="card">
        <div className="card-header-row">
          <h3>Zoznam odchýlok</h3>
        </div>
        <div className="filters">
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
            <option value="">Všetky produkty</option>
            {products.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">Všetky kategórie príčin</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {!deviations && !error && <p className="muted">Načítavam...</p>}

        {deviations && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Produkt</th>
                <th>Popis</th>
                <th>Závažnosť</th>
                <th>Status</th>
                <th>Otvorené</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.deviation_id}>
                  <td>
                    <Link className="row-link" href={`/deviations/${d.deviation_id}`}>
                      {d.deviation_id}
                    </Link>
                  </td>
                  <td>{d.product_line}</td>
                  <td style={{ maxWidth: 320 }}>{d.description}</td>
                  <td><SeverityBadge severity={d.severity} /></td>
                  <td><StatusBadge status={d.status} /></td>
                  <td>{d.date_opened}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
