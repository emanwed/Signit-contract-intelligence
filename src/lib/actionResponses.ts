import type { Lang } from "./types";

/**
 * Response groups — the "what happened" a company can log against an action in
 * the Action Center. Obligation categories and header-alert kinds both map onto
 * these, so every action gets a relevant set of outcomes.
 */
export type ResponseGroup =
  | "renewal"
  | "notice"
  | "payment"
  | "deliverable"
  | "compliance"
  | "insurance"
  | "review"
  | "anomaly";

export type ResponseTone = "high" | "med" | "low" | "accent";

export interface ActionResponse {
  key: string;
  ar: string;
  en: string;
  /** Colour of the outcome badge. */
  tone: ResponseTone;
  /** The next periodic action the system schedules + how insights update. */
  nextAr: string;
  nextEn: string;
}

/**
 * For each action, the outcomes a company can log. Selecting one records what
 * was done so the system can schedule the next periodic action for the active
 * contract and update the portfolio insights accordingly.
 */
export const RESPONSES: Record<ResponseGroup, ActionResponse[]> = {
  renewal: [
    {
      key: "renew",
      ar: "التجديد والاستمرار",
      en: "Renew & continue",
      tone: "high",
      nextAr: "يُنشأ تذكير المراجعة قبل التجديد القادم، ويبقى العقد ضمن الالتزامات النشطة في المؤشرات.",
      nextEn: "A pre-renewal review reminder is scheduled and the contract stays in active commitments.",
    },
    {
      key: "renegotiate",
      ar: "إعادة التفاوض قبل التجديد",
      en: "Renegotiate before renewal",
      tone: "accent",
      nextAr: "يُفتح مسار تفاوض ويُنشأ إجراء متابعة قبل الموعد النهائي بأسبوعين.",
      nextEn: "A negotiation track opens with a follow-up two weeks before the deadline.",
    },
    {
      key: "not_renew",
      ar: "عدم التجديد / الإنهاء",
      en: "Do not renew / terminate",
      tone: "low",
      nextAr: "تتوقّف تذكيرات التجديد وتُحدَّث المؤشرات لاستبعاد قيمة هذا العقد من الالتزامات.",
      nextEn: "Renewal reminders stop and insights update to exclude this contract's value.",
    },
    {
      key: "defer",
      ar: "تأجيل القرار",
      en: "Defer decision",
      tone: "med",
      nextAr: "يُعاد عرض الإجراء بعد ٧ أيام لاتخاذ القرار.",
      nextEn: "The action re-surfaces in 7 days for a decision.",
    },
  ],
  notice: [
    {
      key: "sent",
      ar: "تم إرسال إشعار عدم التجديد",
      en: "Non-renewal notice sent",
      tone: "low",
      nextAr: "يُنشأ إجراء تسليم/إنهاء، وتُحدَّث المؤشرات لإنهاء العقد في نهاية مدته.",
      nextEn: "A handover/termination action is created; insights mark the contract ending at term.",
    },
    {
      key: "continue",
      ar: "الاستمرار بالعقد (لن يُرسل إشعار)",
      en: "Continue contract (no notice)",
      tone: "high",
      nextAr: "يُلغى الإشعار ويُجدوَل تذكير التجديد القادم؛ يبقى العقد نشطًا في المؤشرات.",
      nextEn: "The notice is cancelled and the next renewal reminder is scheduled; stays active.",
    },
    {
      key: "legal_review",
      ar: "قيد المراجعة القانونية",
      en: "Under legal review",
      tone: "med",
      nextAr: "يُسنَد للفريق القانوني ويُنشأ إجراء متابعة خلال ٣ أيام.",
      nextEn: "Assigned to Legal with a 3-day follow-up action.",
    },
  ],
  payment: [
    {
      key: "paid",
      ar: "تم السداد",
      en: "Paid",
      tone: "high",
      nextAr: "يُسجَّل الدفع ويُجدوَل موعد الدفعة القادمة، وتُخصم من المستحقات في المؤشرات.",
      nextEn: "Payment recorded, the next installment is scheduled, and dues drop in insights.",
    },
    {
      key: "invoiced",
      ar: "صدرت الفاتورة، بانتظار الدفع",
      en: "Invoiced, awaiting payment",
      tone: "med",
      nextAr: "يُنشأ إجراء متابعة تحصيل بعد صافي ٣٠ يومًا.",
      nextEn: "A collection follow-up is created after net-30.",
    },
    {
      key: "disputed",
      ar: "متنازع عليها / معلّقة",
      en: "Disputed / on hold",
      tone: "low",
      nextAr: "يُصعَّد للمالية وتُدرَج القيمة ضمن المبالغ المعلّقة في المؤشرات.",
      nextEn: "Escalated to Finance; the amount is flagged as on-hold in insights.",
    },
  ],
  deliverable: [
    {
      key: "accepted",
      ar: "تم التسليم والقبول",
      en: "Delivered & accepted",
      tone: "high",
      nextAr: "تُغلق المرحلة ويُنشأ إجراء المرحلة التالية إن وُجدت.",
      nextEn: "The milestone closes and the next milestone action is created if any.",
    },
    {
      key: "pending_review",
      ar: "تم التسليم، بانتظار المراجعة",
      en: "Delivered, pending review",
      tone: "med",
      nextAr: "يُنشأ إجراء مراجعة قبول خلال ٥ أيام.",
      nextEn: "An acceptance-review action is created within 5 days.",
    },
    {
      key: "late",
      ar: "متأخر — تم إخطار المورّد",
      en: "Late — vendor notified",
      tone: "low",
      nextAr: "يُصعَّد للمدير ويُحتسب ضمن الالتزامات المتأخرة في المؤشرات.",
      nextEn: "Escalated to the manager and counted in overdue obligations.",
    },
  ],
  compliance: [
    {
      key: "filed",
      ar: "تم التقديم / مستوفٍ",
      en: "Filed / compliant",
      tone: "high",
      nextAr: "يُجدوَل إجراء الامتثال الدوري القادم ويتحسّن مؤشر الامتثال.",
      nextEn: "The next periodic compliance action is scheduled; compliance posture improves.",
    },
    {
      key: "in_progress",
      ar: "قيد الإعداد",
      en: "In progress",
      tone: "med",
      nextAr: "يُنشأ إجراء متابعة قبل الموعد النهائي.",
      nextEn: "A follow-up action is created before the deadline.",
    },
    {
      key: "non_compliant",
      ar: "غير مطابق — يتطلب معالجة",
      en: "Non-compliant — needs remediation",
      tone: "low",
      nextAr: "يُفتح إجراء معالجة ويُخفَّض مؤشر الامتثال حتى الإغلاق.",
      nextEn: "A remediation action opens; compliance posture drops until closed.",
    },
  ],
  insurance: [
    {
      key: "renewed",
      ar: "تم تجديد وثيقة التأمين",
      en: "Insurance renewed",
      tone: "high",
      nextAr: "تُحدَّث صلاحية الوثيقة ويُجدوَل تذكير التجديد القادم.",
      nextEn: "Policy validity updates and the next renewal reminder is scheduled.",
    },
    {
      key: "awaiting_cert",
      ar: "بانتظار شهادة التأمين",
      en: "Awaiting certificate",
      tone: "med",
      nextAr: "يُنشأ إجراء متابعة لاستلام الشهادة خلال ٧ أيام.",
      nextEn: "A follow-up to collect the certificate is created within 7 days.",
    },
    {
      key: "expired",
      ar: "منتهية — متابعة عاجلة",
      en: "Expired — urgent follow-up",
      tone: "low",
      nextAr: "يُصعَّد فورًا ويُدرَج ضمن فجوات التغطية في المؤشرات.",
      nextEn: "Escalated immediately; flagged as a coverage gap in insights.",
    },
  ],
  review: [
    {
      key: "approved",
      ar: "تمت المراجعة والاعتماد",
      en: "Reviewed & approved",
      tone: "high",
      nextAr: "تُعتمد القيم وتُرفع دقة الاستخراج في المؤشرات.",
      nextEn: "Values are confirmed and extraction accuracy rises in insights.",
    },
    {
      key: "correction",
      ar: "يتطلب تصحيحًا",
      en: "Needs correction",
      tone: "med",
      nextAr: "يُنشأ إجراء تصحيح للحقول منخفضة الثقة.",
      nextEn: "A correction action is created for the low-confidence fields.",
    },
    {
      key: "escalate_legal",
      ar: "تم التصعيد للقانوني",
      en: "Escalated to Legal",
      tone: "low",
      nextAr: "يُسنَد للفريق القانوني للمراجعة النهائية.",
      nextEn: "Assigned to Legal for final review.",
    },
  ],
  anomaly: [
    {
      key: "resolved",
      ar: "تمت المعالجة",
      en: "Resolved",
      tone: "high",
      nextAr: "يُغلق التعارض وتُحدَّث مؤشرات المخاطر.",
      nextEn: "The anomaly closes and risk insights update.",
    },
    {
      key: "accepted_risk",
      ar: "قُبل الخطر (موثّق)",
      en: "Risk accepted (documented)",
      tone: "med",
      nextAr: "يُوثَّق قبول الخطر ويبقى مرئيًا في سجل المخاطر.",
      nextEn: "The accepted risk is documented and stays visible in the risk register.",
    },
    {
      key: "escalate",
      ar: "تم التصعيد للإدارة",
      en: "Escalated to management",
      tone: "low",
      nextAr: "يُصعَّد لاتخاذ قرار ويبقى ضمن المخاطر العالية.",
      nextEn: "Escalated for a decision; remains among high risks.",
    },
  ],
};

export const RESPONSE_TONE_VAR: Record<ResponseTone, string> = {
  high: "var(--high)",
  med: "var(--med)",
  low: "var(--low)",
  accent: "var(--accent)",
};

export function findResponse(
  group: ResponseGroup | undefined,
  key: string | undefined,
): ActionResponse | null {
  if (!group || !key) return null;
  return RESPONSES[group]?.find((r) => r.key === key) ?? null;
}

export const responseLabel = (r: ActionResponse, lang: Lang) =>
  lang === "ar" ? r.ar : r.en;
export const responseNext = (r: ActionResponse, lang: Lang) =>
  lang === "ar" ? r.nextAr : r.nextEn;
