import type { Contract, Lang } from "./types";
import { money } from "./format";

export type ObligationCat =
  | "payment"
  | "deliverable"
  | "compliance"
  | "notice"
  | "insurance";

export const OBLIGATION_CATS: ObligationCat[] = [
  "payment",
  "deliverable",
  "compliance",
  "notice",
  "insurance",
];

/** Alert tiers — obligations fire reminders at 30 / 7 / 1 days, then escalate. */
export type AlertTier = "overdue" | "d1" | "d7" | "d30" | "later";

export interface Obligation {
  id: string;
  contractId: string;
  cat: ObligationCat;
  title: { ar: string; en: string };
  deadlineGreg: string;
  daysLeft: number;
  owner: string;
  /** Manager the obligation escalates to when missed. */
  manager: string;
}

const OWNERS: [string, string][] = [
  ["Legal Team", "Legal Ops Lead"],
  ["Procurement", "Head of Procurement"],
  ["Finance", "Finance Director"],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function catTitle(cat: ObligationCat, c: Contract): { ar: string; en: string } {
  switch (cat) {
    case "payment":
      return {
        ar: `إصدار الفاتورة بحلول الأول — دفع صافٍ ٣٠ يومًا (${money(c.valueSAR, "ar")})`,
        en: `Invoice by the 1st — net-30 payment (${money(c.valueSAR, "en")})`,
      };
    case "deliverable":
      return {
        ar: "تسليم التقرير الأولي خلال ٦٠ يومًا من التنفيذ",
        en: "Deliver initial report within 60 days of execution",
      };
    case "compliance":
      return {
        ar: "تقديم تقرير SOC 2 سنويًا",
        en: "Provide SOC 2 report annually",
      };
    case "insurance":
      return {
        ar: "الحفاظ على تأمين مسؤولية عامة بقيمة ٥ ملايين طوال المدة",
        en: "Maintain $5M general-liability insurance throughout the term",
      };
    case "notice":
      return {
        ar: `إشعار بعدم التجديد قبل ${c.noticeDays} يومًا من الانتهاء`,
        en: `Give non-renewal notice ${c.noticeDays} days before end`,
      };
  }
}

/**
 * Derives the obligation calendar from the portfolio: a Notice obligation for
 * every auto-renewing contract, plus one other typed obligation per contract so
 * all five categories are represented, each with an owner, deadline and manager.
 */
export function generateObligations(contracts: Contract[]): Obligation[] {
  const out: Obligation[] = [];
  const others: ObligationCat[] = ["payment", "deliverable", "compliance", "insurance"];

  for (const c of contracts) {
    const h = hash(c.id);
    const [owner, manager] = OWNERS[h % OWNERS.length];

    if (c.autoRenew && c.noticeDays > 0) {
      const daysLeft = c.daysToRenew - c.noticeDays;
      out.push({
        id: `${c.id}-notice`,
        contractId: c.id,
        cat: "notice",
        title: catTitle("notice", c),
        deadlineGreg: addDays(daysLeft),
        daysLeft,
        owner,
        manager,
      });
    }

    const cat = others[h % others.length];
    const daysLeft = 1 + (h % 84); // 1..84 days out, deterministic
    const [o2, m2] = OWNERS[(h + 1) % OWNERS.length];
    out.push({
      id: `${c.id}-${cat}`,
      contractId: c.id,
      cat,
      title: catTitle(cat, c),
      deadlineGreg: addDays(daysLeft),
      daysLeft,
      owner: o2,
      manager: m2,
    });
  }

  return out.sort((a, b) => a.daysLeft - b.daysLeft);
}

export function alertTier(daysLeft: number): AlertTier {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 1) return "d1";
  if (daysLeft <= 7) return "d7";
  if (daysLeft <= 30) return "d30";
  return "later";
}

export const obTitle = (o: Obligation, lang: Lang) =>
  lang === "ar" ? o.title.ar : o.title.en;
