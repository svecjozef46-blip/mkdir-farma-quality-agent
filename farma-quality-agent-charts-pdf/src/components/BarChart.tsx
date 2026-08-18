"use client";

/**
 * Jednoduchý, nezávislý horizontálny stĺpcový graf (žiadna externá knižnica) - jedna séria,
 * jedna farba (dĺžka stĺpca nesie hodnotu, farba už nie je potrebná na nič ďalšie kódovať),
 * tenké pruhy so zaoblenými koncami a priamymi popiskami, presne pre porovnanie kategórií
 * (napr. najčastejšie príčiny, počty podľa produktu/oddelenia).
 */
export function BarChart({ title, data }: { title?: string; data: { label: string; value: number }[] }) {
  if (!data || data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 8);
  const max = Math.max(...sorted.map((d) => d.value), 1);

  const rowH = 28;
  const gap = 10;
  const chartH = sorted.length * (rowH + gap) - gap;
  const labelW = 150;
  const chartW = 360;
  const totalW = labelW + chartW + 46;

  return (
    <div className="bar-chart">
      {title && <div className="bar-chart-title">{title}</div>}
      <svg width="100%" viewBox={`0 0 ${totalW} ${chartH}`} role="img" aria-label={title ?? "graf"}>
        {sorted.map((d, i) => {
          const y = i * (rowH + gap);
          const barW = Math.max(4, (d.value / max) * chartW);
          return (
            <g key={d.label + i}>
              <text
                x={labelW - 8}
                y={y + rowH / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill="#535d6b"
              >
                {d.label.length > 22 ? d.label.slice(0, 21) + "…" : d.label}
              </text>
              <rect
                x={labelW}
                y={y + (rowH - 10) / 2}
                width={barW}
                height={10}
                rx={4}
                fill="#2a78d6"
              />
              <text
                x={labelW + barW + 8}
                y={y + rowH / 2}
                dominantBaseline="middle"
                fontSize="12"
                fontWeight={700}
                fill="#1c2430"
              >
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
