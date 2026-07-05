"use client";

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Eye,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSettings } from "@/context/SettingsContext";
import { ALERT_KINDS, type AlertKind } from "@/lib/alerts";

const KIND_ICON: Record<AlertKind, LucideIcon> = {
  renewal: CalendarClock,
  compliance: ScrollText,
  anomaly: AlertTriangle,
  review: Eye,
};
const KIND_LABEL: Record<
  AlertKind,
  "alertRenewal" | "alertCompliance" | "alertAnomaly" | "alertReview"
> = {
  renewal: "alertRenewal",
  compliance: "alertCompliance",
  anomaly: "alertAnomaly",
  review: "alertReview",
};

/**
 * Notification settings: how alerts reach you (email delivery — a Pro feature)
 * and which alert types you want to receive. Kept separate from the Action
 * Center workboard so the board stays focused on items that need action.
 */
export function NotificationSettings() {
  const { L, plan, setPlan } = useApp();
  const free = plan === "free";
  const {
    alertPrefs,
    emailNotifications,
    toggleEmailNotifications,
    toggleAlertPref,
  } = useSettings();

  return (
    <div className="max-w-[760px] mx-auto">
      <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.7 }}>
        {L.notifSettingsIntro}
      </p>

      {/* Email delivery — Pro; Free keeps in-app notifications only. */}
      <Card title={L.notifMasterTitle}>
        <div
          className="flex items-center gap-3"
          style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
        >
          <IconChip on={!free && emailNotifications} Icon={Bell} />
          <div className="min-w-0 flex-1">
            {free ? (
              <>
                <div
                  className="inline-flex items-center gap-1.5"
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  {L.notifMasterOff}
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "var(--accent)",
                      background: "var(--accent-soft)",
                      borderRadius: 6,
                      padding: "1px 6px",
                    }}
                  >
                    {L.planPaid}
                  </span>
                </div>
                <div
                  style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.6, marginTop: 2 }}
                >
                  {L.emailProNote}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {emailNotifications ? L.notifMasterOn : L.notifMasterOff}
                </div>
                <div
                  style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.6, marginTop: 2 }}
                >
                  {L.notifMasterHint}
                </div>
              </>
            )}
          </div>
          {free ? (
            <button
              onClick={() => setPlan("paid")}
              className="tap shrink-0"
              style={{
                background: "var(--grad-primary)",
                color: "var(--on-accent)",
                border: "none",
                borderRadius: 9,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {L.upgradePro}
            </button>
          ) : (
            <Switch on={emailNotifications} onToggle={toggleEmailNotifications} label={L.notifMasterTitle} />
          )}
        </div>
      </Card>

      {/* Which alert types to receive */}
      <Card title={L.notifPrefsTitle}>
        <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 2 }}>
          {L.notifPrefsHint}
        </div>
        {ALERT_KINDS.map((k) => {
          const Icon = KIND_ICON[k];
          const on = alertPrefs[k];
          return (
            <div
              key={k}
              className="flex items-center gap-3 py-3"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <IconChip on={on} Icon={Icon} />
              <div className="min-w-0 flex-1">
                <div style={{ fontSize: 14, fontWeight: 600 }}>{L[KIND_LABEL[k]]}</div>
                {!on && (
                  <div style={{ fontSize: 11.5, color: "var(--low)", marginTop: 1 }}>
                    {L.notifMutedNote}
                  </div>
                )}
              </div>
              <Switch on={on} onToggle={() => toggleAlertPref(k)} label={L[KIND_LABEL[k]]} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function IconChip({ on, Icon }: { on: boolean; Icon: LucideIcon }) {
  return (
    <span
      className="flex items-center justify-center shrink-0"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: on ? "var(--accent-soft)" : "var(--surface-alt)",
      }}
    >
      <Icon size={18} color={on ? "var(--accent)" : "var(--text-soft)"} />
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mt-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "var(--shadow)",
        padding: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}

function Switch({
  on,
  onToggle,
  label,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="shrink-0"
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        background: on ? "var(--accent)" : "var(--surface-alt)",
        border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
        position: "relative",
        transition: "background .2s",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          insetInlineStart: on ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: "#fff",
          transition: "inset-inline-start .2s",
          boxShadow: "0 1px 2px rgba(0,0,0,.25)",
        }}
      />
    </button>
  );
}
