import React, { useState, useMemo } from "react";
import {
  Sun, Moon, Search, ShieldCheck, AlertTriangle, CircleCheck,
  CircleAlert, CircleHelp, Calendar, TrendingUp, Building2, Scale,
  Layers, Sparkles, ArrowLeft, X, ChevronLeft, FileText, Clock, Eye
} from "lucide-react";

/* ============================================================
   بصيرة · Baseerah — Post-signature contract intelligence
   Vertical slice for the Signit AI PM assignment.
   Arabic-first (RTL) · Light/Dark · 3 persona lenses ·
   Source-linked confidence · Dual Hijri/Gregorian radar ·
   Live "Ask Baseerah" (Claude API, graceful offline fallback).
   ============================================================ */

/* ---------- Theme ---------- */
const THEMES = {
  light: {
    bg: "#F4F1EA", surface: "#FBFAF6", surfaceAlt: "#EEE9DE", text: "#1C1B17",
    textSoft: "#636057", border: "#E3DDCF", onAccent: "#FFFFFF",
    accent: "#16624A", accentSoft: "#DEEBE4",
    high: "#1E7A4D", highBg: "#E4F1E9", med: "#9C6A15", medBg: "#F6ECD6",
    low: "#B23A48", lowBg: "#F7E2E4", shadow: "0 1px 2px rgba(28,27,23,.06), 0 8px 24px rgba(28,27,23,.05)"
  },
  dark: {
    bg: "#131512", surface: "#1B1E19", surfaceAlt: "#23271F", text: "#F0EDE3",
    textSoft: "#A6A79B", border: "#2E332A", onAccent: "#0C140F",
    accent: "#54BB8C", accentSoft: "#1E2B23",
    high: "#5FBE88", highBg: "#17271E", med: "#D6A552", medBg: "#2A2417",
    low: "#E1828E", lowBg: "#2C1A1D", shadow: "0 1px 2px rgba(0,0,0,.4), 0 10px 30px rgba(0,0,0,.35)"
  }
};

/* ---------- i18n ---------- */
const T = {
  ar: {
    dir: "rtl", name: "بصيرة", tag: "ذكاء العقود بعد التوقيع",
    overview: "النظرة العامة", radar: "رادار الالتزامات", ask: "اسأل بصيرة", review: "تحتاج مراجعتك",
    legal: "المستشار القانوني", proc: "إدارة المشتريات", exec: "الإدارة التنفيذية",
    totalCommit: "إجمالي الالتزامات التعاقدية", activeContracts: "عقود نشطة", next90: "التزامات خلال ٩٠ يومًا",
    concentration: "تركّز المورّدين", pdpl: "التزام حماية البيانات (PDPL)", exposure: "التوزّع حسب الفئة",
    upcoming: "تجديدات قادمة", autoRenewRisk: "معرّضة للتجديد التلقائي", noticeWindow: "نافذة الإشعار",
    daysLeft: "يوم متبقٍ", leverage: "نقاط التفاوض", riskOverview: "خريطة المخاطر", anomalies: "تعارضات مرصودة",
    byRisk: "العقود حسب الخطورة", high: "عالية", medium: "متوسطة", low: "منخفضة", verified: "موثّقة",
    needsReview: "بحاجة لمراجعة", confidence: "درجة الثقة", source: "المصدر في العقد", showSource: "أرِني المصدر",
    askPlaceholder: "اسأل عن محفظتك… مثال: أي عقود المورّدين بسقف مسؤولية أقل من مليون ريال؟",
    thinking: "بصيرة تقرأ العقود…", matches: "عقود مطابقة", noReview: "لا توجد عناصر بانتظار المراجعة — أحسنت.",
    confirm: "تأكيد", edit: "تعديل", confirmed: "تم التأكيد", value: "القيمة", term: "المدة",
    renewal: "التجديد", liability: "سقف المسؤولية", penalty: "الغرامات", law: "القانون الحاكم",
    counterparty: "الطرف الآخر", type: "النوع", back: "رجوع", none: "غير محدّد", vat: "ضريبة القيمة المضافة",
    open: "فتح العقد", riskFlag: "تنبيه مخاطرة", live: "ذكاء مباشر", langBtn: "EN",
    types: { vendor: "اتفاقية مورّد", saas: "اشتراك برمجي", nda: "اتفاقية سرية", employment: "عقد عمل", partnership: "شراكة", cloud: "استضافة سحابية" },
    filterCap: "سقف مسؤولية < مليون ر.س", filterRenew: "تجديد خلال ٩٠ يومًا", clear: "الكل",
    trustNote: "كل قيمة مُستخرَجة بالذكاء الاصطناعي مرتبطة بمصدرها في العقد ودرجة ثقتها. اضغط أي قيمة لرؤية النص الأصلي.",
    hijri: "هـ", greg: "م"
  },
  en: {
    dir: "ltr", name: "Baseerah", tag: "Post-signature contract intelligence",
    overview: "Overview", radar: "Obligation Radar", ask: "Ask Baseerah", review: "Needs your eyes",
    legal: "Legal Counsel", proc: "Procurement / Ops", exec: "Executive",
    totalCommit: "Total contractual commitments", activeContracts: "Active contracts", next90: "Obligations in next 90 days",
    concentration: "Vendor concentration", pdpl: "PDPL compliance", exposure: "Exposure by category",
    upcoming: "Upcoming renewals", autoRenewRisk: "At risk of auto-renewal", noticeWindow: "Notice window",
    daysLeft: "days left", leverage: "Negotiation leverage", riskOverview: "Risk map", anomalies: "Anomalies flagged",
    byRisk: "Contracts by risk", high: "High", medium: "Medium", low: "Low", verified: "Verified",
    needsReview: "Needs review", confidence: "Confidence", source: "Source clause", showSource: "Show source",
    askPlaceholder: "Ask your portfolio… e.g. which vendor contracts have a liability cap below 1M SAR?",
    thinking: "Baseerah is reading the contracts…", matches: "Matching contracts", noReview: "Nothing awaiting review — nicely done.",
    confirm: "Confirm", edit: "Edit", confirmed: "Confirmed", value: "Value", term: "Term",
    renewal: "Renewal", liability: "Liability cap", penalty: "Penalties", law: "Governing law",
    counterparty: "Counterparty", type: "Type", back: "Back", none: "Not specified", vat: "VAT",
    open: "Open contract", riskFlag: "Risk flag", live: "Live AI", langBtn: "ع",
    types: { vendor: "Vendor agreement", saas: "SaaS subscription", nda: "NDA", employment: "Employment", partnership: "Partnership", cloud: "Cloud hosting" },
    filterCap: "Liability cap < 1M SAR", filterRenew: "Renews in 90 days", clear: "All",
    trustNote: "Every AI-extracted value is linked to its source clause and a confidence score. Tap any value to see the original text.",
    hijri: "AH", greg: "CE"
  }
};

/* ---------- Sample data: realistic Saudi post-signature portfolio ---------- */
const CONTRACTS = [
  {
    id: "C-1042", type: "saas", lang: "en", risk: "high",
    title_ar: "اشتراك منصة إدارة علاقات العملاء", title_en: "CRM Platform Subscription",
    party_ar: "شركة كلاود سي آر إم", party_en: "CloudCRM Inc.",
    valueSAR: 840000, endGreg: "2026-09-30", endHijri: "1448/04/07",
    autoRenew: true, noticeDays: 30, daysToRenew: 89,
    facts: [
      { k: "value", conf: "high", va: "٨٤٠٬٠٠٠ ر.س سنويًا", ve: "SAR 840,000 / year", sa: "«رسوم الاشتراك السنوية ثمانمائة وأربعون ألف ريال سعودي».", se: "\"Annual subscription fee of SAR 840,000.\"" },
      { k: "renewal", conf: "medium", va: "تجديد تلقائي، إشعار قبل ٣٠ يومًا فقط", ve: "Auto-renews; 30-day notice only", sa: "«يُجدَّد تلقائيًا ما لم يُخطِر أحد الطرفين قبل ثلاثين يومًا».", se: "\"Renews automatically unless notice is given 30 days prior.\"" },
      { k: "liability", conf: "high", va: "٥٠٠٬٠٠٠ ر.س", ve: "SAR 500,000", sa: "«لا تتجاوز المسؤولية الإجمالية خمسمائة ألف ريال».", se: "\"Total liability shall not exceed SAR 500,000.\"" },
      { k: "law", conf: "high", va: "أنظمة المملكة العربية السعودية", ve: "Laws of Saudi Arabia", sa: "«يخضع هذا العقد لأنظمة المملكة».", se: "\"Governed by the laws of the Kingdom.\"" }
    ],
    anomaly_ar: "سقف المسؤولية (٥٠٠ ألف) أقل من القيمة السنوية للعقد — يخالف سياسة الحد الأدنى للمخاطر.",
    anomaly_en: "Liability cap (500K) is below the annual contract value — breaches the company's minimum-risk policy."
  },
  {
    id: "C-0988", type: "cloud", lang: "bilingual", risk: "medium",
    title_ar: "اتفاقية استضافة سحابية", title_en: "Cloud Hosting Agreement",
    party_ar: "مركز البيانات الوطني السحابي", party_en: "National Cloud DC",
    valueSAR: 1250000, endGreg: "2027-01-15", endHijri: "1448/07/26",
    autoRenew: true, noticeDays: 60, daysToRenew: 196,
    facts: [
      { k: "value", conf: "high", va: "١٬٢٥٠٬٠٠٠ ر.س", ve: "SAR 1,250,000", sa: "«القيمة الإجمالية مليون ومائتان وخمسون ألف ريال».", se: "\"Total value SAR 1,250,000.\"" },
      { k: "pdpl", conf: "medium", va: "بيانات مستضافة داخل المملكة (يتطلب تأكيد)", ve: "Data hosted in-Kingdom (needs confirmation)", sa: "«تُخزَّن البيانات في مراكز داخل المملكة أو ما يعادلها».", se: "\"Data stored in-Kingdom or equivalent facilities.\"" },
      { k: "liability", conf: "high", va: "٢٬٠٠٠٬٠٠٠ ر.س", ve: "SAR 2,000,000", sa: "«حد المسؤولية مليونا ريال».", se: "\"Liability capped at SAR 2,000,000.\"" },
      { k: "renewal", conf: "high", va: "تجديد تلقائي، إشعار ٦٠ يومًا", ve: "Auto-renews; 60-day notice", sa: "«يُجدَّد ما لم يُخطَر قبل ستين يومًا».", se: "\"Renews unless 60-day notice served.\"" }
    ],
    anomaly_ar: "عبارة «أو ما يعادلها» تُضعف شرط توطين البيانات — راجعها مع الامتثال.",
    anomaly_en: "The phrase \"or equivalent\" weakens the data-residency clause — review with compliance."
  },
  {
    id: "C-0765", type: "vendor", lang: "ar", risk: "low",
    title_ar: "توريد أجهزة تقنية", title_en: "IT Hardware Supply",
    party_ar: "مؤسسة الأنظمة المتكاملة", party_en: "Integrated Systems Est.",
    valueSAR: 430000, endGreg: "2026-07-20", endHijri: "1448/01/25",
    autoRenew: false, noticeDays: 0, daysToRenew: 17,
    facts: [
      { k: "value", conf: "high", va: "٤٣٠٬٠٠٠ ر.س", ve: "SAR 430,000", sa: "«قيمة التوريد أربعمائة وثلاثون ألف ريال شاملة الضريبة».", se: "\"Supply value SAR 430,000 incl. VAT.\"" },
      { k: "penalty", conf: "high", va: "٠٫٥٪ عن كل يوم تأخير", ve: "0.5% per day of delay", sa: "«غرامة تأخير نصف بالمائة يوميًا بحد أقصى ١٠٪».", se: "\"Late penalty 0.5%/day, capped at 10%.\"" },
      { k: "term", conf: "high", va: "ينتهي ٢٠ يوليو ٢٠٢٦", ve: "Ends 20 Jul 2026", sa: "«تنتهي مدة العقد بتاريخ ٢٥/٠١/١٤٤٨هـ».", se: "\"Contract ends 25/01/1448 AH.\"" }
    ],
    anomaly_ar: null, anomaly_en: null
  },
  {
    id: "C-1130", type: "vendor", lang: "ar", risk: "medium",
    title_ar: "خدمات النقل واللوجستيات", title_en: "Logistics & Transport Services",
    party_ar: "شركة المسار للنقل", party_en: "Al-Masar Transport Co.",
    valueSAR: 690000, endGreg: "2026-08-31", endHijri: "1448/03/09",
    autoRenew: true, noticeDays: 90, daysToRenew: 59,
    facts: [
      { k: "value", conf: "high", va: "٦٩٠٬٠٠٠ ر.س", ve: "SAR 690,000", sa: "«بدل الخدمة السنوي ستمائة وتسعون ألف ريال».", se: "\"Annual service fee SAR 690,000.\"" },
      { k: "renewal", conf: "high", va: "تجديد تلقائي، إشعار ٩٠ يومًا", ve: "Auto-renews; 90-day notice", sa: "«يتجدد تلقائيًا ما لم يُشعَر قبل تسعين يومًا».", se: "\"Auto-renews unless 90-day notice.\"" },
      { k: "penalty", conf: "medium", va: "غرامة تأخير غير محددة القيمة", ve: "Delay penalty — amount unspecified", sa: "«يتحمل المورّد غرامة عن التأخير يحددها الطرف الأول».", se: "\"Supplier bears a delay penalty set by the first party.\"" }
    ],
    anomaly_ar: "نافذة الإشعار (٩٠ يومًا) تكاد تُغلق — يتبقى وقت محدود لإعادة التفاوض.",
    anomaly_en: "The 90-day notice window is nearly closed — limited time left to renegotiate."
  },
  {
    id: "C-0512", type: "vendor", lang: "en", risk: "medium",
    title_ar: "عقد وكالة تسويق", title_en: "Marketing Agency Retainer",
    party_ar: "وكالة المدى الإبداعية", party_en: "Mada Creative Agency",
    valueSAR: 360000, endGreg: "2026-11-01", endHijri: "1448/05/11",
    autoRenew: false, noticeDays: 0, daysToRenew: 121,
    facts: [
      { k: "value", conf: "high", va: "٣٦٠٬٠٠٠ ر.س", ve: "SAR 360,000", sa: "«أتعاب شهرية ثلاثون ألف ريال».", se: "\"Monthly retainer of SAR 30,000.\"" },
      { k: "liability", conf: "low", va: "غير مذكور في العقد", ve: "Not found in the contract", sa: "— لم يُعثر على بند لسقف المسؤولية.", se: "— No liability clause located." },
      { k: "law", conf: "high", va: "أنظمة المملكة", ve: "Laws of Saudi Arabia", sa: "«يخضع لأنظمة المملكة».", se: "\"Governed by KSA law.\"" }
    ],
    anomaly_ar: "لا يوجد سقف مسؤولية — بيانات ناقصة تحتاج تأكيدًا بشريًا.",
    anomaly_en: "No liability cap present — missing data requiring human confirmation."
  },
  {
    id: "C-1201", type: "employment", lang: "ar", risk: "low",
    title_ar: "عقد عمل تنفيذي", title_en: "Executive Employment Contract",
    party_ar: "الموظف: عبدالله ا.", party_en: "Employee: Abdullah A.",
    valueSAR: 720000, endGreg: "2027-03-01", endHijri: "1448/09/12",
    autoRenew: true, noticeDays: 60, daysToRenew: 241,
    facts: [
      { k: "value", conf: "high", va: "٧٢٠٬٠٠٠ ر.س سنويًا", ve: "SAR 720,000 / year", sa: "«الراتب السنوي سبعمائة وعشرون ألف ريال».", se: "\"Annual salary SAR 720,000.\"" },
      { k: "law", conf: "high", va: "نظام العمل السعودي", ve: "Saudi Labor Law", sa: "«يخضع لنظام العمل ولوائحه التنفيذية».", se: "\"Subject to the Saudi Labor Law.\"" },
      { k: "penalty", conf: "medium", va: "عدم منافسة ١٢ شهرًا", ve: "12-month non-compete", sa: "«يلتزم الموظف بعدم المنافسة لمدة اثني عشر شهرًا».", se: "\"12-month non-compete obligation.\"" }
    ],
    anomaly_ar: null, anomaly_en: null
  },
  {
    id: "C-0899", type: "saas", lang: "en", risk: "high",
    title_ar: "ترخيص برمجيات المؤسسة", title_en: "Enterprise Software License",
    party_ar: "شركة سوفت ستاك العالمية", party_en: "SoftStack Global",
    valueSAR: 980000, endGreg: "2026-10-10", endHijri: "1448/04/17",
    autoRenew: true, noticeDays: 45, daysToRenew: 99,
    facts: [
      { k: "value", conf: "high", va: "٩٨٠٬٠٠٠ ر.س", ve: "SAR 980,000", sa: "«رسوم الترخيص تسعمائة وثمانون ألف ريال».", se: "\"License fee SAR 980,000.\"" },
      { k: "liability", conf: "high", va: "٤٠٠٬٠٠٠ ر.س", ve: "SAR 400,000", sa: "«تُحدَّد المسؤولية بأربعمائة ألف ريال».", se: "\"Liability limited to SAR 400,000.\"" },
      { k: "renewal", conf: "high", va: "تجديد تلقائي، إشعار ٤٥ يومًا", ve: "Auto-renews; 45-day notice", sa: "«يُجدَّد تلقائيًا بإشعار خمسة وأربعين يومًا».", se: "\"Auto-renews on 45-day notice.\"" },
      { k: "pdpl", conf: "low", va: "معالجة بيانات خارج المملكة (غير واضح)", ve: "Off-shore data processing (unclear)", sa: "«قد تُعالَج البيانات لدى جهات تابعة في الخارج».", se: "\"Data may be processed by affiliates abroad.\"" }
    ],
    anomaly_ar: "سقف مسؤولية منخفض + معالجة بيانات خارجية غير محددة — خطر مزدوج على القيمة والامتثال.",
    anomaly_en: "Low liability cap + undefined offshore data processing — dual risk to value and compliance."
  },
  {
    id: "C-0641", type: "cloud", lang: "bilingual", risk: "low",
    title_ar: "اتصالات وربط شبكي", title_en: "Connectivity & Networking",
    party_ar: "مزوّد الاتصالات الرقمية", party_en: "Digital Telecom Provider",
    valueSAR: 1560000, endGreg: "2027-02-01", endHijri: "1448/08/14",
    autoRenew: true, noticeDays: 90, daysToRenew: 213,
    facts: [
      { k: "value", conf: "high", va: "١٬٥٦٠٬٠٠٠ ر.س", ve: "SAR 1,560,000", sa: "«القيمة السنوية مليون وخمسمائة وستون ألف ريال».", se: "\"Annual value SAR 1,560,000.\"" },
      { k: "liability", conf: "high", va: "٣٬٠٠٠٬٠٠٠ ر.س", ve: "SAR 3,000,000", sa: "«حد المسؤولية ثلاثة ملايين ريال».", se: "\"Liability cap SAR 3,000,000.\"" },
      { k: "renewal", conf: "high", va: "تجديد ١٢ شهرًا، إشعار ٩٠ يومًا", ve: "12-month renewal; 90-day notice", sa: "«يُجدَّد لمدة اثني عشر شهرًا بإشعار تسعين يومًا».", se: "\"12-month renewal on 90-day notice.\"" }
    ],
    anomaly_ar: null, anomaly_en: null
  },
  {
    id: "C-1077", type: "vendor", lang: "ar", risk: "medium",
    title_ar: "خدمات استشارية مهنية", title_en: "Professional Consulting Services",
    party_ar: "بيت الخبرة للاستشارات", party_en: "Expertise House Consulting",
    valueSAR: 540000, endGreg: "2026-09-05", endHijri: "1448/03/14",
    autoRenew: false, noticeDays: 0, daysToRenew: 64,
    facts: [
      { k: "value", conf: "high", va: "٥٤٠٬٠٠٠ ر.س", ve: "SAR 540,000", sa: "«قيمة الاستشارة خمسمائة وأربعون ألف ريال».", se: "\"Consulting value SAR 540,000.\"" },
      { k: "term", conf: "low", va: "شرط إنهاء غامض", ve: "Ambiguous termination clause", sa: "«يجوز الإنهاء عند الإخلال الجوهري دون تحديد مدة العلاج».", se: "\"May terminate on material breach; cure period undefined.\"" }
    ],
    anomaly_ar: "شرط الإنهاء لا يحدد «مدة العلاج» — غموض قد يؤدي لنزاع.",
    anomaly_en: "Termination clause omits the cure period — ambiguity that could trigger a dispute."
  },
  {
    id: "C-0333", type: "nda", lang: "en", risk: "low",
    title_ar: "اتفاقية سرية متبادلة", title_en: "Mutual NDA",
    party_ar: "شركة أفق للتقنية", party_en: "Ufuq Technologies",
    valueSAR: 0, endGreg: "2028-01-01", endHijri: "1449/07/06",
    autoRenew: false, noticeDays: 0, daysToRenew: 547,
    facts: [
      { k: "term", conf: "high", va: "سرية لمدة ٣ سنوات", ve: "3-year confidentiality term", sa: "«تسري السرية لمدة ثلاث سنوات».", se: "\"Confidentiality survives for 3 years.\"" },
      { k: "law", conf: "high", va: "أنظمة المملكة", ve: "Laws of Saudi Arabia", sa: "«يخضع لأنظمة المملكة».", se: "\"Governed by KSA law.\"" }
    ],
    anomaly_ar: null, anomaly_en: null
  }
];

/* ---------- helpers ---------- */
const fmtSAR = (n) => new Intl.NumberFormat("en-US").format(n);
const confMeta = (t) => ({
  high: { label: (l) => T[l].verified, dot: t.high, bg: t.highBg, Icon: CircleCheck },
  medium: { label: (l) => T[l].needsReview, dot: t.med, bg: t.medBg, Icon: CircleAlert },
  low: { label: (l) => T[l].needsReview, dot: t.low, bg: t.lowBg, Icon: CircleHelp }
});
const riskColor = (t, r) => (r === "high" ? t.low : r === "medium" ? t.med : t.high);

export default function App() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("ar");
  const [persona, setPersona] = useState("exec");
  const [tab, setTab] = useState("overview");
  const [active, setActive] = useState(null);       // open contract
  const [srcFact, setSrcFact] = useState(null);      // open source clause
  const [filter, setFilter] = useState(null);
  const [confirmed, setConfirmed] = useState({});    // review-queue confirmations
  const t = THEMES[dark ? "dark" : "light"];
  const L = T[lang];
  const cm = confMeta(t);

  const totalCommit = useMemo(() => CONTRACTS.reduce((s, c) => s + c.valueSAR, 0), []);
  const next90 = CONTRACTS.filter((c) => c.daysToRenew <= 90);
  const anomalies = CONTRACTS.filter((c) => c.anomaly_en);
  const reviewItems = useMemo(
    () => CONTRACTS.flatMap((c) => c.facts.filter((f) => f.conf === "low").map((f) => ({ c, f }))),
    []
  );

  const filtered = useMemo(() => {
    if (filter === "cap") return CONTRACTS.filter((c) => c.facts.some((f) => f.k === "liability" && /400|500/.test(f.ve)));
    if (filter === "renew") return next90;
    return CONTRACTS;
  }, [filter]);

  const S = { fontFamily: "'IBM Plex Sans Arabic','IBM Plex Sans',system-ui,sans-serif" };
  const card = { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, boxShadow: t.shadow };

  return (
    <div dir={L.dir} style={{ background: t.bg, color: t.text, minHeight: "100vh", ...S, transition: "background .3s,color .3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Amiri:wght@700&display=swap');
        * { box-sizing: border-box; }
        ::selection { background:${t.accentSoft}; }
        @keyframes rise { from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:none;} }
        .rise { animation: rise .5s cubic-bezier(.2,.7,.2,1) both; }
        .tap { transition: transform .12s ease, background .2s ease, border-color .2s; }
        .tap:hover { transform: translateY(-2px); }
        .tap:active { transform: translateY(0); }
        input:focus { outline: none; }
      `}</style>

      {/* ===== Top bar ===== */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: t.bg + "ee", backdropFilter: "blur(10px)", borderBottom: `1px solid ${t.border}` }}>
        <div className="flex items-center gap-4 px-5 py-3" style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 10, background: t.accent }}>
              <Eye size={19} color={dark ? "#0c140f" : "#fff"} />
            </div>
            <div className="leading-tight">
              <div style={{ fontFamily: "'Amiri',serif", fontSize: 22, fontWeight: 700, color: t.text }}>{L.name}</div>
            </div>
            <span className="hidden sm:inline" style={{ fontSize: 11, color: t.textSoft, borderInlineStart: `1px solid ${t.border}`, paddingInlineStart: 10, marginInlineStart: 4 }}>{L.tag}</span>
          </div>
          <div className="flex-1" />
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="tap flex items-center gap-1 px-3 py-1.5" style={{ fontSize: 13, fontWeight: 600, color: t.text, border: `1px solid ${t.border}`, borderRadius: 10, background: t.surface }}>
            {L.langBtn}
          </button>
          <button onClick={() => setDark(!dark)} className="tap flex items-center justify-center" style={{ width: 36, height: 36, border: `1px solid ${t.border}`, borderRadius: 10, background: t.surface, color: t.text }}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* persona lens switch */}
        <div className="px-5 pb-3" style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="flex items-center gap-1 p-1" style={{ background: t.surfaceAlt, borderRadius: 12, width: "fit-content" }}>
            {[["exec", Building2], ["proc", TrendingUp], ["legal", Scale]].map(([p, Ic]) => (
              <button key={p} onClick={() => { setPersona(p); setFilter(null); }} className="tap flex items-center gap-2 px-3 py-2"
                style={{ borderRadius: 9, fontSize: 13, fontWeight: 600, color: persona === p ? (dark ? "#0c140f" : "#fff") : t.textSoft, background: persona === p ? t.accent : "transparent" }}>
                <Ic size={15} /> {L[p]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ===== Tabs ===== */}
      <nav className="px-5" style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="flex items-center gap-1 pt-4" style={{ flexWrap: "wrap" }}>
          {[["overview", Layers], ["radar", Calendar], ["ask", Sparkles], ["review", Eye]].map(([k, Ic]) => {
            const on = tab === k;
            const badge = k === "review" ? reviewItems.filter((r) => !confirmed[r.c.id + r.f.k]).length : k === "radar" ? next90.length : null;
            return (
              <button key={k} onClick={() => { setTab(k); setActive(null); }} className="tap flex items-center gap-2 px-3.5 py-2"
                style={{ fontSize: 13.5, fontWeight: 600, color: on ? t.text : t.textSoft, borderRadius: 10, background: on ? t.surface : "transparent", border: `1px solid ${on ? t.border : "transparent"}` }}>
                <Ic size={16} color={on ? t.accent : t.textSoft} /> {L[k]}
                {badge > 0 && <span style={{ fontSize: 11, background: k === "review" ? t.lowBg : t.accentSoft, color: k === "review" ? t.low : t.accent, borderRadius: 20, padding: "1px 7px", fontWeight: 700 }}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== Body ===== */}
      <main className="px-5 py-6" style={{ maxWidth: 1180, margin: "0 auto" }}>
        {tab === "overview" && <Overview {...{ t, L, lang, persona, cm, card, setActive, filtered, filter, setFilter, totalCommit, next90, anomalies }} />}
        {tab === "radar" && <Radar {...{ t, L, lang, card, setActive }} />}
        {tab === "ask" && <Ask {...{ t, L, lang, card, cm, setActive }} />}
        {tab === "review" && <Review {...{ t, L, lang, card, reviewItems, confirmed, setConfirmed, setActive }} />}
      </main>

      {/* ===== Contract drawer ===== */}
      {active && <Drawer {...{ t, L, lang, cm, card, c: active, close: () => { setActive(null); setSrcFact(null); }, srcFact, setSrcFact }} />}

      <footer className="px-5 py-6" style={{ maxWidth: 1180, margin: "0 auto", color: t.textSoft, fontSize: 12, borderTop: `1px solid ${t.border}` }}>
        {L.name} · {L.tag} — {lang === "ar" ? "نموذج أولي للعرض · بيانات تجريبية واقعية" : "Prototype demo · realistic sample data"}
      </footer>
    </div>
  );
}

/* ---------- Stat card ---------- */
function Stat({ t, label, value, sub, tone, onClick }) {
  return (
    <button onClick={onClick} className="tap rise text-start" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 18, textAlign: "start", cursor: onClick ? "pointer" : "default", boxShadow: t.shadow }}>
      <div style={{ fontSize: 12.5, color: t.textSoft, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Amiri',serif", color: tone || t.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: t.textSoft, marginTop: 8 }}>{sub}</div>}
    </button>
  );
}

/* ---------- Overview (three lenses over one dataset) ---------- */
function Overview({ t, L, lang, persona, cm, card, setActive, filtered, filter, setFilter, totalCommit, next90, anomalies }) {
  const catExposure = [
    ["saas", 0], ["cloud", 0], ["vendor", 0], ["employment", 0], ["nda", 0]
  ].map(([k]) => [k, CONTRACTS.filter((c) => c.type === k).reduce((s, c) => s + c.valueSAR, 0)]);
  const maxCat = Math.max(...catExposure.map((x) => x[1]), 1);
  const topParty = [...CONTRACTS].sort((a, b) => b.valueSAR - a.valueSAR)[0];
  const conc = Math.round((topParty.valueSAR / totalCommit) * 100);
  const pdplOk = CONTRACTS.filter((c) => c.facts.some((f) => f.k === "pdpl" && f.conf === "high")).length;

  return (
    <div>
      {/* KPI row changes emphasis per persona */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        {persona === "exec" && <>
          <Stat t={t} label={L.totalCommit} value={`${fmtSAR(totalCommit)} ر.س`} sub={`${CONTRACTS.length} ${L.activeContracts}`} />
          <Stat t={t} label={L.next90} value={`${next90.length}`} sub={lang === "ar" ? "قيمة معرّضة للتجديد" : "value up for renewal"} onClick={() => setFilter("renew")} />
          <Stat t={t} label={L.concentration} value={`${conc}%`} sub={lang === "ar" ? topParty.party_ar : topParty.party_en} tone={conc > 20 ? t.med : t.text} />
          <Stat t={t} label={L.pdpl} value={`${pdplOk}/${CONTRACTS.filter(c=>c.facts.some(f=>f.k==="pdpl")).length}`} sub={lang === "ar" ? "عقود بها معالجة بيانات" : "data-processing contracts"} tone={t.med} />
        </>}
        {persona === "proc" && <>
          <Stat t={t} label={L.upcoming} value={`${next90.length}`} sub={lang === "ar" ? "خلال ٩٠ يومًا" : "in 90 days"} onClick={() => setFilter("renew")} />
          <Stat t={t} label={L.autoRenewRisk} value={`${CONTRACTS.filter(c=>c.autoRenew&&c.daysToRenew<=90).length}`} sub={lang === "ar" ? "تتجدد تلقائيًا قريبًا" : "auto-renew soon"} tone={t.low} />
          <Stat t={t} label={L.totalCommit} value={`${fmtSAR(totalCommit)} ر.س`} sub={`${CONTRACTS.length} ${L.activeContracts}`} />
          <Stat t={t} label={lang==="ar"?"أقصر نافذة إشعار":"Tightest notice window"} value={`${Math.min(...next90.map(c=>c.daysToRenew))} ${L.daysLeft}`} tone={t.low} sub={lang==="ar"?"تصرّف الآن":"act now"} />
        </>}
        {persona === "legal" && <>
          <Stat t={t} label={L.anomalies} value={`${anomalies.length}`} sub={lang === "ar" ? "تعارضات تحتاج قرارك" : "need your decision"} tone={t.low} onClick={() => setFilter(null)} />
          <Stat t={t} label={L.filterCap} value={`${CONTRACTS.filter(c=>c.facts.some(f=>f.k==="liability"&&/400|500/.test(f.ve))).length}`} sub={lang === "ar" ? "دون السياسة" : "below policy"} tone={t.med} onClick={() => setFilter("cap")} />
          <Stat t={t} label={L.byRisk} value={`${CONTRACTS.filter(c=>c.risk==="high").length} ${L.high}`} sub={`${CONTRACTS.filter(c=>c.risk==="medium").length} ${L.medium} · ${CONTRACTS.filter(c=>c.risk==="low").length} ${L.low}`} />
          <Stat t={t} label={L.activeContracts} value={`${CONTRACTS.length}`} sub={lang === "ar" ? "قابلة للاستعلام" : "queryable"} />
        </>}
      </div>

      {/* trust note */}
      <div className="rise flex items-start gap-2 mt-4 p-3" style={{ background: t.accentSoft, borderRadius: 12, fontSize: 12.5, color: t.text }}>
        <ShieldCheck size={16} color={t.accent} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{L.trustNote}</span>
      </div>

      {/* exposure bars (exec) or anomaly strip (legal) */}
      {persona === "exec" && (
        <div className="rise mt-4" style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{L.exposure}</div>
          {catExposure.filter(x=>x[1]>0).map(([k, v]) => (
            <div key={k} className="flex items-center gap-3 mb-2.5">
              <div style={{ width: 96, fontSize: 12.5, color: t.textSoft }}>{L.types[k]}</div>
              <div className="flex-1" style={{ background: t.surfaceAlt, borderRadius: 8, height: 12 }}>
                <div style={{ width: `${(v / maxCat) * 100}%`, background: t.accent, height: 12, borderRadius: 8, transition: "width .6s" }} />
              </div>
              <div style={{ width: 92, fontSize: 12, textAlign: "end", color: t.text, fontWeight: 600 }}>{fmtSAR(v)}</div>
            </div>
          ))}
        </div>
      )}

      {/* filter chips */}
      <div className="flex items-center gap-2 mt-5 mb-3" style={{ flexWrap: "wrap" }}>
        <FilterChip t={t} on={!filter} onClick={() => setFilter(null)}>{L.clear}</FilterChip>
        <FilterChip t={t} on={filter === "cap"} onClick={() => setFilter("cap")}>{L.filterCap}</FilterChip>
        <FilterChip t={t} on={filter === "renew"} onClick={() => setFilter("renew")}>{L.filterRenew}</FilterChip>
      </div>

      {/* contract list */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
        {filtered.map((c) => <ContractCard key={c.id} {...{ t, L, lang, cm, c, setActive }} />)}
      </div>
    </div>
  );
}

function FilterChip({ t, on, onClick, children }) {
  return (
    <button onClick={onClick} className="tap px-3 py-1.5" style={{ fontSize: 12.5, fontWeight: 600, borderRadius: 20, border: `1px solid ${on ? t.accent : t.border}`, background: on ? t.accentSoft : "transparent", color: on ? t.accent : t.textSoft }}>
      {children}
    </button>
  );
}

/* ---------- Contract card ---------- */
function ContractCard({ t, L, lang, cm, c, setActive, highlight }) {
  return (
    <button onClick={() => setActive(c)} className="tap rise text-start" style={{ background: t.surface, border: `1px solid ${highlight ? t.accent : t.border}`, borderRadius: 16, padding: 16, textAlign: "start", boxShadow: t.shadow }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span style={{ fontSize: 11, color: t.textSoft, fontWeight: 600 }}>{c.id} · {L.types[c.type]}</span>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: c.risk === "high" ? t.low : c.risk === "medium" ? t.med : t.high }} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3, color: t.text }}>{lang === "ar" ? c.title_ar : c.title_en}</div>
      <div style={{ fontSize: 12.5, color: t.textSoft, marginBottom: 10 }}>{lang === "ar" ? c.party_ar : c.party_en}</div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Amiri',serif" }}>{c.valueSAR ? `${fmtSAR(c.valueSAR)} ر.س` : "—"}</span>
        {c.autoRenew && c.daysToRenew <= 90 && (
          <span className="flex items-center gap-1" style={{ fontSize: 11, color: t.med, background: t.medBg, borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>
            <Clock size={12} /> {c.daysToRenew} {L.daysLeft}
          </span>
        )}
      </div>
      {c.anomaly_en && (
        <div className="flex items-center gap-1 mt-2" style={{ fontSize: 11.5, color: t.low }}>
          <AlertTriangle size={13} /> {L.riskFlag}
        </div>
      )}
    </button>
  );
}

/* ---------- Radar (dual Hijri / Gregorian) ---------- */
function Radar({ t, L, lang, card, setActive }) {
  const [win, setWin] = useState(90);
  const items = CONTRACTS.filter((c) => c.daysToRenew <= win).sort((a, b) => a.daysToRenew - b.daysToRenew);
  return (
    <div>
      <div className="flex items-center gap-2 mb-4" style={{ flexWrap: "wrap" }}>
        {[30, 60, 90, 365].map((w) => (
          <FilterChip key={w} t={t} on={win === w} onClick={() => setWin(w)}>{w === 365 ? (lang === "ar" ? "السنة" : "1 year") : `${w} ${lang === "ar" ? "يومًا" : "days"}`}</FilterChip>
        ))}
      </div>
      <div style={{ position: "relative", paddingInlineStart: 18 }}>
        <div style={{ position: "absolute", insetInlineStart: 4, top: 6, bottom: 6, width: 2, background: t.border }} />
        {items.map((c, i) => {
          const urgent = c.daysToRenew <= 30, warn = c.daysToRenew <= 60;
          const col = urgent ? t.low : warn ? t.med : t.high;
          return (
            <div key={c.id} className="rise" style={{ position: "relative", marginBottom: 12, animationDelay: `${i * 60}ms` }}>
              <span style={{ position: "absolute", insetInlineStart: -18, top: 20, width: 10, height: 10, borderRadius: 10, background: col, boxShadow: `0 0 0 4px ${t.bg}` }} />
              <button onClick={() => setActive(c)} className="tap text-start w-full" style={{ ...card, padding: 14, textAlign: "start" }}>
                <div className="flex items-center justify-between gap-2 mb-1" style={{ flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>{lang === "ar" ? c.title_ar : c.title_en}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{c.daysToRenew} {L.daysLeft}</span>
                </div>
                <div className="flex items-center gap-3" style={{ flexWrap: "wrap", fontSize: 12, color: t.textSoft }}>
                  <span>{lang === "ar" ? c.party_ar : c.party_en}</span>
                  <span style={{ color: t.text }}>{c.endHijri} {L.hijri}</span>
                  <span>·</span>
                  <span>{c.endGreg} {L.greg}</span>
                  {c.autoRenew && <span style={{ color: t.med, fontWeight: 600 }}>· {L.autoRenewRisk} ({c.noticeDays}d {L.noticeWindow})</span>}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Ask Baseerah (live AI + graceful fallback) ---------- */
function Ask({ t, L, lang, card, cm, setActive }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [liveTag, setLiveTag] = useState(false);
  const suggestions = lang === "ar"
    ? ["أي عقود بسقف مسؤولية أقل من مليون ريال؟", "ما الذي يتجدد تلقائيًا خلال ٩٠ يومًا؟", "أي عقود بها مخاطر على حماية البيانات؟"]
    : ["Which contracts have a liability cap below 1M SAR?", "What auto-renews in the next 90 days?", "Which contracts carry data-protection risk?"];

  const fallback = (question) => {
    const s = question.toLowerCase();
    let ids = [], ha = "", he = "";
    if (/(cap|مسؤول|liab|مليون|1m)/.test(s)) { ids = CONTRACTS.filter(c => c.facts.some(f => f.k === "liability" && /400|500/.test(f.ve))).map(c => c.id); ha = "عقود بسقف مسؤولية أقل من مليون ريال — دون سياسة الحد الأدنى."; he = "Contracts with a liability cap below SAR 1M — under the minimum-risk policy."; }
    else if (/(renew|تجديد|٩٠|90|auto)/.test(s)) { ids = CONTRACTS.filter(c => c.daysToRenew <= 90).map(c => c.id); ha = "عقود تتجدد خلال ٩٠ يومًا."; he = "Contracts renewing within 90 days."; }
    else if (/(data|بيانات|pdpl|حماية|privacy)/.test(s)) { ids = CONTRACTS.filter(c => c.facts.some(f => f.k === "pdpl")).map(c => c.id); ha = "عقود بها معالجة بيانات تحتاج مراجعة امتثال."; he = "Contracts with data processing needing a compliance review."; }
    else { ids = CONTRACTS.slice(0, 3).map(c => c.id); ha = "أقرب النتائج من محفظتك."; he = "Closest matches from your portfolio."; }
    return { answer_ar: ha, answer_en: he, matchIds: ids };
  };

  const run = async (question) => {
    const query = question ?? q;
    if (!query.trim()) return;
    setBusy(true); setRes(null);
    const compact = CONTRACTS.map(c => ({ id: c.id, title: c.title_en, party: c.party_en, type: c.type, valueSAR: c.valueSAR, endGreg: c.endGreg, autoRenew: c.autoRenew, noticeDays: c.noticeDays, daysToRenew: c.daysToRenew, liability: c.facts.find(f => f.k === "liability")?.ve || "none", pdpl: c.facts.find(f => f.k === "pdpl")?.ve || "n/a", anomaly: c.anomaly_en || "none" }));
    const prompt = `You are Baseerah, a Saudi post-signature contract intelligence assistant. Portfolio JSON:\n${JSON.stringify(compact)}\n\nUser question: "${query}"\n\nReturn ONLY strict JSON, no markdown, no preamble:\n{"answer_ar":"one concise Arabic sentence","answer_en":"one concise English sentence","matchIds":["contract ids that match"]}`;
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] })
      });
      const data = await r.json();
      const text = (data.content || []).filter(x => x.type === "text").map(x => x.text).join("").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setLiveTag(true); setRes(parsed);
    } catch (e) {
      setLiveTag(false); setRes(fallback(query));
    }
    setBusy(false);
  };

  const matched = res ? CONTRACTS.filter(c => (res.matchIds || []).includes(c.id)) : [];

  return (
    <div>
      <div style={{ ...card, padding: 18 }} className="rise">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} color={t.accent} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>{L.ask}</span>
          <span className="flex items-center gap-1" style={{ fontSize: 10.5, color: liveTag ? t.high : t.textSoft, border: `1px solid ${t.border}`, borderRadius: 20, padding: "1px 8px" }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: liveTag ? t.high : t.med }} /> {liveTag ? L.live : "demo"}
          </span>
        </div>
        <div className="flex items-center gap-2 p-2" style={{ border: `1px solid ${t.border}`, borderRadius: 12, background: t.bg }}>
          <Search size={17} color={t.textSoft} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} placeholder={L.askPlaceholder}
            style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 14, fontFamily: "inherit" }} />
          <button onClick={() => run()} className="tap px-4 py-2" style={{ background: t.accent, color: t.onAccent, borderRadius: 9, fontWeight: 700, fontSize: 13, border: "none" }}>{L.ask}</button>
        </div>
        <div className="flex items-center gap-2 mt-3" style={{ flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => { setQ(s); run(s); }} className="tap px-3 py-1.5" style={{ fontSize: 12, color: t.textSoft, border: `1px solid ${t.border}`, borderRadius: 20, background: "transparent" }}>{s}</button>
          ))}
        </div>
      </div>

      {busy && <div className="flex items-center gap-2 mt-5" style={{ color: t.textSoft, fontSize: 13.5 }}><Sparkles size={16} className="rise" color={t.accent} /> {L.thinking}</div>}

      {res && !busy && (
        <div className="rise mt-5">
          <div className="flex items-start gap-2 p-3 mb-4" style={{ background: t.accentSoft, borderRadius: 12, fontSize: 13.5 }}>
            <Sparkles size={16} color={t.accent} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{lang === "ar" ? res.answer_ar : res.answer_en}</span>
          </div>
          <div style={{ fontSize: 12.5, color: t.textSoft, marginBottom: 10 }}>{L.matches} · {matched.length}</div>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
            {matched.map((c) => <ContractCard key={c.id} {...{ t, L, lang, cm, c, setActive, highlight: true }} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Review queue (human-in-the-loop) ---------- */
function Review({ t, L, lang, card, reviewItems, confirmed, setConfirmed, setActive }) {
  const pending = reviewItems.filter((r) => !confirmed[r.c.id + r.f.k]);
  return (
    <div>
      <div className="flex items-start gap-2 mb-4 p-3" style={{ background: t.lowBg, borderRadius: 12, fontSize: 13 }}>
        <Eye size={16} color={t.low} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>{lang === "ar" ? "قيم استخرجها الذكاء الاصطناعي بثقة منخفضة — تأكيدك يُحسّن دقة النظام." : "Low-confidence AI extractions — your confirmation improves the system's accuracy."}</span>
      </div>
      {pending.length === 0 && <div style={{ color: t.textSoft, fontSize: 14, padding: 20, textAlign: "center" }}>{L.noReview}</div>}
      {pending.map(({ c, f }) => (
        <div key={c.id + f.k} className="rise" style={{ ...card, padding: 16, marginBottom: 12 }}>
          <div className="flex items-center justify-between gap-2 mb-2" style={{ flexWrap: "wrap" }}>
            <button onClick={() => setActive(c)} className="tap" style={{ fontSize: 13.5, fontWeight: 700, color: t.text, background: "none", border: "none", cursor: "pointer", textAlign: "start" }}>
              {c.id} · {lang === "ar" ? c.title_ar : c.title_en}
            </button>
            <span style={{ fontSize: 11, color: t.low, background: t.lowBg, borderRadius: 20, padding: "2px 9px", fontWeight: 600 }}>{L.needsReview}</span>
          </div>
          <div style={{ fontSize: 13, color: t.text, marginBottom: 4 }}>{lang === "ar" ? f.va : f.ve}</div>
          <div style={{ fontSize: 12.5, color: t.textSoft, fontStyle: "italic", background: t.surfaceAlt, borderRadius: 10, padding: 10, marginBottom: 12 }}>{lang === "ar" ? f.sa : f.se}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfirmed({ ...confirmed, [c.id + f.k]: true })} className="tap px-4 py-2" style={{ background: t.accent, color: t.onAccent, borderRadius: 9, fontWeight: 700, fontSize: 13, border: "none" }}>{L.confirm}</button>
            <button onClick={() => setConfirmed({ ...confirmed, [c.id + f.k]: true })} className="tap px-4 py-2" style={{ background: "transparent", color: t.text, borderRadius: 9, fontWeight: 600, fontSize: 13, border: `1px solid ${t.border}` }}>{L.edit}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Contract drawer (HERO: source-linked confidence) ---------- */
function Drawer({ t, L, lang, cm, card, c, close, srcFact, setSrcFact }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: L.dir === "rtl" ? "flex-start" : "flex-end" }}>
      <div onClick={close} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(2px)" }} />
      <div className="rise" style={{ position: "relative", width: "min(560px,100%)", height: "100%", background: t.bg, borderInlineStart: `1px solid ${t.border}`, overflowY: "auto", boxShadow: t.shadow }}>
        <div className="flex items-center justify-between gap-2 px-5 py-4" style={{ position: "sticky", top: 0, background: t.bg + "f2", backdropFilter: "blur(8px)", borderBottom: `1px solid ${t.border}`, zIndex: 2 }}>
          <button onClick={close} className="tap flex items-center gap-1" style={{ fontSize: 13, color: t.textSoft, background: "none", border: "none", cursor: "pointer" }}>
            {L.dir === "rtl" ? <ChevronLeft size={16} style={{ transform: "scaleX(-1)" }} /> : <ArrowLeft size={16} />} {L.back}
          </button>
          <span style={{ fontSize: 12, color: t.textSoft }}>{c.id}</span>
        </div>

        <div className="px-5 py-5">
          <span style={{ fontSize: 11.5, color: t.textSoft, fontWeight: 600 }}>{L.types[c.type]}</span>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 2px", fontFamily: "'Amiri',serif" }}>{lang === "ar" ? c.title_ar : c.title_en}</h2>
          <div style={{ fontSize: 13.5, color: t.textSoft, marginBottom: 6 }}>{lang === "ar" ? c.party_ar : c.party_en}</div>
          <div className="flex items-center gap-3" style={{ fontSize: 12.5, color: t.textSoft, flexWrap: "wrap" }}>
            <span style={{ color: t.text, fontWeight: 700, fontFamily: "'Amiri',serif", fontSize: 16 }}>{c.valueSAR ? `${fmtSAR(c.valueSAR)} ر.س` : "—"}</span>
            <span>· {c.endHijri} {L.hijri}</span><span>· {c.endGreg} {L.greg}</span>
          </div>

          {c.anomaly_en && (
            <div className="flex items-start gap-2 mt-4 p-3" style={{ background: t.lowBg, borderRadius: 12, fontSize: 13, color: t.text }}>
              <AlertTriangle size={16} color={t.low} style={{ flexShrink: 0, marginTop: 1 }} />
              <span><b style={{ color: t.low }}>{L.riskFlag}:</b> {lang === "ar" ? c.anomaly_ar : c.anomaly_en}</span>
            </div>
          )}

          <div style={{ fontSize: 12.5, color: t.textSoft, margin: "18px 0 8px" }}>{lang === "ar" ? "القيم المستخرجة — اضغط أي قيمة لرؤية مصدرها" : "Extracted values — tap any to see its source"}</div>

          {c.facts.map((f, i) => {
            const m = cm[f.conf]; const open = srcFact === i;
            return (
              <div key={f.k} style={{ ...card, padding: 0, marginBottom: 10, overflow: "hidden" }}>
                <button onClick={() => setSrcFact(open ? null : i)} className="tap w-full text-start flex items-center justify-between gap-3" style={{ padding: 14, background: "transparent", border: "none", cursor: "pointer", textAlign: "start" }}>
                  <div>
                    <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 3 }}>{L[f.k] || f.k}</div>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>{lang === "ar" ? f.va : f.ve}</div>
                  </div>
                  <span className="flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 700, color: m.dot, background: m.bg, borderRadius: 20, padding: "3px 10px", flexShrink: 0 }}>
                    <m.Icon size={13} /> {m.label(lang)}
                  </span>
                </button>
                {open && (
                  <div className="rise" style={{ borderTop: `1px solid ${t.border}`, padding: 14, background: t.surfaceAlt }}>
                    <div className="flex items-center gap-1.5 mb-2" style={{ fontSize: 11.5, color: t.textSoft, fontWeight: 600 }}>
                      <FileText size={13} /> {L.source}
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.7, color: t.text, borderInlineStart: `3px solid ${m.dot}`, paddingInlineStart: 12 }}>
                      <mark style={{ background: m.bg, color: t.text, padding: "1px 2px", borderRadius: 3 }}>{lang === "ar" ? f.sa : f.se}</mark>
                    </div>
                    <div style={{ fontSize: 11.5, color: t.textSoft, marginTop: 10 }}>
                      {L.confidence}: <b style={{ color: m.dot }}>{f.conf === "high" ? (lang === "ar" ? "عالية" : "High") : f.conf === "medium" ? (lang === "ar" ? "متوسطة" : "Medium") : (lang === "ar" ? "منخفضة" : "Low")}</b>
                      {f.conf !== "high" && (lang === "ar" ? " — يُنصح بتأكيد بشري." : " — human confirmation recommended.")}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
