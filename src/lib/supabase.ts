import { createClient } from "@supabase/supabase-js";

// POZOR: tento klient používa service_role kľúč - má PLNÝ prístup k databáze
// a smie sa používať LEN na serveri (API routes), nikdy v kóde, ktorý beží v prehliadači.
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Chýbajú SUPABASE_URL alebo SUPABASE_SERVICE_ROLE_KEY - skontroluj .env súbor (pozri .env.example)."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    // Next.js by inak (aj v produkcii na Vercel) mohol interné fetch volania Supabase klienta
    // cachovať naprieč requestami - appka by potom vedela ukazovať zastarané dáta (napr. po
    // zápise agenta do ai_insights). Táto appka má vždy zobrazovať aktuálny stav databázy.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export { getSupabaseAdmin };
