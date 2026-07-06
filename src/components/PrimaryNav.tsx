"use client";

import {
  CircleHelp,
  Crown,
  FileSearch,
  FolderClosed,
  Home,
  LayoutTemplate,
  Lock,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Section } from "@/lib/types";
import { Wordmark } from "./Wordmark";

/** [section, icon, i18n label key, isOurFeature] */
const ITEMS: [Section, LucideIcon, "navHome" | "navDocuments" | "navContracts" | "navTemplates" | "navReports", boolean][] = [
  ["home", Home, "navHome", false],
  ["documents", FolderClosed, "navDocuments", false],
  ["contracts", FileSearch, "navContracts", true],
  ["templates", LayoutTemplate, "navTemplates", false],
  ["reports", Crown, "navReports", false],
];

/**
 * First-layer navigation — the Signit main menu. Mirrors the real product
 * (Home / Documents / Templates / Reports) with our built feature, "Contract
 * Intelligence", inserted between Documents and Templates. Collapses to an
 * icon-only rail. Rendered as inner content; the parent supplies the <aside>.
 */
export function PrimaryNav({
  section,
  onSection,
  collapsed,
  onNotBuilt,
  flat = false,
}: {
  section: Section;
  onSection: (s: Section) => void;
  collapsed: boolean;
  onNotBuilt: (label: string) => void;
  /** Drawer mode — natural height, no bottom-pinning spacer. */
  flat?: boolean;
}) {
  const { L } = useApp();

  return (
    <div className={`flex flex-col ${flat ? "" : "min-h-full shrink-0"} p-3 gap-2`}>
      {/* Brand — the Signit wordmark, scaled down when the rail is collapsed */}
      <div
        className={`flex items-center ${collapsed ? "justify-center" : "px-1"} pt-1 pb-1`}
        style={{ minHeight: 36 }}
      >
        <Wordmark size={collapsed ? 15 : 23} />
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 mt-1" aria-label="Main">
        {ITEMS.map(([s, Ic, key, ours]) => {
          const on = section === s;
          return (
            <button
              key={s}
              onClick={() => onSection(s)}
              title={collapsed ? L[key] : undefined}
              aria-current={on ? "page" : undefined}
              className={`tap flex items-center gap-2.5 py-2 text-start ${
                collapsed ? "justify-center px-0" : "px-3"
              }`}
              style={{
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                color: on ? "var(--accent)" : "var(--text)",
                background: on ? "var(--accent-soft)" : "transparent",
              }}
            >
              <Ic
                size={19}
                color={
                  s === "reports"
                    ? "var(--med)"
                    : on
                      ? "var(--accent)"
                      : "var(--text-soft)"
                }
                className="shrink-0"
              />
              {!collapsed && (
                <span className="flex-1 min-w-0 flex items-center gap-1.5">
                  <span className="truncate">{L[key]}</span>
                  {ours ? (
                    // The one built feature — flagged "New".
                    <span
                      className="shrink-0"
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        color: "#fff",
                        background: "var(--accent)",
                        borderRadius: 5,
                        padding: "1px 5px",
                        letterSpacing: 0.2,
                      }}
                    >
                      {L.dir === "rtl" ? "جديد" : "New"}
                    </span>
                  ) : (
                    // Existing Signit features, not built in this prototype.
                    <Lock
                      size={12}
                      color="var(--text-soft)"
                      className="shrink-0"
                      style={{ opacity: 0.65 }}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {!flat && <div className="flex-1" />}

      {/* Utilities — existing Signit features, not built in this prototype */}
      {[
        [Settings, L.settings] as const,
        [CircleHelp, L.getHelp] as const,
      ].map(([Ic, label]) => (
        <button
          key={label}
          onClick={() => onNotBuilt(label)}
          title={collapsed ? label : undefined}
          className={`tap flex items-center gap-2.5 py-2 text-start ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
          style={{
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: 500,
            color: "var(--text-soft)",
          }}
        >
          <Ic size={18} color="var(--text-soft)" className="shrink-0" />
          {!collapsed && (
            <span className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className="truncate">{label}</span>
              <Lock
                size={12}
                color="var(--text-soft)"
                className="shrink-0"
                style={{ opacity: 0.65 }}
              />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
