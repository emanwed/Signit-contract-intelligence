"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronLeft,
  Eye,
  FileText,
  Plus,
  ScrollText,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import {
  ASSIGNEES,
  SUGGESTED_TAGS_AR,
  SUGGESTED_TAGS_EN,
  useNotifications,
  type ActivityKind,
} from "@/context/NotificationsContext";
import type { Alert, AlertKind, AlertSeverity } from "@/lib/alerts";
import type { Contract, Lang } from "@/lib/types";

const KIND_ICON: Record<AlertKind, typeof AlertTriangle> = {
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
const ASSIGNEE_AR: Record<string, string> = {
  "Legal Team": "الفريق القانوني",
  Procurement: "المشتريات",
  Finance: "المالية",
  "Eman Wed": "إيمان ود",
};
const assigneeLabel = (a: string, lang: Lang) =>
  lang === "ar" ? ASSIGNEE_AR[a] ?? a : a;

// @mentions — match "@" + any assignee's Arabic or English name, and highlight.
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MENTION_LABELS = ASSIGNEES.flatMap((n) => [ASSIGNEE_AR[n] ?? n, n]);
const MENTION_RE = new RegExp("@(?:" + MENTION_LABELS.map(esc).join("|") + ")", "g");

function renderComment(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  MENTION_RE.lastIndex = 0;
  while ((m = MENTION_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span key={m.index} style={{ color: "var(--accent)", fontWeight: 700 }}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

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
  const { lang, L, dir } = useApp();
  const { contracts } = useContracts();
  const {
    getState,
    markRead,
    toggleDone,
    setAssignee,
    addTag,
    removeTag,
    addComment,
  } = useNotifications();

  const st = getState(alert.id);
  const [tagInput, setTagInput] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    markRead(alert.id);
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
  const Icon = KIND_ICON[alert.kind];
  const color = SEV_COLOR[alert.severity];
  const suggested = lang === "ar" ? SUGGESTED_TAGS_AR : SUGGESTED_TAGS_EN;

  const submitTag = () => {
    const t = tagInput.trim();
    if (t) {
      addTag(alert.id, t);
      setTagInput("");
    }
  };
  const submitComment = () => {
    const t = comment.trim();
    if (t) {
      addComment(alert.id, t);
      setComment("");
    }
  };
  const insertMention = (name: string) => {
    const token = "@" + assigneeLabel(name, lang) + " ";
    setComment((v) => (v.trim() ? v.replace(/\s*$/, "") + " " : "") + token);
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
    };
    return map[kind];
  };

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
          <button
            onClick={() => toggleDone(alert.id)}
            className="tap flex items-center gap-1.5"
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: st.done ? "var(--high)" : "var(--on-accent)",
              background: st.done ? "var(--high-bg)" : "var(--grad-primary)",
              border: st.done ? "1px solid var(--high)" : "none",
              borderRadius: 9,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            <Check size={14} /> {st.done ? L.taskDone : L.taskMarkDone}
          </button>
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
              <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6, marginTop: 3 }}>
                {alert.body}
              </p>
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

          {/* Assignee */}
          <Section title={L.taskAssignee} icon={UserRound}>
            <select
              value={st.assignee ?? ""}
              onChange={(e) => setAssignee(alert.id, e.target.value || null)}
              className="w-full"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
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
          </Section>

          {/* Tags */}
          <Section title={L.taskTags} icon={Plus}>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {st.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    borderRadius: 999,
                    padding: "3px 5px 3px 10px",
                  }}
                >
                  {t}
                  <button
                    onClick={() => removeTag(alert.id, t)}
                    aria-label="remove"
                    className="tap flex items-center"
                    style={{ color: "var(--accent)" }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {suggested
                .filter((t) => !st.tags.includes(t))
                .map((t) => (
                  <button
                    key={t}
                    onClick={() => addTag(alert.id, t)}
                    className="tap"
                    style={{
                      fontSize: 11.5,
                      color: "var(--text-soft)",
                      background: "var(--surface)",
                      border: "1px dashed var(--border)",
                      borderRadius: 999,
                      padding: "3px 9px",
                    }}
                  >
                    + {t}
                  </button>
                ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitTag()}
              placeholder={L.taskAddTag}
              className="w-full"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 9,
                padding: "8px 10px",
                fontSize: 12.5,
                color: "var(--text)",
                fontFamily: "inherit",
              }}
            />
          </Section>

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
                    {renderComment(cm.text)}
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
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span style={{ fontSize: 11, color: "var(--text-soft)" }}>
                {lang === "ar" ? "أشِر إلى:" : "Mention:"}
              </span>
              {ASSIGNEES.map((n) => (
                <button
                  key={n}
                  onClick={() => insertMention(n)}
                  className="tap"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    padding: "2px 9px",
                  }}
                >
                  @{assigneeLabel(n, lang)}
                </button>
              ))}
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
                        {a.value ? ` ${assigneeLabel(a.value, lang)}` : ""}
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
