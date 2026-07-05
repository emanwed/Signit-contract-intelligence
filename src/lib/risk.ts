import {
  POLICY,
  hasLiabilityClause,
  liabilityCap,
  underPreferredLaw,
  type Checks,
} from "./playbook";
import { fmtSAR } from "./format";
import type { Contract, Lang } from "./types";

export type RiskLevel = "high" | "medium" | "low";

/** The six clause-risk dimensions (Module 3). */
export const RISK_DIMS = [
  "liability",
  "termination",
  "ip",
  "indemnity",
  "autorenew",
  "law",
] as const;
export type RiskDimKey = (typeof RISK_DIMS)[number];

const LEVEL_SCORE: Record<RiskLevel, number> = { high: 90, medium: 55, low: 18 };

export const RISK_TONE: Record<RiskLevel, string> = {
  high: "var(--low)",
  medium: "var(--med)",
  low: "var(--high)",
};

/** Stable 0–1 hash so a contract's illustrative dimensions never jump around. */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** For dimensions the demo has no clause data for — biased by the overall risk. */
function illustrativeLevel(c: Contract, key: string): RiskLevel {
  const bias = c.risk === "high" ? 0.28 : c.risk === "low" ? -0.24 : 0;
  const v = hash01(c.id + key) + bias;
  return v > 0.62 ? "high" : v > 0.34 ? "medium" : "low";
}

/** Assess one dimension. liability / auto-renewal / law use real extracted data. */
export function dimLevel(c: Contract, key: RiskDimKey): RiskLevel {
  switch (key) {
    case "liability": {
      const cap = liabilityCap(c);
      if (hasLiabilityClause(c) && cap === null) return "high";
      if (cap !== null && cap < POLICY.minLiabilityCap) return "high";
      if (cap !== null && c.valueSAR > 0 && cap < c.valueSAR) return "high";
      if (cap !== null) return "low";
      return "medium";
    }
    case "autorenew":
      if (c.autoRenew && c.noticeDays > 0 && c.noticeDays < POLICY.minRenewalNoticeDays)
        return "high";
      if (c.autoRenew) return "medium";
      return "low";
    case "law":
      if (c.facts.some((f) => f.k === "law"))
        return underPreferredLaw(c) ? "low" : "high";
      return "medium";
    default:
      return illustrativeLevel(c, key);
  }
}

export function riskDimensions(c: Contract): { key: RiskDimKey; level: RiskLevel }[] {
  return RISK_DIMS.map((key) => ({ key, level: dimLevel(c, key) }));
}

/** Score window for each canonical risk level — keeps riskBand() in agreement. */
const BAND_RANGE: Record<RiskLevel, [number, number]> = {
  low: [12, 36],
  medium: [44, 62],
  high: [70, 94],
};

/**
 * 0–100 aggregate risk score, anchored to the contract's canonical `risk` so the
 * gauge band always matches the risk shown in the list view. The six clause
 * dimensions set the exact position within that band.
 */
export function riskScore(c: Contract): number {
  const dims = riskDimensions(c);
  const avg = dims.reduce((s, d) => s + LEVEL_SCORE[d.level], 0) / dims.length;
  const [lo, hi] = BAND_RANGE[c.risk];
  const t = Math.max(0, Math.min(1, avg / 90));
  return Math.round(lo + (hi - lo) * t);
}

export function riskBand(score: number): RiskLevel {
  return score >= 66 ? "high" : score >= 40 ? "medium" : "low";
}

/** A single row of the playbook comparison table. */
export interface PlaybookRow {
  key: string;
  /** i18n key for the clause name. */
  clause: "pbLiability" | "pbNotice" | "pbJurisdiction" | "pbPdpl" | "pbIndemnity";
  met: boolean;
  contract: { ar: string; en: string };
  standard: { ar: string; en: string };
}

/** Structured clause-vs-playbook comparison (contract language vs standard). */
export function playbookComparison(c: Contract, checks: Checks): PlaybookRow[] {
  const rows: PlaybookRow[] = [];

  if (checks.liabilityFloor) {
    const cap = liabilityCap(c);
    const has = hasLiabilityClause(c);
    if (has) {
      const met = cap !== null && cap >= POLICY.minLiabilityCap;
      rows.push({
        key: "liability",
        clause: "pbLiability",
        met,
        contract:
          cap === null
            ? { ar: "بلا سقف", en: "No cap" }
            : { ar: `${fmtSAR(cap)} ر.س`, en: `SAR ${fmtSAR(cap)}` },
        standard: { ar: "١ مليون ر.س حدًّا أدنى", en: "SAR 1M minimum" },
      });
    }
  }

  if (checks.renewalNotice && c.autoRenew) {
    const met = c.noticeDays >= POLICY.minRenewalNoticeDays;
    rows.push({
      key: "notice",
      clause: "pbNotice",
      met,
      contract: {
        ar: `${c.noticeDays} يومًا`,
        en: `${c.noticeDays} days`,
      },
      standard: {
        ar: `${POLICY.minRenewalNoticeDays} يومًا حدًّا أدنى`,
        en: `${POLICY.minRenewalNoticeDays} days minimum`,
      },
    });
  }

  if (checks.jurisdiction && c.facts.some((f) => f.k === "law")) {
    const met = underPreferredLaw(c);
    rows.push({
      key: "law",
      clause: "pbJurisdiction",
      met,
      contract: met
        ? { ar: "أنظمة المملكة", en: "KSA law" }
        : { ar: "خارج الاختصاص المفضّل", en: "Outside preferred venue" },
      standard: { ar: "أنظمة المملكة", en: "KSA law required" },
    });
  }

  if (checks.pdpl) {
    const p = c.facts.find((f) => f.k === "pdpl");
    if (p) {
      const met = p.conf === "high";
      rows.push({
        key: "pdpl",
        clause: "pbPdpl",
        met,
        contract: met
          ? { ar: "بند واضح", en: "Clear clause" }
          : { ar: "غير مؤكّد", en: "Unconfirmed" },
        standard: { ar: "بند PDPL مؤكّد", en: "Confirmed PDPL clause" },
      });
    }
  }

  // Indemnification — illustrative (no clause data in the demo portfolio).
  {
    const met = dimLevel(c, "indemnity") === "low";
    rows.push({
      key: "indemnity",
      clause: "pbIndemnity",
      met,
      contract: met
        ? { ar: "متبادل", en: "Mutual" }
        : { ar: "أحادي الجانب", en: "One-sided" },
      standard: { ar: "تعويض متبادل", en: "Mutual required" },
    });
  }

  return rows;
}

export const rowText = (t: { ar: string; en: string }, lang: Lang) =>
  lang === "ar" ? t.ar : t.en;
