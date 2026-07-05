import type { AskAnswer, CompactContract, Contract, Lang, Risk } from "./types";

/** Group SAR digits with a plain thousands separator. */
export const fmtSAR = (n: number): string =>
  new Intl.NumberFormat("en-US").format(n);

/** Localised currency suffix — Arabic ر.س, English SAR. */
export const currencyLabel = (lang: Lang): string =>
  lang === "ar" ? "ر.س" : "SAR";

/** A formatted amount with its localised currency suffix, e.g. "840,000 SAR". */
export const money = (n: number, lang: Lang): string =>
  `${fmtSAR(n)} ${currencyLabel(lang)}`;

/**
 * Abbreviated amount for tight spaces (KPI cards): millions → "7.37M", large
 * thousands → "840K". Full precision stays in the contract detail view.
 */
export const moneyCompact = (n: number, lang: Lang): string => {
  const cur = currencyLabel(lang);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2)}M ${cur}`;
  }
  if (abs >= 10_000) return `${Math.round(n / 1000)}K ${cur}`;
  return money(n, lang);
};

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** Convert Western digits in a string to Arabic-Indic digits. */
export const toArabicDigits = (s: string): string =>
  s.replace(/\d/g, (d) => AR_DIGITS[+d]!);

/** Localise a date string's digits — Arabic-Indic in Arabic, unchanged in English. */
export const fmtDate = (s: string, lang: Lang): string =>
  lang === "ar" ? toArabicDigits(s) : s;

const AR_GREG = new Intl.DateTimeFormat("ar-u-ca-gregory-nu-arab", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Format a Gregorian ISO date (YYYY-MM-DD) for display. In Arabic it reads
 * naturally as "٢٠ يوليو ٢٠٢٥" (day, month name, year) — avoiding the reversed
 * look of a digit-only string in RTL. English keeps the ISO form.
 */
export function fmtGreg(iso: string, lang: Lang): string {
  if (!iso || iso === "—") return iso;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return lang === "ar" ? toArabicDigits(iso) : iso;
  if (lang !== "ar") return iso;
  return AR_GREG.format(new Date(+m[1], +m[2] - 1, +m[3]));
}

/** CSS variable for an overall risk rating (green low → red high). */
export const riskVar = (risk: Risk): string =>
  risk === "high"
    ? "var(--low)"
    : risk === "medium"
      ? "var(--med)"
      : "var(--high)";

/**
 * "Below policy" liability cap heuristic — a cap under SAR 1M. Kept as a shared
 * constant so the Overview KPI, the filter chip, and the local Ask fallback all
 * agree on which contracts qualify.
 */
export const LOW_CAP_RE = /400|500/;

export const hasLowLiabilityCap = (c: Contract): boolean =>
  c.facts.some((f) => f.k === "liability" && LOW_CAP_RE.test(f.ve));

/** Compact projection of a contract for the /api/ask prompt. */
export const toCompact = (c: Contract): CompactContract => ({
  id: c.id,
  title: c.title_en,
  party: c.party_en,
  type: c.type,
  valueSAR: c.valueSAR,
  endGreg: c.endGreg,
  autoRenew: c.autoRenew,
  noticeDays: c.noticeDays,
  daysToRenew: c.daysToRenew,
  liability: c.facts.find((f) => f.k === "liability")?.ve || "none",
  pdpl: c.facts.find((f) => f.k === "pdpl")?.ve || "n/a",
  anomaly: c.anomaly_en || "none",
});

export const buildPortfolio = (contracts: Contract[]): CompactContract[] =>
  contracts.map(toCompact);

/**
 * Local keyword-matching fallback for "Ask Signit". Runs when the live
 * /api/ask route is unavailable so the demo never visibly breaks. Ported from
 * reference/baseerah.jsx, and extended to also match Franco-Arabic (Arabizi —
 * Arabic typed in Latin letters/numbers, e.g. "mas2ouleya", "tajdeed",
 * "bayanat") so the offline path accepts the same questions the live AI does.
 */
export function localFallback(
  question: string,
  contracts: Contract[],
): AskAnswer {
  const s = question.toLowerCase();
  const pick = (pred: (c: Contract) => boolean) =>
    contracts.filter(pred).map((c) => c.id);
  const has = (c: Contract, k: string) => c.facts.some((f) => f.k === k);

  // Intent rules, most-specific first. First rule that both matches the text and
  // yields at least one contract wins. Each covers Arabic, English & Franco-Arabic.
  const rules: { re: RegExp; ar: string; en: string; ids: () => string[] }[] = [
    {
      re: /cap|liab|1m|million|مسؤول|مليون|سقف|mas2ou|masou|mas2oo|masoo|mas2ol|masol|sa2f|saqf|milyon|milion|melion/,
      ar: "عقود بسقف مسؤولية أقل من مليون ريال — دون سياسة الحد الأدنى.",
      en: "Contracts with a liability cap below SAR 1M — under the minimum-risk policy.",
      ids: () => contracts.filter(hasLowLiabilityCap).map((c) => c.id),
    },
    {
      re: /breach|deviat|below.?playbook|non.?standard|anomal|policy|شذوذ|تخالف|مخالف|انحراف|سياسة/,
      ar: "عقود تخالف السياسة أو بها شذوذ يحتاج مراجعة.",
      en: "Contracts that breach policy or carry an anomaly to review.",
      ids: () => pick((c) => !!c.anomaly_en),
    },
    {
      re: /data|privacy|pdpl|بيانات|خصوص|حماية|bayan|7imaya|himaya|hemaya|khosos|5osos|khusus/,
      ar: "عقود بها معالجة بيانات تحتاج مراجعة امتثال.",
      en: "Contracts with data processing that need a compliance review.",
      ids: () => pick((c) => has(c, "pdpl")),
    },
    {
      re: /high.?risk|risky|عالية المخاطر|أعلى المخاطر|خطورة عالية|3ali|risk\b/,
      ar: "العقود عالية المخاطر في محفظتك.",
      en: "The high-risk contracts in your portfolio.",
      ids: () => pick((c) => c.risk === "high"),
    },
    {
      re: /obligation|overdue|payment|deliver|invoice|التزام|مستحق|دفع|تسليم|فاتورة|موعد نهائي/,
      ar: "عقود عليها التزامات أو مواعيد مستحقة قريبًا.",
      en: "Contracts with obligations or deadlines coming due.",
      ids: () => pick((c) => c.daysToRenew <= 90),
    },
    {
      re: /renew|auto|90|٩٠|تجديد|تجدد|تلقائي|expir|انتهاء|تنتهي|tajd|tagd|tejd/,
      ar: "عقود تتجدد أو تنتهي خلال ٩٠ يومًا.",
      en: "Contracts renewing or expiring within 90 days.",
      ids: () => pick((c) => c.daysToRenew <= 90),
    },
    {
      re: /\bip\b|intellect|ملكية|فكري|proprietary|work.?for.?hire|براءة|melkeya|fekr/,
      ar: "عقود بها بنود ملكية فكرية.",
      en: "Contracts with intellectual-property clauses.",
      ids: () => pick((c) => has(c, "ip")),
    },
    {
      re: /jurisdic|govern|arbitr|قانون|اختصاص|تحكيم|نظام حاكم|qanoon|2anoon/,
      ar: "العقود وقانونها الحاكم — غالبًا أنظمة المملكة.",
      en: "Contracts and their governing law — mostly KSA.",
      ids: () => pick((c) => has(c, "law")),
    },
    {
      re: /value|expensive|highest|largest|أعلى قيمة|أغلى|أكبر قيمة|قيمة/,
      ar: "أعلى العقود قيمة في محفظتك.",
      en: "Your highest-value contracts.",
      ids: () =>
        [...contracts]
          .sort((a, b) => b.valueSAR - a.valueSAR)
          .slice(0, 4)
          .map((c) => c.id),
    },
    {
      re: /attention|priority|urgent|انتباه|يحتاج|أولوية|مهم|عاجل/,
      ar: "ما يحتاج انتباهك: مخاطر عالية أو مواعيد قريبة أو شذوذ.",
      en: "What needs your attention: high risk, near deadlines, or anomalies.",
      ids: () =>
        pick((c) => c.risk === "high" || !!c.anomaly_en || c.daysToRenew <= 90),
    },
  ];

  for (const r of rules) {
    if (r.re.test(s)) {
      const matchIds = r.ids();
      if (matchIds.length) return { answer_ar: r.ar, answer_en: r.en, matchIds };
    }
  }

  // Contract-type lookup ("show me the NDAs / licences").
  const typeMap: [RegExp, Contract["type"]][] = [
    [/nda|سري|سرية|non.?disclosure/, "nda"],
    [/licen|ترخيص|رخصة/, "licence"],
    [/employ|عمل|توظيف|موظف/, "employment"],
    [/\bsow\b|statement of work|بيان عمل/, "sow"],
    [/\bmsa\b|master service|إطارية/, "msa"],
    [/\bpo\b|purchase order|أمر شراء|توريد/, "po"],
    [/lease|إيجار|عقار/, "lease"],
  ];
  for (const [re, t] of typeMap) {
    if (re.test(s)) {
      const matchIds = pick((c) => c.type === t);
      if (matchIds.length)
        return {
          answer_ar: "عقود من هذا النوع في محفظتك.",
          answer_en: "Contracts of this type in your portfolio.",
          matchIds,
        };
    }
  }

  return {
    answer_ar: "إليك أقرب النتائج من محفظتك.",
    answer_en: "Here are the closest matches from your portfolio.",
    matchIds: contracts.slice(0, 3).map((c) => c.id),
  };
}

/** Days from today until a Gregorian end date (YYYY-MM-DD). */
export function daysUntil(endGreg: string): number {
  const end = new Date(endGreg + "T00:00:00");
  if (Number.isNaN(end.getTime())) return 0;
  const now = new Date();
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}
