"use client";

import { useState } from "react";
import { useAgentStream } from "@/lib/useAgentStream";
import { ActivityLog } from "./ActivityLog";
import { AgentAnswer } from "./AgentAnswer";
import { BarChart } from "./BarChart";
import type { ChartData } from "@/lib/types";

/**
 * HLAVNÝ interaktívny prvok appky: voľné textové pole, kde návštevník napíše
 * ĽUBOVOĽNÚ otázku o odchýlkach/CAPA a agent na ňu reálne odpovie cez tool use.
 * Nie sú tu žiadne preddefinované tlačidlá s pevnými otázkami.
 */
export function AskAgent() {
  const [question, setQuestion] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const { steps, running, finalText, structured, run } = useAgentStream("/api/agent/ask");
  const chart = structured["show_chart"] as ChartData | undefined;
  const hasOutput = !dismissed && (steps.length > 0 || running);

  const examples = [
    "ktoré produkty majú najviac kritických odchýlok?",
    "ktoré oddelenie má najviac oneskorených CAPA akcií?",
    "aký je pomer uzavretých a otvorených odchýlok?",
  ];

  return (
    <div className="card ask-agent">
      <h3>Opýtaj sa agenta</h3>
      <p className="muted">
        Napíš ľubovoľnú otázku o odchýlkach alebo CAPA akciách - agent si sám dotiahne relevantné dáta z databázy.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!question.trim() || running) return;
          setDismissed(false);
          run({ question });
        }}
      >
        <textarea
          className="ask-input"
          placeholder="Napr. ktoré produkty majú najviac kritických odchýlok?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
        />
        <button type="submit" className="btn btn-primary" disabled={running || !question.trim()}>
          {running ? "Agent pracuje..." : "Opýtať sa agenta"}
        </button>
      </form>
      <div className="examples">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            className="chip"
            disabled={running}
            onClick={() => setQuestion(ex)}
          >
            {ex}
          </button>
        ))}
      </div>

      {hasOutput && (
        <>
          <div className="output-close-row">
            <button type="button" className="btn btn-secondary btn-close-output" onClick={() => setDismissed(true)}>
              ✕ Zavrieť výstup
            </button>
          </div>

          <ActivityLog steps={steps} running={running} />

          {finalText && (
            <AgentAnswer label="Odpoveď agenta" text={finalText}>
              {chart && <BarChart title={chart.title} data={chart.data} />}
            </AgentAnswer>
          )}
        </>
      )}
    </div>
  );
}
