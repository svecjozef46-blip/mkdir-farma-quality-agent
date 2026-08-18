"use client";

import { useCallback, useRef, useState } from "react";
import type { ActivityStep } from "./types";

/**
 * Klientský hook, ktorý zavolá streamovací API endpoint (NDJSON - jeden JSON riadok
 * na krok agenta) a postupne, ako riadky prichádzajú, ich pridáva do poľa `steps`.
 * Vďaka tomu sa "Agent Activity Log" panel plní krok za krokom v reálnom čase,
 * nie naraz až po dokončení celej agentovej úlohy.
 */
export function useAgentStream(url: string) {
  const [steps, setSteps] = useState<ActivityStep[]>([]);
  const [running, setRunning] = useState(false);
  const [finalText, setFinalText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (body: unknown) => {
      setSteps([]);
      setFinalText(null);
      setRunning(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.body) throw new Error("Server nevrátil streamovaciu odpoveď.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const step: ActivityStep = JSON.parse(line);
              setSteps((prev) => [...prev, step]);
              if (step.type === "final") setFinalText(step.text);
            } catch {
              // ignoruj nekompletný/poškodený riadok
            }
          }
        }
      } catch (err: any) {
        setSteps((prev) => [...prev, { type: "error", text: err?.message ?? String(err) }]);
      } finally {
        setRunning(false);
      }
    },
    [url]
  );

  return { steps, running, finalText, run };
}
