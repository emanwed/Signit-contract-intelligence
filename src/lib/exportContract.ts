import { documentText } from "./contractText";
import { money } from "./format";
import { factLabel } from "./i18n";
import { FREE_FACT_KEYS } from "./plan";
import type { Contract, Lang } from "./types";

function triggerDownload(filename: string, href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const slug = (s: string) =>
  s
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "contract";

/**
 * Export a contract from the viewer. If it was uploaded as a PDF, the original
 * file is downloaded as-is; otherwise a plain-text export is generated from the
 * document text plus the AI-extracted values — useful for the demo portfolio.
 * On Free, only the basic extraction fields are included (matching the values
 * shown in the drawer) — Pro's fuller schema isn't handed out via export.
 */
export function exportContract(c: Contract, lang: Lang, free = false): void {
  // Uploaded document — download the original file (the user's own upload,
  // not a Pro-tier extraction, so this is unaffected by plan).
  if (c.docDataUrl) {
    triggerDownload(c.docFileName ?? `${c.id}.pdf`, c.docDataUrl);
    return;
  }

  const ar = lang === "ar";
  const title = ar ? c.title_ar : c.title_en;
  const party = ar ? c.party_ar : c.party_en;
  const yes = ar ? "نعم" : "Yes";
  const no = ar ? "لا" : "No";

  const lines: string[] = [];
  lines.push(title);
  lines.push("=".repeat(Math.min(Math.max(title.length, 8), 60)));
  lines.push(`${ar ? "المعرّف" : "ID"}: ${c.id}`);
  lines.push(`${ar ? "الطرف المقابل" : "Counterparty"}: ${party}`);
  if (c.valueSAR)
    lines.push(`${ar ? "القيمة" : "Value"}: ${money(c.valueSAR, lang)}`);
  lines.push(`${ar ? "تاريخ الانتهاء" : "End date"}: ${c.endGreg} (${c.endHijri})`);
  lines.push(
    `${ar ? "التجديد التلقائي" : "Auto-renewal"}: ${c.autoRenew ? yes : no}`,
  );
  lines.push("");

  const shownFacts = free ? c.facts.filter((f) => FREE_FACT_KEYS.has(f.k)) : c.facts;
  if (shownFacts.length) {
    lines.push(ar ? "— القيم المستخرجة —" : "— Extracted values —");
    for (const f of shownFacts) {
      lines.push(`• ${factLabel(lang, f.k)}: ${ar ? f.va : f.ve}`);
    }
    lines.push("");
  }

  lines.push(ar ? "— نص المستند —" : "— Document —");
  lines.push(documentText(c, lang));

  const blob = new Blob([lines.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(`${c.id}-${slug(title)}.txt`, url);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
