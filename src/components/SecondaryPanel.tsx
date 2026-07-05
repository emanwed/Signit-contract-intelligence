"use client";

import {
  Archive,
  Bell,
  CalendarClock,
  ClipboardCheck,
  Layers,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Dict } from "@/lib/i18n";
import type { TabKey } from "@/lib/types";

const SUBNAV: [TabKey, LucideIcon, keyof Dict][] = [
  ["overview", Layers, "overview"],
  ["obligations", CalendarClock, "obTab"],
  ["search", Search, "ssTab"],
  ["notifications", ClipboardCheck, "notifications"],
  ["settings", ShieldCheck, "complianceTab"],
  ["notifsettings", Bell, "notifSettingsTab"],
  ["archive", Archive, "archiveTab"],
  ["soon", Rocket, "soonTab"],
];

// Pro-only sub-views — get a lock badge on the Free plan.
const PRO_TABS = new Set<TabKey>(["obligations", "search"]);

/**
 * Second-layer navigation — the contextual panel for "Contract Intelligence",
 * mirroring how Signit shows a section's sub-views beside the main rail. Holds
 * the New-contract action and the section's sub-navigation. Inner content only;
 * the parent supplies the panel <aside>.
 */
export function SecondaryPanel({
  tab,
  onTab,
  actionCount,
}: {
  tab: TabKey;
  onTab: (t: TabKey) => void;
  actionCount: number;
}) {
  const { L, plan } = useApp();
  const free = plan === "free";

  return (
    <div className="flex flex-col min-h-full shrink-0 p-3 gap-3">
      <div className="px-1 pt-1">
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
          {L.navContracts}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 2 }}>
          {L.tag}
        </div>
      </div>

      <nav className="flex flex-col gap-1 mt-1" aria-label="Contract Intelligence">
        {SUBNAV.map(([k, Ic, labelKey]) => {
          const on = tab === k;
          const badge = k === "notifications" ? actionCount : 0;
          return (
            <button
              key={k}
              onClick={() => onTab(k)}
              aria-current={on ? "page" : undefined}
              className="tap flex items-center gap-2.5 px-3 py-2 text-start"
              style={{
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                color: on ? "var(--accent)" : "var(--text)",
                background: on ? "var(--accent-soft)" : "transparent",
              }}
            >
              <Ic
                size={18}
                color={on ? "var(--accent)" : "var(--text-soft)"}
                className="shrink-0"
              />
              <span className="flex-1 truncate">{L[labelKey] as string}</span>
              {free && PRO_TABS.has(k) && (
                <Sparkles size={13} color="var(--accent)" className="shrink-0" />
              )}
              {badge > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    borderRadius: 20,
                    padding: "1px 7px",
                    fontWeight: 700,
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
