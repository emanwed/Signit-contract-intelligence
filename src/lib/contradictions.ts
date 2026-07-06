import { POLICY, liabilityCap, type Checks } from "./playbook";
import { contractStatus } from "./status";
import { money } from "./format";
import type { Contract } from "./types";

export type ContradictionSeverity = "high" | "medium" | "low";
export type ContradictionKind =
  | "residency"
  | "liability"
  | "notice"
  | "jurisdiction";

export interface Contradiction {
  id: string;
  severity: ContradictionSeverity;
  kind: ContradictionKind;
  title: { ar: string; en: string };
  /** What conflicts, and why the two sides can't both be your norm. */
  detail: { ar: string; en: string };
  recommendation: { ar: string; en: string };
  /** Contracts on both sides of the conflict — rendered as clickable chips. */
  contractIds: string[];
}

const SEVERITY_RANK: Record<ContradictionSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const active = (c: Contract) => contractStatus(c) === "active";
const pdplText = (c: Contract) => {
  const p = c.facts.find((f) => f.k === "pdpl");
  return p ? `${p.sa} ${p.se} ${p.va} ${p.ve}` : "";
};

/**
 * Cross-portfolio "contradiction radar": pairs of active contracts whose terms
 * conflict with each other, so the same organisation is holding two positions
 * it can't both defend. Everything here is computed from the contracts' real
 * extracted fields (data-residency signals, liability caps, notice windows,
 * governing law) against the company playbook — no hand-authored findings.
 * Sorted most-severe first.
 */
export function findContradictions(
  contracts: Contract[],
  _checks: Checks,
): Contradiction[] {
  const items: Contradiction[] = [];
  const live = contracts.filter(active);

  // 1 — Data residency: some vendors keep data in-Kingdom, others process it
  //     off-shore. Under PDPL you can't hold both stances across the portfolio.
  const offshore = live.filter((c) =>
    /خارج|الخارج|overseas|off-?shore|abroad/i.test(pdplText(c)),
  );
  const inKingdom = live.filter(
    (c) =>
      !offshore.includes(c) &&
      /داخل المملكة|في المملكة|in-?Kingdom|inside the Kingdom/i.test(
        pdplText(c),
      ),
  );
  if (offshore.length >= 1 && inKingdom.length >= 1) {
    items.push({
      id: "residency",
      severity: "high",
      kind: "residency",
      title: {
        ar: "تعارض في مكان تخزين البيانات",
        en: "Data-residency conflict",
      },
      detail: {
        ar: `${inKingdom.length} من العقود تُلزِم بتوطين البيانات داخل المملكة، بينما ${offshore.length} تسمح بمعالجتها في الخارج أو دون تحديد واضح للموقع — موقفان متناقضان أمام نظام حماية البيانات (PDPL).`,
        en: `${inKingdom.length} contract(s) require data to stay in-Kingdom, while ${offshore.length} allow off-shore or unspecified processing — two positions you can't both defend under the PDPL.`,
      },
      recommendation: {
        ar: "وحِّد شرط توطين البيانات عبر المزوّدين، وأعد التفاوض على البنود التي تسمح بالمعالجة خارج المملكة.",
        en: "Standardise one data-residency clause across vendors, and renegotiate any that allow off-shore processing.",
      },
      contractIds: [...inKingdom, ...offshore].map((c) => c.id),
    });
  }

  // 2 — Liability floor: enforced (≥ SAR 1M) on some vendors, accepted below it
  //     on others. Same risk, two different appetites.
  const withCap = live
    .map((c) => ({ c, cap: liabilityCap(c) }))
    .filter((x): x is { c: Contract; cap: number } => x.cap !== null);
  const below = withCap.filter((x) => x.cap < POLICY.minLiabilityCap);
  const meets = withCap.filter((x) => x.cap >= POLICY.minLiabilityCap);
  if (below.length >= 1 && meets.length >= 1) {
    items.push({
      id: "liability",
      severity: "high",
      kind: "liability",
      title: {
        ar: "تفاوت في سقف المسؤولية",
        en: "Inconsistent liability floor",
      },
      detail: {
        ar: `تفرضون حدًّا أدنى للمسؤولية (${money(POLICY.minLiabilityCap, "ar")}) على ${meets.length} من المزوّدين، لكنكم قبلتم سقفًا أدنى منه على ${below.length} آخرين — تعرُّض غير مبرَّر لنفس النوع من المخاطر.`,
        en: `You enforce a liability floor (${money(POLICY.minLiabilityCap, "en")}) on ${meets.length} vendor(s), yet accepted a lower cap on ${below.length} other(s) — uneven exposure to the same class of risk.`,
      },
      recommendation: {
        ar: "طبِّق حدّ المسؤولية نفسه على المزوّدين المتماثلين، وارفع السقوف المنخفضة عند التجديد.",
        en: "Apply the same liability floor to comparable vendors, and raise the low caps at renewal.",
      },
      contractIds: below.map((x) => x.c.id),
    });
  }

  // 3 — Notice window: auto-renewers with a tighter-than-playbook window sitting
  //     next to ones that honour it.
  const tight = live.filter(
    (c) =>
      c.autoRenew &&
      c.noticeDays > 0 &&
      c.noticeDays < POLICY.minRenewalNoticeDays,
  );
  const generous = live.filter(
    (c) => c.autoRenew && c.noticeDays >= POLICY.minRenewalNoticeDays,
  );
  if (tight.length >= 1 && generous.length >= 1) {
    items.push({
      id: "notice",
      severity: "medium",
      kind: "notice",
      title: {
        ar: "تفاوت في نافذة إشعار التجديد",
        en: "Mismatched renewal-notice windows",
      },
      detail: {
        ar: `${generous.length} من العقود تمنحكم مهلة إشعار لا تقل عن ${POLICY.minRenewalNoticeDays} يومًا قبل التجديد، بينما ${tight.length} تُجدَّد تلقائيًا بمهلة أقصر — أعلى خطرًا للتجديد غير المقصود.`,
        en: `${generous.length} contract(s) give you at least ${POLICY.minRenewalNoticeDays} days' notice before renewal, while ${tight.length} auto-renew on a shorter window — the higher risk of an unintended renewal.`,
      },
      recommendation: {
        ar: "وحِّد نافذة الإشعار عند الحد الأدنى في الدليل، وأضِف تذكيرات مبكرة للعقود ذات المهلة القصيرة.",
        en: "Standardise the notice window to your playbook minimum, and add early reminders for the short-window contracts.",
      },
      contractIds: tight.map((c) => c.id),
    });
  }

  // 4 — Governing law: portfolio split between KSA jurisdiction and foreign
  //     venues — inconsistent dispute strategy.
  const foreign = live.filter(
    (c) =>
      c.facts.some((f) => f.k === "law") &&
      !POLICY.preferredLawKeywords.some((k) => {
        const law = c.facts.find((f) => f.k === "law");
        return law
          ? `${law.va} ${law.ve} ${law.sa} ${law.se}`.toLowerCase().includes(k)
          : false;
      }),
  );
  const domestic = live.filter(
    (c) =>
      !foreign.includes(c) &&
      POLICY.preferredLawKeywords.some((k) => {
        const law = c.facts.find((f) => f.k === "law");
        return law
          ? `${law.va} ${law.ve} ${law.sa} ${law.se}`.toLowerCase().includes(k)
          : false;
      }),
  );
  if (foreign.length >= 1 && domestic.length >= 1) {
    items.push({
      id: "jurisdiction",
      severity: "medium",
      kind: "jurisdiction",
      title: {
        ar: "تعارض في الاختصاص القضائي",
        en: "Split governing jurisdiction",
      },
      detail: {
        ar: `${domestic.length} من العقود تخضع لأنظمة المملكة، بينما ${foreign.length} تخضع لاختصاص أجنبي — استراتيجية نزاع مجزّأة ترفع كلفة التقاضي.`,
        en: `${domestic.length} contract(s) sit under KSA law, while ${foreign.length} fall under a foreign jurisdiction — a fragmented dispute strategy that raises litigation cost.`,
      },
      recommendation: {
        ar: "اجعل أنظمة المملكة الاختصاص الافتراضي، وسجِّل مبرِّرًا لأي استثناء أجنبي.",
        en: "Make KSA law the default jurisdiction, and log a justification for any foreign exception.",
      },
      contractIds: [...domestic, ...foreign].map((c) => c.id),
    });
  }

  return items.sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );
}
