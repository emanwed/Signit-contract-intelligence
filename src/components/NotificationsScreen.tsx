"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronRight,
  Eye,
  ScrollText,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationsContext";
import {
  ALERT_KINDS,
  buildAlerts,
  type Alert,
  type AlertKind,
  type AlertSeverity,
} from "@/lib/alerts";
import { FilterChip } from "./FilterChip";

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
const ASSIGNEE_AR: Record<string, string> = {
  "Legal Team": "الفريق القانوني",
  Procurement: "المشتريات",
  Finance: "المالية",
  "Eman Wed": "إيمان ود",
};

type Stream = "all" | AlertKind;
const STREAM_LABEL: Record<
  AlertKind,
  "streamRenewals" | "streamVerify" | "streamCompliance" | "streamAnomaly"
> = {
  renewal: "streamRenewals",
  review: "streamVerify",
  compliance: "streamCompliance",
  anomaly: "streamAnomaly",
};

/**
 * The Action Center (Contract Intelligence): one workboard for everything that
 * needs a human — renewals, verifications, compliance and anomalies — grouped by
 * stream, with a progress summary. Each item opens its action detail (assignee,
 * comments, done, activity). Notification preferences live in their own tab.
 */
export function NotificationsScreen({
  onOpenAlert,
}: {
  onOpenAlert: (a: Alert) => void;
}) {
  const { lang, L } = useApp();
  const { contracts } = useContracts();
  const { checks, alertPrefs } = useSettings();
  const { getState, unreadCount, markAllRead } = useNotifications();
  const [stream, setStream] = useState<Stream>("all");

  const alerts = useMemo(
    () => buildAlerts(contracts, checks, alertPrefs, lang),
    [contracts, checks, alertPrefs, lang],
  );
  const alertIds = useMemo(() => alerts.map((a) => a.id), [alerts]);
  const unread = unreadCount(alertIds);

  const counts = useMemo(() => {
    const c: Record<AlertKind, number> = {
      renewal: 0,
      compliance: 0,
      anomaly: 0,
      review: 0,
    };
    for (const a of alerts) c[a.kind]++;
    return c;
  }, [alerts]);

  const total = alerts.length;
  const doneCount = alerts.filter((a) => getState(a.id).done).length;
  const openCount = total - doneCount;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  // Open items first, then done — with the selected stream applied.
  const filtered = alerts
    .filter((a) => stream === "all" || a.kind === stream)
    .sort(
      (a, b) => Number(getState(a.id).done) - Number(getState(b.id).done),
    );

  return (
    <div className="max-w-[760px] mx-auto">
      {/* Progress summary — how much is handled across all streams */}
      <div
        className="flex items-center justify-between gap-3 mb-3 p-3.5"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
        }}
      >
        <div className="min-w-0 flex-1">
          <div style={{ fontSize: 14 }}>
            <b style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
              {openCount}
            </b>{" "}
            <span style={{ color: "var(--text-soft)" }}>{L.acNeedAction}</span>
            <span style={{ color: "var(--text-soft)" }}>
              {" "}
              · {doneCount} {L.acDone}
            </span>
          </div>
          <div
            className="mt-2"
            style={{ background: "var(--surface-alt)", borderRadius: 6, height: 6 }}
          >
            <div
              style={{
                width: `${pct}%`,
                background: "var(--high)",
                height: 6,
                borderRadius: 6,
                transition: "width .4s",
              }}
            />
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllRead(alertIds)}
            className="tap shrink-0"
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}
          >
            {L.notifMarkAllRead}
          </button>
        )}
      </div>

      {/* Stream segments */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <FilterChip on={stream === "all"} onClick={() => setStream("all")}>
          {L.fltAll} · {total}
        </FilterChip>
        {ALERT_KINDS.filter((k) => counts[k] > 0).map((k) => (
          <FilterChip key={k} on={stream === k} onClick={() => setStream(k)}>
            {L[STREAM_LABEL[k]]} · {counts[k]}
          </FilterChip>
        ))}
      </div>

      {/* Action list */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center gap-2"
            style={{ padding: "34px 24px", color: "var(--text-soft)" }}
          >
            <Check size={22} color="var(--high)" />
            <span style={{ fontSize: 13 }}>{L.acAllClear}</span>
          </div>
        ) : (
          filtered.map((a) => (
            <ActionRow
              key={a.id}
              alert={a}
              onOpen={() => onOpenAlert(a)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ActionRow({ alert, onOpen }: { alert: Alert; onOpen: () => void }) {
  const { lang, L } = useApp();
  const { getState } = useNotifications();
  const st = getState(alert.id);
  const Icon = KIND_ICON[alert.kind];
  const color = SEV_COLOR[alert.severity];

  return (
    <button
      onClick={onOpen}
      className="tap w-full flex items-start gap-2.5 px-3.5 py-3 text-start"
      style={{
        borderBottom: "1px solid var(--border)",
        background: st.read ? "transparent" : "color-mix(in srgb, var(--accent) 6%, transparent)",
      }}
    >
      <span
        aria-hidden
        className="shrink-0"
        style={{
          width: 7,
          height: 7,
          borderRadius: 7,
          marginTop: 14,
          background: st.read ? "transparent" : "var(--low)",
        }}
      />
      <span
        className="flex items-center justify-center shrink-0"
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: `color-mix(in srgb, ${color} 16%, transparent)`,
        }}
      >
        <Icon size={16} color={color} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="flex items-center gap-2"
          style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: st.done ? "var(--text-soft)" : "var(--text)",
            textDecoration: st.done ? "line-through" : "none",
          }}
        >
          {st.done && <Check size={14} color="var(--high)" className="shrink-0" />}
          <span className="truncate">{alert.title}</span>
        </span>
        <span
          className="block"
          style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5, marginTop: 2 }}
        >
          {alert.body}
        </span>
        {(st.assignee || st.tags.length > 0) && (
          <span className="flex items-center gap-1.5 flex-wrap mt-2">
            {st.assignee && (
              <span
                className="inline-flex items-center gap-1"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "var(--accent-soft)",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                <UserRound size={11} />
                {lang === "ar" ? ASSIGNEE_AR[st.assignee] ?? st.assignee : st.assignee}
              </span>
            )}
            {st.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-soft)",
                  background: "var(--surface-alt)",
                  borderRadius: 999,
                  padding: "2px 8px",
                }}
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </span>
      <ChevronRight
        size={16}
        color="var(--text-soft)"
        className="rtl-flip shrink-0"
        style={{ marginTop: 8 }}
      />
      <span className="sr-only">{L.taskViewContract}</span>
    </button>
  );
}
