import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quality Deviation & CAPA Insight Agent — demo",
  description: "Demo prototyp AI agenta nad farma/medtech quality dátami. 100% fiktívne dáta.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <div className="demo-banner">
          Demo prototyp na 100% fiktívnych dátach (fiktívna firma). Nie je to reálny produkčný QMS systém.
        </div>
        <header className="app-header">
          <div className="app-header-inner">
            <span className="app-title">Quality Deviation &amp; CAPA Insight Agent</span>
            <nav className="app-nav">
              <Link href="/">Dashboard</Link>
              <Link href="/capa">CAPA akcie</Link>
            </nav>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
