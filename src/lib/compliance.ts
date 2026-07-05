import type { Lang } from "./types";

/**
 * The compliance / playbook checks a customer can switch on per their needs.
 * "regulation" checks map to Saudi legal frameworks; "playbook" checks are the
 * organisation's own standard terms. Configured on the Settings screen; every
 * document is then reviewed against whichever are enabled.
 */
export type CheckId =
  | "pdpl"
  | "zatca"
  | "laborLaw"
  | "liabilityFloor"
  | "jurisdiction"
  | "renewalNotice";

export type CheckGroup = "regulation" | "playbook";

export interface CheckDef {
  id: CheckId;
  group: CheckGroup;
  label_ar: string;
  label_en: string;
  desc_ar: string;
  desc_en: string;
}

export const CHECK_DEFS: CheckDef[] = [
  {
    id: "pdpl",
    group: "regulation",
    label_en: "PDPL — data protection",
    label_ar: "حماية البيانات (PDPL)",
    desc_en:
      "Flag data-processing, cross-border, and data-residency clauses that lack a legal basis or defined transfer mechanism.",
    desc_ar:
      "رصد بنود معالجة البيانات والنقل عبر الحدود وتوطين البيانات التي تفتقر إلى أساس نظامي أو آلية نقل محددة.",
  },
  {
    id: "zatca",
    group: "regulation",
    label_en: "ZATCA e-invoicing",
    label_ar: "الفوترة الإلكترونية (ZATCA)",
    desc_en:
      "Flag invoicing, payment, and penalty terms that must align with e-invoicing (Wave onboarding).",
    desc_ar:
      "رصد شروط الفوترة والدفع والغرامات التي يجب مواءمتها مع الفوترة الإلكترونية (موجات الربط).",
  },
  {
    id: "laborLaw",
    group: "regulation",
    label_en: "Saudi Labor Law",
    label_ar: "نظام العمل السعودي",
    desc_en:
      "Route employment contracts for review against the Labor Law and its implementing regulations.",
    desc_ar: "إحالة عقود العمل للمراجعة وفق نظام العمل ولوائحه التنفيذية.",
  },
  {
    id: "liabilityFloor",
    group: "playbook",
    label_en: "Minimum liability cap",
    label_ar: "الحد الأدنى لسقف المسؤولية",
    desc_en:
      "Flag contracts whose liability cap is below the SAR 1M floor, or that set no cap at all.",
    desc_ar:
      "رصد العقود التي يقل سقف مسؤوليتها عن مليون ريال، أو التي لا تحدّد سقفًا للمسؤولية.",
  },
  {
    id: "jurisdiction",
    group: "playbook",
    label_en: "Preferred jurisdiction",
    label_ar: "الاختصاص القضائي المفضّل",
    desc_en: "Flag contracts governed by a law outside the Kingdom.",
    desc_ar: "رصد العقود الخاضعة لقانون خارج المملكة.",
  },
  {
    id: "renewalNotice",
    group: "playbook",
    label_en: "Renewal-notice window",
    label_ar: "نافذة إشعار التجديد",
    desc_en:
      "Flag auto-renewing contracts with a notice window shorter than 45 days.",
    desc_ar: "رصد العقود ذاتية التجديد التي تقل نافذة إشعارها عن ٤٥ يومًا.",
  },
];

export const DEFAULT_CHECKS: Record<CheckId, boolean> = {
  pdpl: true,
  zatca: true,
  laborLaw: true,
  liabilityFloor: true,
  jurisdiction: true,
  renewalNotice: true,
};

/**
 * Checks that require a Pro plan. On Free they're shown but locked, so the user
 * sees the full capability. Free keeps the two core regulatory checks
 * (PDPL & Labor Law); the advanced ZATCA and the whole playbook are Pro.
 */
export const PRO_CHECKS = new Set<CheckId>([
  "zatca",
  "liabilityFloor",
  "jurisdiction",
  "renewalNotice",
]);

export const isProCheck = (id: CheckId): boolean => PRO_CHECKS.has(id);

export const checkLabel = (d: CheckDef, lang: Lang): string =>
  lang === "ar" ? d.label_ar : d.label_en;

export const checkDesc = (d: CheckDef, lang: Lang): string =>
  lang === "ar" ? d.desc_ar : d.desc_en;
