"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  CalendarClock,
  Check,
  ChevronLeft,
  CreditCard,
  Eye,
  FileText,
  ListChecks,
  Lock,
  Package,
  Pencil,
  RefreshCw,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Umbrella,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import {
  ASSIGNEES,
  useNotifications,
  type ActivityKind,
} from "@/context/NotificationsContext";
import type { Alert, AlertKind, AlertSeverity } from "@/lib/alerts";
import {
  RESPONSES,
  RESPONSE_TONE_VAR,
  findResponse,
  responseLabel,
  responseNext,
  type ResponseGroup,
} from "@/lib/actionResponses";
import type { Contract, Lang } from "@/lib/types";

const KIND_ICON: Record<AlertKind, LucideIcon> = {
  renewal: CalendarClock,
  compliance: ScrollText,
  anomaly: AlertTriangle,
  review: Eye,
};
const SEV_COLOR: Record<AlertSeverity, string> = {
  high: "var(--high)",
  medium: "var(--med)",
  low: "var(--low)",
};

// Icon + tone per action category — mirrors the list card exactly so the
// detail header matches the card it was opened from.
const CATEGORY_STYLE: Record<ResponseGroup, { Icon: LucideIcon; tone: string }> = {
  renewal: { Icon: RefreshCw, tone: "var(--med)" },
  notice: { Icon: BellRing, tone: "var(--low)" },
  payment: { Icon: CreditCard, tone: "var(--accent)" },
  deliverable: { Icon: Package, tone: "var(--med)" },
  compliance: { Icon: ShieldCheck, tone: "var(--high)" },
  insurance: { Icon: Umbrella, tone: "#8a4ce3" },
  review: { Icon: Eye, tone: "var(--accent)" },
  anomaly: { Icon: AlertTriangle, tone: "var(--med)" },
};
const ASSIGNEE_AR: Record<string, string> = {
  "Legal Team": "الفريق القانوني",
  Procurement: "المشتريات",
  Finance: "المالية",
  HR: "الموارد البشرية",
  IT: "تقنية المعلومات",
  Operations: "العمليات",
  "Eman Wed": "إيمان ود",
};
const assigneeLabel = (a: string, lang: Lang) =>
  lang === "ar" ? ASSIGNEE_AR[a] ?? a : a;

function timeAgo(at: number, lang: Lang): string {
  const s = Math.floor((Date.now() - at) / 1000);
  if (s < 60) return lang === "ar" ? "الآن" : "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return lang === "ar" ? `قبل ${m} د` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "ar" ? `قبل ${h} س` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return lang === "ar" ? `قبل ${d} ي` : `${d}d ago`;
}

/**
 * Action detail for a notification: assign to a person/team, tag it, comment,
 * mark it done, and see the full activity log. Opening it marks it read.
 */
export function AlertDetail({
  alert,
  onClose,
  onOpenContract,
}: {
  alert: Alert;
  onClose: () => void;
  onOpenContract: (c: Contract) => void;
}) {
  const { lang, L, dir, plan, setUpgradeOpen } = useApp();
  const isPro = plan === "paid";
  const { contracts } = useContracts();
  const { getState, markRead, toggleDone, resolveWithOutcome, setAssignee, addComment } =
    useNotifications();

  const st = getState(alert.id);
  const [comment, setComment] = useState("");

  // The team shows as a chip; editing reveals a picker, and reassigning is
  // confirmed (not instant).
  const committedAssignee = st.assignee ?? alert.assignee ?? "";
  const [pendingAssignee, setPendingAssignee] = useState(committedAssignee);
  const [editingAssignee, setEditingAssignee] = useState(false);

  useEffect(() => {
    markRead(alert.id);
    setPendingAssignee(st.assignee ?? alert.assignee ?? "");
    setEditingAssignee(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.id, markRead]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const contract = useMemo(
    () => contracts.find((c) => c.id === alert.contractId),
    [contracts, alert.contractId],
  );
  // Match the list card: use the category icon + tone when known, else fall
  // back to the alert kind/severity (header-bell alerts).
  const catStyle = alert.responseGroup ? CATEGORY_STYLE[alert.responseGroup] : null;
  const Icon = catStyle ? catStyle.Icon : KIND_ICON[alert.kind];
  const color = catStyle ? catStyle.tone : SEV_COLOR[alert.severity];

  const submitComment = () => {
    const t = comment.trim();
    if (t) {
      addComment(alert.id, t);
      setComment("");
    }
  };
  const actText = (kind: ActivityKind): string => {
    const map: Record<ActivityKind, string> = {
      done: L.actDone,
      reopen: L.actReopen,
      assigned: L.actAssigned,
      unassigned: L.actUnassigned,
      tag_add: L.actTagAdd,
      tag_remove: L.actTagRemove,
      comment: L.actComment,
      outcome: L.actOutcome,
    };
    return map[kind];
  };

  // Outcome activity carries "group:key" — resolve it to a localised label.
  const activityValue = (a: { kind: ActivityKind; value?: string }): string => {
    if (a.kind === "outcome" && a.value) {
      const [group, key] = a.value.split(":");
      const r = findResponse(group as never, key);
      return r ? responseLabel(r, lang) : a.value;
    }
    return a.value ? assigneeLabel(a.value, lang) : "";
  };

  const group = alert.responseGroup;
  const responses = group ? RESPONSES[group] : [];
  const chosen = findResponse(group as never, st.outcome?.key);

  return (
    <div
      className="fixed inset-0 z-[65] flex"
      style={{ justifyContent: dir === "rtl" ? "flex-start" : "flex-end" }}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,.45)",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        className="rise scroll-slim"
        style={{
          position: "relative",
          width: "min(480px,100%)",
          height: "100%",
          background: "var(--bg)",
          borderInlineStart: "1px solid var(--border)",
          overflowY: "auto",
          boxShadow: "var(--shadow)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-2 px-5 py-4 sticky top-0 z-[2]"
          style={{
            background: "color-mix(in srgb, var(--bg) 95%, transparent)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={onClose}
            className="tap flex items-center gap-1"
            style={{ fontSize: 13, color: "var(--text-soft)", background: "none", border: "none", cursor: "pointer" }}
          >
            {dir === "rtl" ? (
              <ChevronLeft size={16} style={{ transform: "scaleX(-1)" }} />
            ) : (
              <ArrowLeft size={16} />
            )}{" "}
            {L.back}
          </button>
          {st.done && (
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--high)",
                background: "var(--high-bg)",
                border: "1px solid var(--high)",
                borderRadius: 9,
                padding: "6px 12px",
              }}
            >
              <Check size={14} /> {L.taskDone}
            </span>
          )}
        </div>

        <div className="px-5 py-5" style={{ flex: 1 }}>
          {/* Alert summary */}
          <div className="flex items-start gap-2.5">
            <span
              className="flex items-center justify-center shrink-0"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: `color-mix(in srgb, ${color} 16%, transparent)`,
              }}
            >
              <Icon size={17} color={color} />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  textDecoration: st.done ? "line-through" : "none",
                  color: st.done ? "var(--text-soft)" : "var(--text)",
                }}
              >
                {alert.title}
              </h2>
              {alert.categoryLabel ? (
                <div
                  className="flex items-center gap-x-2.5 gap-y-1 flex-wrap mt-1.5"
                  style={{ fontSize: 12, color: "var(--text-soft)" }}
                >
                  <span style={{ fontWeight: 700, color }}>{alert.categoryLabel}</span>
                  {contract && (
                    <span>
                      {contract.id} · {lang === "ar" ? contract.title_ar : contract.title_en}
                    </span>
                  )}
                  {alert.dateLabel && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={12} /> {alert.dateLabel}
                    </span>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, marginTop: 3 }}>
                  {alert.body}
                </p>
              )}
            </div>
          </div>

          {contract && (
            <button
              onClick={() => onOpenContract(contract)}
              className="tap flex items-center gap-1.5 mt-3"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--accent)",
                background: "var(--accent-soft)",
                border: "1px solid var(--border)",
                borderRadius: 9,
                padding: "7px 12px",
              }}
            >
              <FileText size={14} /> {L.taskViewContract} · {contract.id}
            </button>
          )}

          {/* Assignee — team assignment is a Pro feature; reassigning is
              confirmed before it takes effect */}
          <Section title={L.taskAssignee} icon={UserRound}>
            {!isPro ? (
              <button
                onClick={() => setUpgradeOpen(true)}
                className="tap w-full flex items-start gap-2 p-3 text-start"
                style={{
                  background: "var(--accent-soft)",
                  border: "1px dashed var(--accent)",
                  borderRadius: 12,
                  color: "var(--accent)",
                }}
              >
                <Lock size={15} className="shrink-0" style={{ marginTop: 1 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.5 }}>
                  {lang === "ar"
                    ? "إسناد الإجراءات إلى الفرق متاح في الخطة الاحترافية."
                    : "Assigning actions to teams is a Pro feature."}
                </span>
              </button>
            ) : !editingAssignee ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    borderRadius: 999,
                    padding: "5px 12px",
                  }}
                >
                  <UserRound size={13} />
                  {committedAssignee ? assigneeLabel(committedAssignee, lang) : L.taskUnassigned}
                </span>
                <button
                  onClick={() => setEditingAssignee(true)}
                  className="tap inline-flex items-center gap-1"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-soft)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={12} /> {lang === "ar" ? "تغيير" : "Change"}
                </button>
              </div>
            ) : (
              <>
                <select
                  value={pendingAssignee}
                  onChange={(e) => setPendingAssignee(e.target.value)}
                  className="w-full"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${pendingAssignee !== committedAssignee ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 9,
                    padding: "9px 10px",
                    fontSize: 13,
                    color: "var(--text)",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="">{L.taskUnassigned}</option>
                  {ASSIGNEES.map((a) => (
                    <option key={a} value={a}>
                      {assigneeLabel(a, lang)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <button
                    onClick={() => {
                      setAssignee(alert.id, pendingAssignee || null);
                      setEditingAssignee(false);
                    }}
                    disabled={pendingAssignee === committedAssignee}
                    className="tap inline-flex items-center gap-1.5"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "var(--on-accent)",
                      background: "var(--grad-primary)",
                      border: "none",
                      borderRadius: 9,
                      padding: "6px 14px",
                      cursor: "pointer",
                      opacity: pendingAssignee === committedAssignee ? 0.5 : 1,
                    }}
                  >
                    <Check size={13} /> {lang === "ar" ? "تأكيد" : "Confirm"}
                  </button>
                  <button
                    onClick={() => {
                      setPendingAssignee(committedAssignee);
                      setEditingAssignee(false);
                    }}
                    className="tap"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--text-soft)",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 9,
                      padding: "6px 14px",
                      cursor: "pointer",
                    }}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </>
            )}
          </Section>

          {/* Action taken — log the outcome so the system schedules the next
              periodic action and updates the insights. */}
          {responses.length > 0 && (
            <Section title={L.taskOutcome} icon={ListChecks}>
              <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5, marginBottom: 10 }}>
                {L.taskOutcomePrompt}
              </div>
              <div className="flex flex-col gap-2">
                {responses.map((r) => {
                  const on = st.outcome?.key === r.key;
                  const tone = RESPONSE_TONE_VAR[r.tone];
                  return (
                    <button
                      key={r.key}
                      onClick={() =>
                        on
                          ? toggleDone(alert.id)
                          : resolveWithOutcome(alert.id, group as string, r.key)
                      }
                      aria-pressed={on}
                      className="tap flex items-center gap-3 text-start"
                      style={{
                        borderRadius: 12,
                        padding: "11px 13px",
                        fontSize: 13.5,
                        fontWeight: on ? 600 : 500,
                        color: "var(--text)",
                        background: on
                          ? `color-mix(in srgb, ${tone} 7%, var(--surface))`
                          : "var(--surface)",
                        border: `1px solid ${on ? `color-mix(in srgb, ${tone} 45%, var(--border))` : "var(--border)"}`,
                        boxShadow: "var(--shadow)",
                        transition: "background .15s, border-color .15s",
                      }}
                    >
                      <span
                        aria-hidden
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 19,
                          height: 19,
                          borderRadius: 999,
                          background: on ? tone : "transparent",
                          border: `1.5px solid ${on ? tone : "var(--border)"}`,
                          color: "var(--on-accent)",
                          transition: "background .15s, border-color .15s",
                        }}
                      >
                        {on && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className="flex-1">{responseLabel(r, lang)}</span>
                    </button>
                  );
                })}
              </div>

              {chosen && (
                <div
                  className="rise flex items-start gap-3 mt-4 p-4"
                  style={{
                    background:
                      "linear-gradient(155deg, var(--accent-soft) 0%, color-mix(in srgb, var(--accent) 9%, var(--surface)) 100%)",
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, var(--border))",
                    borderRadius: 16,
                    boxShadow: "var(--shadow)",
                  }}
                >
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "var(--accent)",
                      color: "var(--on-accent)",
                      boxShadow: "0 2px 6px color-mix(in srgb, var(--accent) 45%, transparent)",
                    }}
                  >
                    <Sparkles size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="inline-flex items-center gap-1.5"
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "var(--accent)",
                        letterSpacing: 0.4,
                        textTransform: "uppercase",
                      }}
                    >
                      {L.taskNextStep}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7, marginTop: 4 }}>
                      {responseNext(chosen, lang)}
                    </div>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Comments */}
          <Section title={L.taskComments} icon={FileText}>
            <div className="flex flex-col gap-2 mb-2">
              {st.comments.length === 0 && (
                <div style={{ fontSize: 12.5, color: "var(--text-soft)" }}>
                  {L.taskNoComments}
                </div>
              )}
              {st.comments.map((cm) => (
                <div
                  key={cm.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "8px 10px",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span style={{ fontSize: 12, fontWeight: 700 }}>
                      {assigneeLabel(cm.author, lang)}
                    </span>
                    <span style={{ fontSize: 10.5, color: "var(--text-soft)" }}>
                      {timeAgo(cm.at, lang)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.6 }}>
                    {cm.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  if (e.altKey) {
                    // Alt+Enter → insert a newline at the cursor (draft, not sent).
                    e.preventDefault();
                    const ta = e.currentTarget;
                    const s = ta.selectionStart;
                    const end = ta.selectionEnd;
                    setComment((v) => v.slice(0, s) + "\n" + v.slice(end));
                    requestAnimationFrame(() => {
                      ta.selectionStart = ta.selectionEnd = s + 1;
                    });
                  } else if (!e.shiftKey) {
                    // Enter → send the comment.
                    e.preventDefault();
                    submitComment();
                  }
                }}
                placeholder={L.taskAddComment}
                rows={2}
                className="flex-1"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  padding: "8px 10px",
                  fontSize: 12.5,
                  color: "var(--text)",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
              <button
                onClick={submitComment}
                disabled={!comment.trim()}
                className="tap flex items-center justify-center shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: "var(--grad-primary)",
                  color: "var(--on-accent)",
                  border: "none",
                  opacity: comment.trim() ? 1 : 0.5,
                }}
                aria-label={L.taskSend}
              >
                <Send size={16} className="rtl-flip" />
              </button>
            </div>
          </Section>

          {/* Activity log */}
          <Section title={L.taskActivity} icon={ScrollText}>
            {st.activity.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--text-soft)" }}>
                {L.taskNoActivity}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {st.activity.map((a) => (
                  <div key={a.id} className="flex items-start gap-2">
                    <span
                      aria-hidden
                      className="shrink-0"
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 7,
                        background: "var(--accent)",
                        marginTop: 5,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div style={{ fontSize: 12.5, color: "var(--text)", lineHeight: 1.5 }}>
                        <b style={{ fontWeight: 700 }}>{assigneeLabel(a.author, lang)}</b>{" "}
                        {actText(a.kind)}
                        {activityValue(a) ? ` ${activityValue(a)}` : ""}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--text-soft)", marginTop: 1 }}>
                        {timeAgo(a.at, lang)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <div
        className="flex items-center gap-1.5 mb-2"
        style={{ fontSize: 12, fontWeight: 700, color: "var(--text-soft)" }}
      >
        <Icon size={14} /> {title}
      </div>
      {children}
    </div>
  );
}
