import {
  hasPlaybookDeviation,
  playbookDeviations,
  deviationText,
  type Checks,
} from "./playbook";
import type { Contract, Lang } from "./types";

/** The reminder/alert categories a user can opt out of (in-app and by email). */
export type AlertKind = "renewal" | "compliance" | "anomaly" | "review";
export type AlertSeverity = "high" | "medium" | "low";

export interface Alert {
  id: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  body: string;
  /** Contract this alert points at, so the panel can open it. */
  contractId?: string;
}

/** Per-category opt-in state. All on by default; the header lets users mute any. */
export type AlertPrefs = Record<AlertKind, boolean>;
export const DEFAULT_ALERT_PREFS: AlertPrefs = {
  renewal: true,
  compliance: true,
  anomaly: true,
  review: true,
};

export const ALERT_KINDS: AlertKind[] = [
  "renewal",
  "compliance",
  "anomaly",
  "review",
];

/**
 * Derives the live reminder/alert feed from the portfolio — the same set of
 * events that drive the email digests. Only categories the user has left
 * enabled in `prefs` are included, so muting a category removes it here and
 * (conceptually) stops the matching emails too.
 */
export function buildAlerts(
  contracts: Contract[],
  checks: Checks,
  prefs: AlertPrefs,
  lang: Lang,
): Alert[] {
  const ar = lang === "ar";
  const title = (c: Contract) => (ar ? c.title_ar : c.title_en);
  const out: Alert[] = [];

  if (prefs.renewal) {
    for (const c of contracts.filter(
      (c) => c.daysToRenew > 0 && c.daysToRenew <= 90,
    )) {
      const urgent = c.daysToRenew <= Math.max(c.noticeDays, 30);
      const severity: AlertSeverity =
        urgent ? "high" : c.daysToRenew <= 60 ? "medium" : "low";
      out.push({
        id: `renewal-${c.id}`,
        kind: "renewal",
        severity,
        contractId: c.id,
        title: ar
          ? `${title(c)} — التجديد خلال ${c.daysToRenew} يومًا`
          : `${title(c)} — renews in ${c.daysToRenew} days`,
        body: c.autoRenew
          ? ar
            ? `تجديد تلقائي؛ نافذة الإشعار ${c.noticeDays} يومًا.`
            : `Auto-renews; ${c.noticeDays}-day notice window.`
          : ar
            ? `تنتهي المدة في ${c.endGreg}.`
            : `Term ends ${c.endGreg}.`,
      });
    }
  }

  if (prefs.compliance) {
    for (const c of contracts.filter((c) => hasPlaybookDeviation(c, checks))) {
      const dev = playbookDeviations(c, checks)[0];
      out.push({
        id: `compliance-${c.id}`,
        kind: "compliance",
        severity: "high",
        contractId: c.id,
        title: ar
          ? `${title(c)} — مخالفة لدليل السياسات`
          : `${title(c)} — playbook deviation`,
        body: dev ? deviationText(dev, lang) : "",
      });
    }
  }

  if (prefs.anomaly) {
    for (const c of contracts.filter((c) => (ar ? c.anomaly_ar : c.anomaly_en))) {
      out.push({
        id: `anomaly-${c.id}`,
        kind: "anomaly",
        severity: "medium",
        contractId: c.id,
        title: ar
          ? `${title(c)} — تعارض مرصود`
          : `${title(c)} — anomaly flagged`,
        body: (ar ? c.anomaly_ar : c.anomaly_en) ?? "",
      });
    }
  }

  if (prefs.review) {
    for (const c of contracts) {
      const n = c.facts.filter((f) => f.conf === "low").length;
      if (!n) continue;
      out.push({
        id: `review-${c.id}`,
        kind: "review",
        severity: "low",
        contractId: c.id,
        title: ar
          ? `${title(c)} — ${n} حقلًا بحاجة لمراجعة`
          : `${title(c)} — ${n} field${n > 1 ? "s" : ""} to review`,
        body: ar
          ? "استخراج منخفض الثقة يحتاج تأكيدًا."
          : "Low-confidence extraction needs confirming.",
      });
    }
  }

  const rank: Record<AlertSeverity, number> = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
