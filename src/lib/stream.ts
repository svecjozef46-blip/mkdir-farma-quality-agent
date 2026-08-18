import type { ActivityStep } from "./types";

/**
 * Zabalí async generator krokov agenta do NDJSON streamu (jeden JSON objekt na riadok),
 * ktorý frontend číta postupne cez fetch + ReadableStream reader - vďaka tomu sa riadky
 * v "Agent Activity Log" paneli objavujú jeden po druhom, nie všetky naraz na konci.
 */
export function toNdjsonStream(gen: AsyncGenerator<ActivityStep, void, unknown>): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const step of gen) {
          controller.enqueue(encoder.encode(JSON.stringify(step) + "\n"));
        }
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", text: err?.message ?? String(err) }) + "\n")
        );
      } finally {
        controller.close();
      }
    },
  });
}
