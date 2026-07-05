"use client";

import { ArrowUpRight, type LucideIcon } from "lucide-react";

export type ChipTone = "accent" | "high" | "med" | "low";

const CHIP: Record<ChipTone, { bg: string; fg: string }> = {
  accent: { bg: "var(--accent-soft)", fg: "var(--accent)" },
  high: { bg: "var(--high-bg)", fg: "var(--high)" },
  med: { bg: "var(--med-bg)", fg: "var(--med)" },
  low: { bg: "var(--low-bg)", fg: "var(--low)" },
};

/**
 * KPI card in the Signit dashboard style: a pastel icon chip beside its label,
 * a large figure, and a subtitle. Clickable (drills into the relevant view)
 * when `onClick` is provided — signalled by the corner arrow.
 */
export function Stat({
  label,
  value,
  sub,
  tone,
  icon: Icon,
  chip = "accent",
  onClick,
  action,
}: {
  label: string;
  value: string;
  sub?: string;
  /** CSS colour (var or literal) for the headline figure. */
  tone?: string;
  icon?: LucideIcon;
  chip?: ChipTone;
  onClick?: () => void;
  /** Short action verb shown at the foot of the card (e.g. "Notify", "Review"). */
  action?: string;
}) {
  const c = CHIP[chip];
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="stat-card tap rise text-start w-full"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: 18,
        textAlign: "start",
        cursor: onClick ? "pointer" : "default",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="flex items-start gap-2.5">
        {Icon && (
          <span
            className="flex items-center justify-center shrink-0"
            style={{ width: 34, height: 34, borderRadius: 10, background: c.bg }}
          >
            <Icon size={17} color={c.fg} />
          </span>
        )}
        {/* Content column — label, figure and sub all start after the icon */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span
              className="min-w-0"
              style={{
                fontSize: 12.5,
                color: "var(--text-soft)",
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {label}
            </span>
            {onClick && (
              <ArrowUpRight
                size={16}
                color="var(--text-soft)"
                className="stat-arrow shrink-0"
              />
            )}
          </div>

          <div
            className="font-display stat-figure"
            style={{
              fontWeight: 700,
              color: tone || "var(--text)",
              marginTop: 12,
              minWidth: 0,
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                fontSize: 12,
                color: "var(--text-soft)",
                marginTop: 8,
                lineHeight: 1.4,
                overflowWrap: "break-word",
              }}
            >
              {sub}
            </div>
          )}
          {action && onClick && (
            <div
              className="flex items-center gap-1"
              style={{ fontSize: 11.5, fontWeight: 800, color: "var(--accent)", marginTop: 10 }}
            >
              {action} <ArrowUpRight size={12} className="rtl-flip" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
