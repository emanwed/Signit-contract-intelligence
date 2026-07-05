import type { Contract, Fact, Lang } from "./types";
import { T } from "./i18n";

/**
 * Builds a plain-text contract document from a contract's extracted clauses and
 * metadata. Seed contracts have no attached file, so this reconstructs a
 * readable "original" the Document view can show (with the real source clauses
 * embedded verbatim, so they can be highlighted). Rendered in the current UI
 * language using each fact's source clause (`sa` for Arabic, `se` for English).
 */
export function synthesizeDoc(c: Contract, lang: Lang): string {
  const d = T[lang];
  const ar = lang === "ar";
  const title = ar ? c.title_ar : c.title_en;
  const party = ar ? c.party_ar : c.party_en;
  const clause = (f: Fact) => (ar ? f.sa : f.se);

  const lines: string[] = [];
  lines.push(ar ? `عقد: ${title}` : `AGREEMENT: ${title}`);
  lines.push(`${d.type}: ${d.types[c.type]}`);
  lines.push(`${d.counterparty}: ${party}`);
  lines.push(`${c.id} · ${c.endHijri} ${d.hijri} · ${c.endGreg} ${d.greg}`);
  lines.push("");
  lines.push(
    ar
      ? "أبرم الطرفان هذا العقد وفق البنود التالية:"
      : "The parties have entered into this agreement on the following terms:",
  );
  lines.push("");

  c.facts.forEach((f, i) => {
    const label = (d as unknown as Record<string, string>)[f.k] ?? f.k;
    lines.push(`${i + 1}. ${label}`);
    lines.push(`   ${clause(f)}`);
    lines.push("");
  });

  const anomaly = ar ? c.anomaly_ar : c.anomaly_en;
  if (anomaly) {
    lines.push(
      ar
        ? "ملاحظة تدقيق آلي: قد يتطلب أحد البنود أعلاه مراجعة قانونية."
        : "Automated review note: one of the clauses above may require legal review.",
    );
  }

  return lines.join("\n");
}

/** The document text to display — the real one if present, else a synthesis. */
export function documentText(c: Contract, lang: Lang): string {
  return c.docText && c.docText.trim().length > 0
    ? c.docText
    : synthesizeDoc(c, lang);
}
