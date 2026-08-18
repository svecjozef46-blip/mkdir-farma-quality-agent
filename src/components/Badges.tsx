export function SeverityBadge({ severity }: { severity: string | null }) {
  const s = (severity ?? "").toLowerCase();
  let cls = "badge badge-neutral";
  if (s === "critical") cls = "badge badge-crit";
  else if (s === "major") cls = "badge badge-warn";
  else if (s === "minor") cls = "badge badge-ok";
  return <span className={cls}>{severity ?? "—"}</span>;
}

export function StatusBadge({ status }: { status: string | null }) {
  const s = (status ?? "").toLowerCase();
  let cls = "badge badge-neutral";
  if (s === "closed") cls = "badge badge-ok";
  else if (s === "open") cls = "badge badge-warn";
  else if (s === "in progress") cls = "badge badge-blue";
  return <span className={cls}>{status ?? "—"}</span>;
}

export function OverdueBadge({ overdue }: { overdue: boolean }) {
  if (!overdue) return null;
  return <span className="badge badge-crit">Po termíne</span>;
}
