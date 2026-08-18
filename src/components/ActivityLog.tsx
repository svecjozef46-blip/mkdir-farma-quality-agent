"use client";

import { useEffect, useRef } from "react";
import type { ActivityStep } from "@/lib/types";

const ICONS: Record<ActivityStep["type"], string> = {
  thinking: "…",
  tool_call: "→",
  tool_result: "←",
  write: "✓",
  final: "★",
  error: "✕",
};

/**
 * Viditeľný, tmavý, monospace panel, ktorý v reálnom čase ukazuje kroky agenta -
 * ktorý nástroj práve volá, s akým výsledkom, a napokon zápis do ai_insights.
 * Toto je jediný spôsob, ako niekto zvonka uvidí, že appka reálne používa
 * viackrokovú agentovú logiku (tool use), nie je to len statický text.
 */
export function ActivityLog({ steps, running }: { steps: ActivityStep[]; running: boolean }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [steps.length]);

  if (steps.length === 0 && !running) return null;

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        Agent Activity Log {running && <span className="pulse-dot" />}
      </div>
      <div className="activity-log-body">
        {steps.map((s, i) => (
          <div key={i} className={`activity-line activity-${s.type}`}>
            <span className="activity-icon">{ICONS[s.type]}</span>
            <span className="activity-text">{s.text}</span>
            {s.detail && <div className="activity-detail">{s.detail}</div>}
          </div>
        ))}
        {running && <div className="activity-line activity-thinking">agent pracuje...</div>}
        <div ref={endRef} />
      </div>
    </div>
  );
}
