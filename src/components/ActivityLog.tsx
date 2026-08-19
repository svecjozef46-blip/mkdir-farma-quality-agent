"use client";

import { useEffect, useRef, useState } from "react";
import type { ActivityStep } from "@/lib/types";

const ICONS: Record<ActivityStep["type"], string> = {
  thinking: "…",
  tool_call: "→",
  tool_result: "←",
  write: "✓",
  structured: "▤",
  final: "★",
  error: "✕",
};

/**
 * Viditeľný, tmavý, monospace panel, ktorý v reálnom čase ukazuje kroky agenta -
 * ktorý nástroj práve volá, s akým výsledkom, a napokon zápis do ai_insights.
 * Toto je jediný spôsob, ako niekto zvonka uvidí, že appka reálne používa
 * viackrokovú agentovú logiku (tool use), nie je to len statický text.
 *
 * Kým agent beží, log je vždy celý rozbalený. Hneď po dokončení (running:
 * true -> false) sa sám zbalí na jeden riadok - v popredí ostáva hlavne
 * výsledok, priebeh je jeden klik ďaleko cez "zobraziť priebeh".
 */
export function ActivityLog({ steps, running }: { steps: ActivityStep[]; running: boolean }) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const prevRunning = useRef(running);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [steps.length]);

  useEffect(() => {
    if (prevRunning.current && !running) {
      setCollapsed(true);
    }
    prevRunning.current = running;
  }, [running]);

  if (steps.length === 0 && !running) return null;

  const expanded = running || !collapsed;

  return (
    <div className="activity-log">
      <button
        type="button"
        className="activity-log-header activity-log-toggle"
        onClick={() => setCollapsed((c) => !c)}
        disabled={running}
        aria-expanded={expanded}
      >
        <span className="activity-log-title">
          Agent Activity Log {running && <span className="pulse-dot" />}
        </span>
        {!running && (
          <span className="activity-log-caret">
            {collapsed ? "▸ zobraziť priebeh" : "▾ skryť priebeh"}
          </span>
        )}
      </button>
      {expanded && (
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
      )}
    </div>
  );
}
