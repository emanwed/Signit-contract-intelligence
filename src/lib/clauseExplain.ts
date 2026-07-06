import {
  POLICY,
  liabilityCap,
  underPreferredLaw,
  type Checks,
} from "./playbook";
import { money } from "./format";
import type { Contract, Fact, Lang } from "./types";

/** ok = matches the playbook · flag = deviates / needs attention · info = neutral. */
export type ClauseVerdict = "ok" | "flag" | "info";

export interface ClauseExplanation {
  kind: ClauseKind;
  /** Short label for the detected clause type. */
  title: { ar: string; en: string };
  /** Plain-language, non-lawyer explanation of what the clause does. */
  plain: { ar: string; en: string };
  /** How it compares to the company playbook / KSA norms. */
  standard: { verdict: ClauseVerdict; ar: string; en: string };
  /** Why a non-lawyer should care. */
  why: { ar: string; en: string };
  /** The extracted fact this selection overlapped, if any (for confidence). */
  matchedFact?: Fact;
}

export type ClauseKind =
  | "liability"
  | "renewal"
  | "ip"
  | "pdpl"
  | "penalty"
  | "law"
  | "payment"
  | "term"
  | "general";

const KIND_LABEL: Record<ClauseKind, { ar: string; en: string }> = {
  liability: { ar: "المسؤولية والتعويض", en: "Liability & indemnity" },
  renewal: { ar: "التجديد والإنهاء", en: "Renewal & termination" },
  ip: { ar: "الملكية الفكرية", en: "Intellectual property" },
  pdpl: { ar: "حماية البيانات (PDPL)", en: "Data protection (PDPL)" },
  penalty: { ar: "الغرامات", en: "Penalties" },
  law: { ar: "القانون الحاكم والاختصاص", en: "Governing law & jurisdiction" },
  payment: { ar: "المقابل المالي والدفع", en: "Consideration & payment" },
  term: { ar: "مدة العقد", en: "Term" },
  general: { ar: "بند تعاقدي", en: "Contract clause" },
};

// Keyword detection (Arabic + English), most-specific first.
const KIND_RULES: { kind: ClauseKind; re: RegExp }[] = [
  { kind: "liability", re: /liabilit|indemnif|\bcap\b|مسؤولي|تعويض|سقف/i },
  { kind: "renewal", re: /renew|auto-?renew|notice|terminat|expir|تجديد|تلقائ|إشعار|إنهاء|تنتهي/i },
  { kind: "ip", re: /intellectual|ownership|work.?for.?hire|proprietary|ملكي|فكري|براءة/i },
  { kind: "pdpl", re: /\bdata\b|privacy|personal|process|pdpl|بيانات|خصوص|معالج|شخصي/i },
  { kind: "penalty", re: /penalt|\bfine\b|late|liquidated|غرام|تأخير|جزائ/i },
  { kind: "law", re: /govern|jurisdic|arbitr|dispute|\blaw\b|قانون|اختصاص|تحكيم|نزاع|أنظمة المملكة/i },
  { kind: "payment", re: /\bpay|invoic|\bfee|price|amount|installment|دفع|فاتور|رسوم|قيمة|سداد|أجرة/i },
  { kind: "term", re: /\bterm\b|duration|period|effective|commenc|مدة|سريان|تبدأ|تسري/i },
];

const FACT_TO_KIND: Partial<Record<Fact["k"], ClauseKind>> = {
  liability: "liability",
  renewal: "renewal",
  term: "term",
  ip: "ip",
  pdpl: "pdpl",
  penalty: "penalty",
  law: "law",
  value: "payment",
};

const norm = (s: string) =>
  s.replace(/[«»"“”\s]+/g, " ").trim().toLowerCase();

/** Did the user's selection overlap this fact's source clause (either way)? */
function overlaps(selected: string, factClause: string): boolean {
  const a = norm(selected);
  const b = norm(factClause);
  if (a.length < 6 || b.length < 6) return false;
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;
  // Match if the shorter string (or a solid chunk of it) sits inside the longer.
  return long.includes(short) || long.includes(short.slice(0, Math.min(40, short.length)));
}

/**
 * Explain a highlighted clause for a non-lawyer: what it means, whether it
 * matches the company playbook / KSA norms, and why it matters. Prefers the
 * AI-extracted fact the selection overlaps (so it carries real confidence);
 * otherwise classifies the text by keyword. Deterministic — always returns
 * something sensible even for an ambiguous selection.
 */
export function explainClause(
  selected: string,
  c: Contract,
  checks: Checks,
): ClauseExplanation {
  const matchedFact = c.facts.find(
    (f) => overlaps(selected, f.sa) || overlaps(selected, f.se),
  );
  const kind: ClauseKind = matchedFact
    ? FACT_TO_KIND[matchedFact.k] ?? classify(selected)
    : classify(selected);

  return {
    kind,
    title: KIND_LABEL[kind],
    matchedFact,
    ...buildBody(kind, c, checks),
  };
}

function classify(text: string): ClauseKind {
  for (const r of KIND_RULES) if (r.re.test(text)) return r.kind;
  return "general";
}

function ok(ar: string, en: string) {
  return { verdict: "ok" as const, ar, en };
}
function flag(ar: string, en: string) {
  return { verdict: "flag" as const, ar, en };
}
function info(ar: string, en: string) {
  return { verdict: "info" as const, ar, en };
}

function buildBody(
  kind: ClauseKind,
  c: Contract,
  checks: Checks,
): Pick<ClauseExplanation, "plain" | "standard" | "why"> {
  switch (kind) {
    case "liability": {
      const cap = liabilityCap(c);
      const standard =
        cap === null
          ? flag(
              "لا يحدّد سقفًا رقميًا للمسؤولية — دون سياسة الدليل.",
              "No numeric liability cap — below your playbook.",
            )
          : cap < POLICY.minLiabilityCap
            ? flag(
                `السقف (${money(cap, "ar")}) دون الحد الأدنى في الدليل (مليون ر.س).`,
                `The cap (${money(cap, "en")}) is below your playbook floor (SAR 1M).`,
              )
            : ok(
                `السقف (${money(cap, "ar")}) يستوفي الحد الأدنى في الدليل.`,
                `The cap (${money(cap, "en")}) meets your playbook floor.`,
              );
      return {
        plain: {
          ar: "يحدّ هذا البند من المبلغ الذي يتحمّله الطرف عند وقوع ضرر أو إخلال بالعقد.",
          en: "This clause limits how much a party pays if something goes wrong or the contract is breached.",
        },
        standard,
        why: {
          ar: "سقف منخفض يعني أنك تتحمّل أي خسائر تتجاوزه — وقد تفوق قيمة العقد نفسها.",
          en: "A low cap means you absorb any losses above it — which can exceed the contract's own value.",
        },
      };
    }
    case "renewal": {
      const standard =
        c.autoRenew && c.noticeDays > 0 && c.noticeDays < POLICY.minRenewalNoticeDays
          ? flag(
              `نافذة الإشعار (${c.noticeDays} يومًا) أقصر من الحد الأدنى في دليلكم (${POLICY.minRenewalNoticeDays} يومًا).`,
              `The notice window (${c.noticeDays} days) is shorter than your playbook minimum (${POLICY.minRenewalNoticeDays} days).`,
            )
          : c.autoRenew
            ? info(
                `يتجدّد تلقائيًا ما لم تُخطِر قبل ${c.noticeDays} يومًا من الانتهاء.`,
                `Auto-renews unless you give notice ${c.noticeDays} days before end.`,
              )
            : info(
                "لا يتجدّد تلقائيًا — ينتهي في نهاية مدته.",
                "Does not auto-renew — it ends at its term.",
              );
      return {
        plain: {
          ar: "يحدّد كيف ومتى يتجدّد العقد، والمهلة المطلوبة لإخطار الطرف الآخر إن أردت عدم التجديد.",
          en: "Defines how and when the contract renews, and the notice you must give to stop it.",
        },
        standard,
        why: {
          ar: "إن فاتتك نافذة الإشعار، تُلزَم بمدة جديدة كاملة دون فرصة لإعادة التفاوض.",
          en: "Miss the notice window and you're locked into a full new term with no chance to renegotiate.",
        },
      };
    }
    case "ip":
      return {
        plain: {
          ar: "يحدّد من يملك المخرجات والحقوق الفكرية الناتجة عن العقد.",
          en: "Defines who owns the deliverables and any intellectual property the work produces.",
        },
        standard: info(
          "تأكّد أن الملكية تؤول إليكم عند السداد الكامل، لا أن تبقى للمزوّد.",
          "Confirm ownership passes to you on full payment, rather than staying with the vendor.",
        ),
        why: {
          ar: "غموض الملكية الفكرية قد يمنعك لاحقًا من استخدام أو نقل ما دفعت مقابله.",
          en: "Ambiguous IP terms can later stop you from using or transferring what you paid for.",
        },
      };
    case "pdpl": {
      const p = c.facts.find((f) => f.k === "pdpl");
      const offshore =
        p && /خارج|الخارج|overseas|off-?shore|equivalent|ما يعادل|غير واضح|unclear/i.test(
          `${p.sa} ${p.se} ${p.va} ${p.ve}`,
        );
      const standard = offshore
        ? flag(
            "يُلمّح إلى معالجة بيانات خارج المملكة أو دون توطين واضح — مخاطرة PDPL.",
            "Hints at off-shore or unclear data residency — a PDPL exposure.",
          )
        : p && p.conf === "high"
          ? ok(
              "بند معالجة بيانات واضح ومتوافق مع توطين البيانات.",
              "Clear data-processing clause, aligned with data residency.",
            )
          : flag(
              "بند معالجة بيانات غير مؤكّد — يحتاج مراجعة امتثال PDPL.",
              "Unconfirmed data-processing clause — needs a PDPL review.",
            );
      return {
        plain: {
          ar: "يحكم كيفية معالجة البيانات الشخصية ومكان تخزينها أثناء تنفيذ العقد.",
          en: "Governs how personal data is processed and where it's stored under the contract.",
        },
        standard,
        why: {
          ar: "معالجة البيانات دون أساس نظامي أو خارج المملكة قد تخالف نظام حماية البيانات (PDPL) وتُعرّضك لغرامات.",
          en: "Processing data without a legal basis or off-shore can breach the PDPL and expose you to fines.",
        },
      };
    }
    case "penalty":
      return {
        plain: {
          ar: "يحدّد الغرامات المستحقة عند التأخير في التسليم أو الدفع أو الإخلال بالالتزامات.",
          en: "Sets the penalties owed for late delivery, late payment, or breach of obligations.",
        },
        standard: info(
          "تأكّد أن نسبة الغرامة وسقفها محددان بوضوح ومتوائمان مع الفوترة الإلكترونية (ZATCA).",
          "Confirm the penalty rate and ceiling are clearly defined and ZATCA-aligned.",
        ),
        why: {
          ar: "غرامات غامضة تصعُب المطالبة بها عند التأخّر — أو قد تُستخدم ضدّك.",
          en: "Vague penalties are hard to enforce when the other side slips — or can be used against you.",
        },
      };
    case "law": {
      const standard = underPreferredLaw(c)
        ? ok(
            "يخضع لأنظمة المملكة — ضمن الاختصاص المفضّل.",
            "Governed by KSA law — within your preferred jurisdiction.",
          )
        : flag(
            "خارج الاختصاص المفضّل (أنظمة المملكة العربية السعودية).",
            "Outside your preferred jurisdiction (laws of Saudi Arabia).",
          );
      return {
        plain: {
          ar: "يحدّد القانون الحاكم للعقد والجهة المختصة بالفصل في أي نزاع.",
          en: "Defines the law that governs the contract and where disputes are resolved.",
        },
        standard,
        why: {
          ar: "اختصاص خارج المملكة يرفع كلفة ووقت التقاضي كثيرًا عند حدوث نزاع.",
          en: "A foreign jurisdiction sharply raises the cost and time of litigating a dispute.",
        },
      };
    }
    case "payment":
      return {
        plain: {
          ar: "يحدّد المقابل المالي وجدول الدفعات وشروط استحقاقها.",
          en: "Sets the price, the payment schedule, and when payments fall due.",
        },
        standard: info(
          `القيمة التعاقدية: ${c.valueSAR ? money(c.valueSAR, "ar") : "غير محددة"}. تأكّد من مواءمة الفوترة مع ZATCA.`,
          `Contract value: ${c.valueSAR ? money(c.valueSAR, "en") : "unspecified"}. Confirm invoicing is ZATCA-aligned.`,
        ),
        why: {
          ar: "شروط دفع غير واضحة تربك التدفق النقدي وقد تُخفي زيادات أو غرامات لاحقة.",
          en: "Unclear payment terms disrupt cash flow and can hide later escalations or penalties.",
        },
      };
    case "term":
      return {
        plain: {
          ar: "يحدّد متى يبدأ العقد ومتى ينتهي، والمدة التي تلتزم بها.",
          en: "Defines when the contract starts and ends, and the period you're committed for.",
        },
        standard: info(
          `ينتهي في ${c.endGreg}${c.autoRenew ? " مع تجديد تلقائي" : ""}.`,
          `Ends ${c.endGreg}${c.autoRenew ? " with auto-renewal" : ""}.`,
        ),
        why: {
          ar: "المدة تحدّد نافذة التزامك المالي — وترتبط مباشرة بموعد إشعار التجديد.",
          en: "The term sets your financial commitment window — and drives the renewal-notice deadline.",
        },
      };
    default:
      return {
        plain: {
          ar: "يحدّد هذا البند التزامًا أو حقًّا بين الطرفين ضمن العقد.",
          en: "This clause sets out an obligation or right between the parties.",
        },
        standard: info(
          "لم نصنّف هذا البند ضمن الفئات المراقَبة — راجعه يدويًا إن كان جوهريًا.",
          "Not one of the monitored clause types — review manually if it's material.",
        ),
        why: {
          ar: "البنود غير القياسية تستحق قراءة بشرية قبل الاعتماد.",
          en: "Non-standard clauses deserve a human read before you rely on them.",
        },
      };
  }
}
