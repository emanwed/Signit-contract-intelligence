"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CreditCard,
  Eye,
  Lock,
  Package,
  RefreshCw,
  ShieldCheck,
  Umbrella,
  UserRound,
  BellRing,
  X,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { ASSIGNEES, useNotifications } from "@/context/NotificationsContext";
import {
  RESPONSE_TONE_VAR,
  findResponse,
  responseLabel,
} from "@/lib/actionResponses";
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
import type { Lang, Persona } from "@/lib/types";

// Owner / manager display names — localised for Arabic screens.
const NAME_AR: Record<string, string> = {
  "Legal Team": "الفريق القانوني",
  Procurement: "المشتريات",
  Finance: "المالية",
  "Legal Ops Lead": "مدير العمليات القانونية",
  "Head of Procurement": "مدير المشتريات",
  "Finance Director": "المدير المالي",
  HR: "الموارد البشرية",
  IT: "تقنية المعلومات",
  Operations: "العمليات",
  "HR Director": "مدير الموارد البشرية",
  "IT Director": "مدير تقنية المعلومات",
  "Operations Lead": "مدير العمليات",
  "Eman Wed": "إيمان ود",
};
const nameLabel = (n: string, lang: Lang) =>
  lang === "ar" ? NAME_AR[n] ?? n : n;

const CAT_ICON: Record<ObligationCat, LucideIcon> = {
  renewal: RefreshCw,
  payment: CreditCard,
  deliverable: Package,
  compliance: ShieldCheck,
  notice: BellRing,
  insurance: Umbrella,
  review: Eye,
};
const CAT_TONE: Record<ObligationCat, string> = {
  renewal: "var(--med)",
  payment: "var(--accent)",
  deliverable: "var(--med)",
  compliance: "var(--high)",
  notice: "var(--low)",
  insurance: "#8a4ce3",
  review: "var(--accent)",
};
const CAT_LABEL: Record<
  ObligationCat,
  | "obRenewal"
  | "obPayment"
  | "obDeliverable"
  | "obCompliance"
  | "obNotice"
  | "obInsurance"
  | "obReview"
> = {
  renewal: "obRenewal",
  payment: "obPayment",
  deliverable: "obDeliverable",
  compliance: "obCompliance",
  notice: "obNotice",
  insurance: "obInsurance",
  review: "obReview",
};

// Each obligation opens the same action panel as a notification, so map its
// category to an alert kind (icon) and its tier to a severity (colour).
const CAT_KIND: Record<ObligationCat, AlertKind> = {
  renewal: "renewal",
  payment: "review",
  deliverable: "review",
  compliance: "compliance",
  notice: "renewal",
  insurance: "review",
  review: "review",
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
  persona,
  onOpenAlert,
}: {
  persona: Persona;
  onOpenAlert: (a: Alert) => void;
}) {
  const { lang, L, plan, setUpgradeOpen } = useApp();
  const isPro = plan === "paid";
  const ar = lang === "ar";
  const { contracts } = useContracts();
  const { getState } = useNotifications();

  // The team currently responsible for an obligation — its owner, unless it's
  // been reassigned in the action panel.
  const assigneeOf = (o: Obligation) =>
    getState(`ob-${o.id}`).assignee ?? o.owner;

  // Each lens scopes the list: Procurement/Legal see only their own actions;
  // the Executive lens sees everything (and gets the team filter).
  const personaTeam =
    persona === "proc" ? "Procurement" : persona === "legal" ? "Legal Team" : null;
  const showTeamFilter = isPro && persona === "exec";

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
      assignee: o.owner,
      responseGroup: o.cat,
      categoryLabel: L[CAT_LABEL[o.cat]],
      dateLabel: fmtGreg(o.deadlineGreg, lang),
    };
  };

  // Category filter — click a legend chip to show only that category's
  // obligations, keeping the same tier grouping (overdue / 7 / 30 days).
  const [catFilter, setCatFilter] = useState<ObligationCat | null>(null);
  // Team filter (Pro) — narrow the list to a responsible team.
  const [teamFilter, setTeamFilter] = useState<string | null>(null);

  const obligations = useMemo(() => generateObligations(contracts), [contracts]);
  const filtered = useMemo(
    () =>
      obligations.filter((o) => {
        if (catFilter && o.cat !== catFilter) return false;
        // Lens scope — Procurement/Legal only see their own actions.
        if (personaTeam && assigneeOf(o) !== personaTeam) return false;
        // Executive-only manual team filter.
        if (showTeamFilter && teamFilter && assigneeOf(o) !== teamFilter) return false;
        return true;
      }),
    // getState drives assigneeOf; re-run when assignments change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [obligations, catFilter, teamFilter, personaTeam, showTeamFilter, getState],
  );
  const byTier = useMemo(() => {
    const g: Record<AlertTier, Obligation[]> = {
      overdue: [],
      d1: [],
      d7: [],
      d30: [],
      later: [],
    };
    for (const o of filtered) g[alertTier(o.daysLeft)].push(o);
    return g;
  }, [filtered]);

  const contractOf = (id: string) => contracts.find((c) => c.id === id);

  // Free plan only sees near-term actions (overdue / within 7 days); the 30-day
  // and later tiers are a Pro feature.
  const FREE_TIERS: AlertTier[] = ["overdue", "d1", "d7"];
  const visibleTiers = TIER_ORDER.filter(
    (t) => byTier[t].length > 0 && (isPro || FREE_TIERS.includes(t)),
  );
  const lockedCount = isPro ? 0 : byTier.d30.length + byTier.later.length;

  return (
    <div className="max-w-[820px] mx-auto">
      <p style={{ fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 12 }}>
        {L.obIntro}
      </p>

      {/* Category filter — tap a chip to filter the list by that category */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {(Object.keys(CAT_ICON) as ObligationCat[]).map((cat) => {
          const Icon = CAT_ICON[cat];
          const on = catFilter === cat;
          const tone = CAT_TONE[cat];
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(on ? null : cat)}
              aria-pressed={on}
              className="tap inline-flex items-center gap-1.5"
              style={{
                fontSize: 12,
                fontWeight: on ? 700 : 600,
                color: on ? tone : "var(--text)",
                background: on
                  ? `color-mix(in srgb, ${tone} 15%, transparent)`
                  : "var(--surface)",
                border: `1px solid ${on ? tone : "var(--border)"}`,
                borderRadius: 999,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              <Icon size={13} color={tone} />
              {L[CAT_LABEL[cat]]}
            </button>
          );
        })}
        {catFilter && (
          <button
            onClick={() => setCatFilter(null)}
            className="tap inline-flex items-center gap-1"
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: "var(--text-soft)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={12} /> {L.reset}
          </button>
        )}
      </div>

      {/* Team filter — Executive lens only (assignment is a Pro feature) */}
      {showTeamFilter && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-soft)" }}>
            {lang === "ar" ? "الفريق المسؤول" : "Responsible team"}
          </span>
          <div
            className="relative inline-flex items-center gap-1"
            style={{
              border: `1px solid ${teamFilter ? "var(--accent)" : "var(--border)"}`,
              background: teamFilter ? "var(--accent-soft)" : "var(--surface)",
              borderRadius: 999,
              paddingInline: 10,
              height: 32,
            }}
          >
            <UserRound size={13} color={teamFilter ? "var(--accent)" : "var(--text-soft)"} />
            <select
              value={teamFilter ?? ""}
              onChange={(e) => setTeamFilter(e.target.value || null)}
              className="appearance-none bg-transparent"
              style={{
                border: "none",
                outline: "none",
                fontSize: 12.5,
                fontWeight: 600,
                color: teamFilter ? "var(--accent)" : "var(--text)",
                fontFamily: "inherit",
                cursor: "pointer",
                paddingInlineEnd: 4,
              }}
            >
              <option value="">{lang === "ar" ? "كل الفرق" : "All teams"}</option>
              {ASSIGNEES.map((a) => (
                <option key={a} value={a}>
                  {nameLabel(a, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ fontSize: 14, color: "var(--text-soft)", padding: 24, textAlign: "center" }}>
          {L.obEmpty}
        </div>
      )}

      {visibleTiers.map((tier) => (
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
              const st = getState(`ob-${o.id}`);
              const outcome = findResponse(o.cat, st.outcome?.key ?? undefined);
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
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: st.done ? "var(--text-soft)" : "var(--text)",
                          textDecoration: st.done ? "line-through" : "none",
                        }}
                      >
                        {obTitle(o, lang)}
                      </span>
                      {outcome ? (
                        <span
                          className="whitespace-nowrap inline-flex items-center gap-1"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: RESPONSE_TONE_VAR[outcome.tone],
                            background: `color-mix(in srgb, ${RESPONSE_TONE_VAR[outcome.tone]} 15%, transparent)`,
                            borderRadius: 999,
                            padding: "2px 9px",
                          }}
                        >
                          <Check size={11} /> {responseLabel(outcome, lang)}
                        </span>
                      ) : (
                        <span
                          className="whitespace-nowrap"
                          style={{ fontSize: 12, fontWeight: 700, color: TIER_TONE[tier] }}
                        >
                          {o.daysLeft < 0
                            ? `-${Math.abs(o.daysLeft)} ${L.daysLeft}`
                            : `${o.daysLeft} ${L.daysLeft}`}
                        </span>
                      )}
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
                    {isPro && (
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
                          <UserRound size={11} /> {nameLabel(st.assignee ?? o.owner, lang)}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Pro gate — the 30-day and later tiers are Pro-only on Free */}
      {lockedCount > 0 && (
        <button
          onClick={() => setUpgradeOpen(true)}
          className="tap w-full flex items-start gap-2 mb-4 p-3.5 text-start"
          style={{
            background: "var(--accent-soft)",
            border: "1px dashed var(--accent)",
            borderRadius: 14,
            color: "var(--accent)",
          }}
        >
          <Lock size={16} className="shrink-0" style={{ marginTop: 1 }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.6 }}>
            {ar
              ? `${lockedCount} إجراء إضافي ضمن «خلال ٣٠ يومًا» و«لاحقًا» — متاحة في الخطة الاحترافية. الخطة المجانية تعرض المتأخر وخلال ٧ أيام فقط.`
              : `${lockedCount} more actions in "within 30 days" & "later" — available on Pro. The Free plan shows overdue and within-7-days only.`}
          </span>
        </button>
      )}

      <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 4 }}>
        {L.obSimNote}
      </div>
    </div>
  );
}
