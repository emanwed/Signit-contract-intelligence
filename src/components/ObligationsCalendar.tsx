"use client";

import { useMemo } from "react";
import {
  CalendarClock,
  CreditCard,
  Mail,
  MessageSquare,
  Package,
  ShieldCheck,
  Umbrella,
  UserRound,
  BellRing,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { fmtGreg } from "@/lib/format";
import {
  alertTier,
  generateObligations,
  obTitle,
  type AlertTier,
  type Obligation,
  type ObligationCat,
} from "@/lib/obligations";
import type { Alert, AlertKind, AlertSeverity } from "@/lib/alerts";
import type { Lang } from "@/lib/types";

// Owner / manager display names — localised for Arabic screens.
const NAME_AR: Record<string, string> = {
  "Legal Team": "الفريق القانوني",
  Procurement: "المشتريات",
  Finance: "المالية",
  "Legal Ops Lead": "مدير العمليات القانونية",
  "Head of Procurement": "مدير المشتريات",
  "Finance Director": "المدير المالي",
};
const nameLabel = (n: string, lang: Lang) =>
  lang === "ar" ? NAME_AR[n] ?? n : n;

const CAT_ICON: Record<ObligationCat, LucideIcon> = {
  payment: CreditCard,
  deliverable: Package,
  compliance: ShieldCheck,
  notice: BellRing,
  insurance: Umbrella,
};
const CAT_TONE: Record<ObligationCat, string> = {
  payment: "var(--accent)",
  deliverable: "var(--med)",
  compliance: "var(--high)",
  notice: "var(--low)",
  insurance: "#8a4ce3",
};
const CAT_LABEL: Record<
  ObligationCat,
  "obPayment" | "obDeliverable" | "obCompliance" | "obNotice" | "obInsurance"
> = {
  payment: "obPayment",
  deliverable: "obDeliverable",
  compliance: "obCompliance",
  notice: "obNotice",
  insurance: "obInsurance",
};

// Each obligation opens the same action panel as a notification, so map its
// category to an alert kind (icon) and its tier to a severity (colour).
const CAT_KIND: Record<ObligationCat, AlertKind> = {
  payment: "review",
  deliverable: "review",
  compliance: "compliance",
  notice: "renewal",
  insurance: "review",
};

const TIER_ORDER: AlertTier[] = ["overdue", "d1", "d7", "d30", "later"];
const TIER_TONE: Record<AlertTier, string> = {
  overdue: "var(--low)",
  d1: "var(--low)",
  d7: "var(--med)",
  d30: "var(--med)",
  later: "var(--text-soft)",
};
const TIER_LABEL: Record<
  AlertTier,
  "tierOverdue" | "tierD1" | "tierD7" | "tierD30" | "tierLater"
> = {
  overdue: "tierOverdue",
  d1: "tierD1",
  d7: "tierD7",
  d30: "tierD30",
  later: "tierLater",
};

/**
 * Module 4 — the organisation-wide obligation calendar: every dated obligation
 * (payment / deliverable / compliance / notice / insurance) grouped by its alert
 * tier (30 / 7 / 1 day), with owner, notification channels and escalation.
 */
export function ObligationsCalendar({
  onOpenAlert,
}: {
  onOpenAlert: (a: Alert) => void;
}) {
  const { lang, L } = useApp();
  const { contracts } = useContracts();

  // Turn a dated obligation into an actionable task the AlertDetail panel can
  // open — with its own assignee, tags, comments, activity log and done state.
  const toAlert = (o: Obligation): Alert => {
    const tier = alertTier(o.daysLeft);
    const severity: AlertSeverity =
      tier === "overdue" || tier === "d1"
        ? "high"
        : tier === "d7" || tier === "d30"
          ? "medium"
          : "low";
    const c = contracts.find((x) => x.id === o.contractId);
    const cName = c ? (lang === "ar" ? c.title_ar : c.title_en) : "";
    return {
      id: `ob-${o.id}`,
      kind: CAT_KIND[o.cat],
      severity,
      title: obTitle(o, lang),
      body: [L[CAT_LABEL[o.cat]], cName, `${nameLabel(o.owner, lang)}`, fmtGreg(o.deadlineGreg, lang)]
        .filter(Boolean)
        .join(" · "),
      contractId: o.contractId,
    };
  };

  const obligations = useMemo(() => generateObligations(contracts), [contracts]);
  const byTier = useMemo(() => {
    const g: Record<AlertTier, Obligation[]> = {
      overdue: [],
      d1: [],
      d7: [],
      d30: [],
      later: [],
    };
    for (const o of obligations) g[alertTier(o.daysLeft)].push(o);
    return g;
  }, [obligations]);

  const contractOf = (id: string) => contracts.find((c) => c.id === id);

  return (
    <div className="max-w-[820px] mx-auto">
      <p style={{ fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 12 }}>
        {L.obIntro}
      </p>

      {/* Category legend */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {(Object.keys(CAT_ICON) as ObligationCat[]).map((cat) => {
          const Icon = CAT_ICON[cat];
          return (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                padding: "4px 10px",
              }}
            >
              <Icon size={13} color={CAT_TONE[cat]} />
              {L[CAT_LABEL[cat]]}
            </span>
          );
        })}
      </div>

      {obligations.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--text-soft)", padding: 24, textAlign: "center" }}>
          {L.obEmpty}
        </div>
      )}

      {TIER_ORDER.filter((t) => byTier[t].length > 0).map((tier) => (
        <div key={tier} className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span
              aria-hidden
              style={{ width: 9, height: 9, borderRadius: 9, background: TIER_TONE[tier] }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                color: TIER_TONE[tier],
              }}
            >
              {L[TIER_LABEL[tier]]}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 700 }}>
              · {byTier[tier].length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {byTier[tier].map((o) => {
              const c = contractOf(o.contractId);
              const Icon = CAT_ICON[o.cat];
              const tone = CAT_TONE[o.cat];
              return (
                <button
                  key={o.id}
                  onClick={() => onOpenAlert(toAlert(o))}
                  className="tap text-start w-full flex items-start gap-3 p-3.5"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `color-mix(in srgb, ${tone} 15%, transparent)`,
                    }}
                  >
                    <Icon size={17} color={tone} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>
                        {obTitle(o, lang)}
                      </span>
                      <span
                        className="whitespace-nowrap"
                        style={{ fontSize: 12, fontWeight: 700, color: TIER_TONE[tier] }}
                      >
                        {o.daysLeft < 0
                          ? `-${Math.abs(o.daysLeft)} ${L.daysLeft}`
                          : `${o.daysLeft} ${L.daysLeft}`}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-1.5"
                      style={{ fontSize: 12, color: "var(--text-soft)" }}
                    >
                      <span
                        className="inline-flex items-center gap-1"
                        style={{ fontWeight: 700, color: tone }}
                      >
                        {L[CAT_LABEL[o.cat]]}
                      </span>
                      {c && (
                        <span>
                          {c.id} · {lang === "ar" ? c.title_ar : c.title_en}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock size={12} /> {fmtGreg(o.deadlineGreg, lang)}
                      </span>
                    </div>
                    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap mt-2">
                      <span
                        className="inline-flex items-center gap-1"
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "var(--accent)",
                          background: "var(--accent-soft)",
                          borderRadius: 999,
                          padding: "2px 8px",
                        }}
                      >
                        <UserRound size={11} /> {nameLabel(o.owner, lang)}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{ fontSize: 11.5, color: "var(--text-soft)" }}
                        title={L.obAlertsVia}
                      >
                        <Mail size={13} />
                        <MessageSquare size={13} />
                      </span>
                      {(tier === "overdue" || tier === "d1") && (
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ fontSize: 11.5, fontWeight: 600, color: "var(--low)" }}
                        >
                          <ArrowUpRight size={12} /> {L.obEscalate} {nameLabel(o.manager, lang)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 4 }}>
        {L.obSimNote}
      </div>
    </div>
  );
}
