import fs from "fs";
import path from "path";

/**
 * Načíta skills/capa-monthly-report/SKILL.md, ak existuje. Toto je zámerne oddelené
 * od kódu agenta - obsah SKILL.md (v prirodzenom jazyku) opisuje PRESNE, ako sa má
 * mesačná správa zostaviť, a agent ho použije ako inštrukcie namiesto toho, aby bol
 * celý postup napevno zapísaný v TypeScripte.
 */
export function readMonthlyReportSkill(): string | null {
  try {
    const skillPath = path.join(process.cwd(), "skills", "capa-monthly-report", "SKILL.md");
    if (!fs.existsSync(skillPath)) return null;
    return fs.readFileSync(skillPath, "utf-8");
  } catch {
    return null;
  }
}
