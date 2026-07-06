import type { Lang } from "./types";
import type { Plan } from "./plan";

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
  | "companiesLaw"
  | "govTenders"
  | "antiBribery"
  | "saudization"
  | "ipProtection"
  | "cybersecurity"
  | "aml"
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
    id: "companiesLaw",
    group: "regulation",
    label_en: "Companies Law",
    label_ar: "نظام الشركات",
    desc_en:
      "Check signing authority, representation and governance clauses against the Companies Law.",
    desc_ar:
      "التحقق من صلاحيات التوقيع والتمثيل وبنود الحوكمة وفق نظام الشركات ولائحته.",
  },
  {
    id: "govTenders",
    group: "regulation",
    label_en: "Government Tenders & Procurement Law",
    label_ar: "نظام المنافسات والمشتريات الحكومية",
    desc_en:
      "Flag contracts with government entities for alignment with the Tenders & Procurement Law.",
    desc_ar:
      "رصد العقود مع الجهات الحكومية لمواءمتها مع نظام المنافسات والمشتريات الحكومية.",
  },
  {
    id: "antiBribery",
    group: "regulation",
    label_en: "Anti-Bribery & Integrity (Nazaha)",
    label_ar: "مكافحة الرشوة والنزاهة",
    desc_en:
      "Require anti-bribery, conflict-of-interest and integrity clauses per the Anti-Bribery Law.",
    desc_ar:
      "اشتراط بنود مكافحة الرشوة وتعارض المصالح والنزاهة وفق نظام مكافحة الرشوة.",
  },
  {
    id: "saudization",
    group: "regulation",
    label_en: "Saudization (Nitaqat)",
    label_ar: "السعودة (نطاقات)",
    desc_en:
      "Check workforce and manpower-supply contracts against Saudization (Nitaqat) requirements.",
    desc_ar:
      "مراجعة عقود القوى العاملة والتوريد البشري وفق متطلبات السعودة (نطاقات).",
  },
  {
    id: "ipProtection",
    group: "regulation",
    label_en: "Intellectual Property (SAIP)",
    label_ar: "حماية الملكية الفكرية (الهيئة السعودية)",
    desc_en:
      "Review IP ownership, licensing and assignment clauses against SAIP frameworks.",
    desc_ar:
      "مراجعة بنود ملكية وترخيص وتنازل الملكية الفكرية وفق أطر الهيئة السعودية للملكية الفكرية.",
  },
  {
    id: "cybersecurity",
    group: "regulation",
    label_en: "Essential Cybersecurity Controls (NCA)",
    label_ar: "الضوابط الأساسية للأمن السيبراني (الهيئة الوطنية)",
    desc_en:
      "Flag IT, cloud and data contracts for alignment with the NCA Essential Cybersecurity Controls.",
    desc_ar:
      "رصد عقود التقنية والسحابة والبيانات لمواءمتها مع الضوابط الأساسية للأمن السيبراني.",
  },
  {
    id: "aml",
    group: "regulation",
    label_en: "Anti-Money Laundering",
    label_ar: "مكافحة غسل الأموال",
    desc_en:
      "Require KYC, source-of-funds and AML clauses in high-value and financial contracts.",
    desc_ar:
      "اشتراط بنود اعرف عميلك ومصدر الأموال ومكافحة غسل الأموال في العقود المالية وعالية القيمة.",
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
  companiesLaw: true,
  govTenders: true,
  antiBribery: true,
  saudization: true,
  ipProtection: true,
  cybersecurity: true,
  aml: true,
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
  "companiesLaw",
  "govTenders",
  "antiBribery",
  "saudization",
  "ipProtection",
  "cybersecurity",
  "aml",
  "liabilityFloor",
  "jurisdiction",
  "renewalNotice",
]);

export const isProCheck = (id: CheckId): boolean => PRO_CHECKS.has(id);

/**
 * The checks actually used to evaluate contracts for a given plan. On Free,
 * Pro-only checks are forced off — the Settings screen already shows them as
 * locked, but the stored toggle state defaults to "on" for everyone, so any
 * reviewing logic that read `checks` directly would silently apply Pro-tier
 * rules (ZATCA, liability floor, jurisdiction, renewal notice, …) to Free
 * users. Every consumer that drives user-facing output must read through
 * this instead of the raw `checks` state.
 */
export function effectiveChecks(
  checks: Record<CheckId, boolean>,
  plan: Plan,
): Record<CheckId, boolean> {
  if (plan !== "free") return checks;
  const out = { ...checks };
  for (const id of PRO_CHECKS) out[id] = false;
  return out;
}

export const checkLabel = (d: CheckDef, lang: Lang): string =>
  lang === "ar" ? d.label_ar : d.label_en;

export const checkDesc = (d: CheckDef, lang: Lang): string =>
  lang === "ar" ? d.desc_ar : d.desc_en;
