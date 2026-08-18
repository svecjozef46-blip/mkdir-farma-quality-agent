import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type { MonthlyReportData } from "./types";

const NAVY = "#1F3864";
const NAVY_INK = "#152a4a";
const INK = "#1c2430";
const INK_SECONDARY = "#535d6b";
const BORDER = "#e3e6eb";
const CRIT = "#A3271E";
const CRIT_BG = "#FBE7E4";
const WARN = "#8A5B00";
const WARN_BG = "#FFF6E0";
const OK = "#0C6B0C";
const OK_BG = "#E8F7E8";
const BLUE = "#2a78d6";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: INK },
  header: { backgroundColor: NAVY, padding: 18, borderRadius: 6, marginBottom: 16 },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: 700, marginBottom: 4 },
  headerSub: { color: "#cbd6e8", fontSize: 9 },
  demoBanner: {
    backgroundColor: WARN_BG, borderWidth: 1, borderColor: "#f2ddab", borderRadius: 4,
    padding: 8, marginBottom: 14, fontSize: 8.5, color: WARN,
  },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 10 },
  statNum: { fontSize: 18, fontWeight: 700, marginBottom: 2 },
  statLabel: { fontSize: 8, color: INK_SECONDARY },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 8, marginTop: 6 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  barLabel: { width: 140, fontSize: 9, color: INK_SECONDARY },
  barTrack: { flex: 1, height: 10, backgroundColor: "#eef1f5", borderRadius: 5, marginRight: 8 },
  barFill: { height: 10, backgroundColor: BLUE, borderRadius: 5 },
  barValue: { width: 24, fontSize: 9, fontWeight: 700 },
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 4, marginBottom: 14 },
  tableHeaderRow: { flexDirection: "row", backgroundColor: NAVY },
  tableRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER },
  th: { padding: 6, fontSize: 8, color: "#ffffff", fontWeight: 700 },
  td: { padding: 6, fontSize: 8.5 },
  colCapa: { width: "18%" },
  colDev: { width: "18%" },
  colOwner: { width: "26%" },
  colDue: { width: "18%" },
  colDays: { width: "20%" },
  overdueBadge: { color: CRIT, fontWeight: 700 },
  recItem: { flexDirection: "row", marginBottom: 5 },
  recBullet: { width: 10, fontSize: 9, color: NAVY },
  recText: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },
  footer: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: BORDER, fontSize: 7.5, color: INK_SECONDARY, lineHeight: 1.5 },
  emptyNote: { fontSize: 9, color: INK_SECONDARY, fontStyle: "italic", marginBottom: 10 },
});

export function MonthlyReportPdfDocument({ report }: { report: MonthlyReportData }) {
  const maxCause = Math.max(...report.top_causes.map((c) => c.count), 1);
  const generatedDate = new Date(report.generated_at).toLocaleString("sk-SK");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quality Deviation & CAPA Insight Agent</Text>
          <Text style={styles.headerSub}>Mesačná súhrnná správa · vygenerované {generatedDate}</Text>
        </View>

        <Text style={styles.demoBanner}>
          Demo prototyp na 100% fiktívnych dátach fiktívnej firmy. Nie je to reálny produkčný QMS systém.
        </Text>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{report.total_deviations}</Text>
            <Text style={styles.statLabel}>odchýlok spolu</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 3, borderLeftColor: CRIT }]}>
            <Text style={[styles.statNum, { color: CRIT }]}>{report.critical_count}</Text>
            <Text style={styles.statLabel}>critical</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 3, borderLeftColor: WARN }]}>
            <Text style={[styles.statNum, { color: WARN }]}>{report.open_count}</Text>
            <Text style={styles.statLabel}>otvorených</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 3, borderLeftColor: OK }]}>
            <Text style={[styles.statNum, { color: OK }]}>{report.closed_count}</Text>
            <Text style={styles.statLabel}>uzavretých</Text>
          </View>
        </View>

        {report.top_causes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Najčastejšie príčiny (root cause)</Text>
            {report.top_causes.map((c, i) => (
              <View style={styles.barRow} key={i}>
                <Text style={styles.barLabel}>{c.category}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(4, (c.count / maxCause) * 100)}%` }]} />
                </View>
                <Text style={styles.barValue}>{c.count}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>CAPA po termíne ({report.overdue_capa.length})</Text>
        {report.overdue_capa.length === 0 && (
          <Text style={styles.emptyNote}>Žiadna CAPA akcia nie je po termíne.</Text>
        )}
        {report.overdue_capa.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, styles.colCapa]}>CAPA ID</Text>
              <Text style={[styles.th, styles.colDev]}>Odchýlka</Text>
              <Text style={[styles.th, styles.colOwner]}>Vlastník</Text>
              <Text style={[styles.th, styles.colDue]}>Termín</Text>
              <Text style={[styles.th, styles.colDays]}>Dní po termíne</Text>
            </View>
            {report.overdue_capa.map((c, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={[styles.td, styles.colCapa]}>{c.capa_id}</Text>
                <Text style={[styles.td, styles.colDev]}>{c.deviation_id ?? "—"}</Text>
                <Text style={[styles.td, styles.colOwner]}>{c.owner_role ?? "—"}</Text>
                <Text style={[styles.td, styles.colDue]}>{c.due_date ?? "—"}</Text>
                <Text style={[styles.td, styles.colDays, styles.overdueBadge]}>{c.days_overdue}</Text>
              </View>
            ))}
          </View>
        )}

        {report.recommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Odporúčania</Text>
            {report.recommendations.map((r, i) => (
              <View style={styles.recItem} key={i}>
                <Text style={styles.recBullet}>•</Text>
                <Text style={styles.recText}>{r}</Text>
              </View>
            ))}
          </>
        )}

        <Text style={styles.footer}>
          Vygenerované agentom appky Quality Deviation & CAPA Insight Agent (Next.js + Supabase + Claude tool use).
          Súčty a najčastejšie príčiny spočítal agent priamo z databázy; zoznam CAPA po termíne a počet dní
          omeškania dopočítala appka nezávisle od modelu, aby boli čísla vždy presné.
        </Text>
      </Page>
    </Document>
  );
}
