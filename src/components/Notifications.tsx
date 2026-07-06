"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Eye,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationsContext";
import {
  buildAlerts,
  type Alert,
  type AlertKind,
  type AlertSeverity,
} from "@/lib/alerts";
import { effectiveChecks } from "@/lib/compliance";

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

/**
 * Header notification centre. Surfaces the live reminder/alert feed (renewals,
 * playbook deviations, anomalies, review items) — the same events that drive the
 * email digests — and lets the user opt out of any category from the system.
 */
export function Notifications({
  onOpenAlert,
}: {
  onOpenAlert: (a: Alert) => void;
}) {
  const { L, lang, plan } = useApp();
  const free = plan === "free";
  const { contracts } = useContracts();
  const { checks, alertPrefs } = useSettings();
  const { getState, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const alerts = useMemo(() => {
    const all = buildAlerts(contracts, effectiveChecks(checks, plan), alertPrefs, lang);
    // Clause-anomaly detection is a Pro capability — Free keeps renewal,
    // compliance-deviation and low-confidence-review alerts only.
    return free ? all.filter((a) => a.kind !== "anomaly") : all;
  }, [contracts, checks, plan, free, alertPrefs, lang]);
  const alertIds = useMemo(() => alerts.map((a) => a.id), [alerts]);
  const unread = unreadCount(alertIds);
  const shown = unreadOnly ? alerts.filter((a) => !getState(a.id).read) : alerts;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openAlert = (a: Alert) => {
    onOpenAlert(a);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={L.notifOpen}
        className="tap relative flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          border: "1px solid var(--border)",
          borderRadius: 10,
          background: "var(--surface)",
          color: "var(--text)",
        }}
      >
        <Bell size={17} />
        {unread > 0 && (
          <span
            aria-hidden
            className="flex items-center justify-center"
            style={{
              position: "absolute",
              top: -6,
              insetInlineEnd: -6,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 999,
              background: "var(--low)",
              color: "#fff",
              fontSize: 10.5,
              fontWeight: 800,
              border: "2px solid var(--bg)",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="rise"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            insetInlineEnd: 0,
            width: 340,
            maxWidth: "calc(100vw - 24px)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "var(--shadow)",
            overflow: "hidden",
            zIndex: 60,
          }}
        >
          <div
            className="flex items-center justify-between gap-2 px-3.5 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>{L.notifCenter}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setUnreadOnly((v) => !v)}
                aria-pressed={unreadOnly}
                className="tap"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: unreadOnly ? "var(--accent)" : "var(--text-soft)",
                  background: unreadOnly ? "var(--accent-soft)" : "transparent",
                  padding: "3px 8px",
                  borderRadius: 8,
                }}
              >
                {L.notifUnreadOnly}
              </button>
              {unread > 0 && (
                <button
                  onClick={() => markAllRead(alertIds)}
                  className="tap"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--accent)",
                    padding: "3px 6px",
                    borderRadius: 8,
                  }}
                >
                  {L.notifMarkAllRead}
                </button>
              )}
            </div>
          </div>

          <div className="scroll-slim" style={{ maxHeight: 380, overflowY: "auto" }}>
            {shown.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center text-center gap-2"
                style={{ padding: "34px 24px", color: "var(--text-soft)" }}
              >
                <Bell size={22} color="var(--text-soft)" />
                <span style={{ fontSize: 13 }}>
                  {unreadOnly ? L.notifNoUnread : L.notifEmpty}
                </span>
              </div>
            ) : (
              shown.map((a) => (
                <AlertRow
                  key={a.id}
                  alert={a}
                  read={getState(a.id).read}
                  onOpen={() => openAlert(a)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert,
  read,
  onOpen,
}: {
  alert: Alert;
  read: boolean;
  onOpen: () => void;
}) {
  const Icon = KIND_ICON[alert.kind];
  const color = SEV_COLOR[alert.severity];
  return (
    <button
      role="menuitem"
      onClick={onOpen}
      className="tap w-full flex items-start gap-2.5 px-3 py-3 text-start"
      style={{
        borderBottom: "1px solid var(--border)",
        background: read ? "transparent" : "color-mix(in srgb, var(--accent) 6%, transparent)",
      }}
    >
      <span
        aria-hidden
        className="shrink-0"
        style={{
          width: 7,
          height: 7,
          borderRadius: 7,
          marginTop: 12,
          background: read ? "transparent" : "var(--low)",
        }}
      />
      <span
        className="flex items-center justify-center shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: `color-mix(in srgb, ${color} 16%, transparent)`,
        }}
      >
        <Icon size={16} color={color} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}
        >
          {alert.title}
        </span>
        <span
          className="block"
          style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5, marginTop: 2 }}
        >
          {alert.body}
        </span>
      </span>
    </button>
  );
}

