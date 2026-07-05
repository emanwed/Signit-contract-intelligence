import { DEFAULT_CHECKS, type CheckId } from "./compliance";
import type { Contract, Lang } from "./types";

export type Checks = Record<CheckId, boolean>;

/**
 * The organisation's contract playbook — the standard terms every signed
 * contract is checked against. Deviations are surfaced automatically so legal
 * can focus first-pass review on the non-standard ones (the "playbook
 * comparison" pattern that drives most of the review-time savings in CLM).
 */
export const POLICY = {
  /** Liability caps below this floor are flagged as below-playbook (SAR). */
  minLiabilityCap: 1_000_000,
  /** Governing law must sit within the preferred jurisdiction. */
  preferredLawKeywords: ["saudi", "kingdom", "ksa", "المملكة", "السعود", "المملكه"],
  preferredJurisdiction: { ar: "أنظمة المملكة", en: "KSA law" },
  /** Auto-renewing contracts need at least this much notice to renegotiate. */
  minRenewalNoticeDays: 45,
} as const;

/** Parse the numeric liability cap (SAR) from a contract, or null if none. */
export function liabilityCap(c: Contract): number | null {
  const f = c.facts.find((x) => x.k === "liability");
  if (!f) return null;
  const digits = f.ve.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : null;
}

/** Does the contract carry an explicit liability clause at all? */
export function hasLiabilityClause(c: Contract): boolean {
  return c.facts.some((x) => x.k === "liability");
}

/** Max aggregate financial risk if every capped contract triggers its cap. */
export function totalLiabilityExposure(contracts: Contract[]): number {
  return contracts.reduce((s, c) => s + (liabilityCap(c) ?? 0), 0);
}

/** Whether the governing law sits within the preferred jurisdiction. */
export function underPreferredLaw(c: Contract): boolean {
  const f = c.facts.find((x) => x.k === "law");
  if (!f) return false;
  const hay = `${f.ve} ${f.va}`.toLowerCase();
  return POLICY.preferredLawKeywords.some((k) => hay.includes(k.toLowerCase()));
}

/** Share (0–100) of law-bearing contracts under the preferred jurisdiction. */
export function jurisdictionCoverage(contracts: Contract[]): {
  under: number;
  total: number;
  pct: number;
} {
  const withLaw = contracts.filter((c) => c.facts.some((f) => f.k === "law"));
  const under = withLaw.filter(underPreferredLaw).length;
  const total = withLaw.length;
  return { under, total, pct: total ? Math.round((under / total) * 100) : 100 };
}

export interface Deviation {
  key: string;
  ar: string;
  en: string;
}

/**
 * All the ways a single contract falls short of the enabled checks. Only the
 * checks switched on in Settings are applied, so toggling one changes what gets
 * flagged across the portfolio.
 */
export function playbookDeviations(
  c: Contract,
  checks: Checks = DEFAULT_CHECKS,
): Deviation[] {
  const devs: Deviation[] = [];
  const cap = liabilityCap(c);

  if (checks.liabilityFloor) {
    if (hasLiabilityClause(c) && cap === null) {
      devs.push({
        key: "nocap",
        ar: "لا يحدّد العقد سقفًا للمسؤولية — دون الدليل.",
        en: "Contract sets no liability cap — below playbook.",
      });
    } else if (cap !== null && cap < POLICY.minLiabilityCap) {
      devs.push({
        key: "lowcap",
        ar: "سقف المسؤولية دون الحد الأدنى في الدليل (مليون ر.س).",
        en: "Liability cap below the playbook floor (SAR 1M).",
      });
    }
  }

  if (
    checks.jurisdiction &&
    c.facts.some((f) => f.k === "law") &&
    !underPreferredLaw(c)
  ) {
    devs.push({
      key: "law",
      ar: "القانون الحاكم خارج الاختصاص المفضّل.",
      en: "Governing law outside the preferred jurisdiction.",
    });
  }

  if (
    checks.renewalNotice &&
    c.autoRenew &&
    c.noticeDays > 0 &&
    c.noticeDays < POLICY.minRenewalNoticeDays
  ) {
    devs.push({
      key: "notice",
      ar: `نافذة إشعار قصيرة (${c.noticeDays} يومًا؛ الدليل ≥ ${POLICY.minRenewalNoticeDays}).`,
      en: `Short renewal-notice window (${c.noticeDays}d; playbook ≥ ${POLICY.minRenewalNoticeDays}).`,
    });
  }

  if (checks.pdpl) {
    const p = c.facts.find((f) => f.k === "pdpl");
    if (p && p.conf !== "high") {
      devs.push({
        key: "pdpl",
        ar: "بند معالجة بيانات (PDPL) غير مؤكّد — يحتاج مراجعة امتثال.",
        en: "Unconfirmed data-processing (PDPL) clause — needs a compliance review.",
      });
    }
  }

  if (checks.zatca) {
    const pen = c.facts.find((f) => f.k === "penalty");
    if (pen && pen.conf !== "high" && c.type !== "employment") {
      devs.push({
        key: "zatca",
        ar: "شروط الغرامات/الدفع غير محددة — تحتاج مواءمة مع الفوترة الإلكترونية (ZATCA).",
        en: "Undefined penalty/payment terms — need ZATCA e-invoicing alignment.",
      });
    }
  }

  if (checks.laborLaw && c.type === "employment") {
    devs.push({
      key: "labor",
      ar: "عقد عمل — يخضع لمراجعة نظام العمل السعودي.",
      en: "Employment contract — subject to Saudi Labor Law review.",
    });
  }

  return devs;
}

export function hasPlaybookDeviation(
  c: Contract,
  checks: Checks = DEFAULT_CHECKS,
): boolean {
  return playbookDeviations(c, checks).length > 0;
}

/** Localised deviation text. */
export const deviationText = (d: Deviation, lang: Lang): string =>
  lang === "ar" ? d.ar : d.en;
