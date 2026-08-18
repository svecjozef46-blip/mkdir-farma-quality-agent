"use client";

import ReactMarkdown from "react-markdown";

/**
 * Zobrazí finálnu textovú odpoveď agenta (mesačná správa, kategorizácia, odpoveď na otázku)
 * ako pekne naformátovaný text namiesto surového Markdownu s viditeľnými ## a **. Agent
 * (najmä mesačná správa podľa skills/capa-monthly-report/SKILL.md) píše v Markdowne -
 * toto ho vyrenderuje na skutočné nadpisy, tučné písmo a zoznamy.
 */
export function AgentAnswer({ label, text }: { label: string; text: string }) {
  return (
    <div className="agent-answer">
      <div className="agent-answer-label">{label}</div>
      <div className="agent-answer-markdown">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
