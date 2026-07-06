"use client";

import { ChevronDown, RotateCcw, type LucideIcon } from "lucide-react";

/**
 * Shared filter controls — one visual/interaction language used everywhere a
 * screen lets the user narrow a list (contract register, action calendar,
 * anywhere else). Three shapes cover every case in the app:
 *
 *  - `FilterSelect`  — a single-choice dropdown (status, type, responsible team)
 *  - `FilterToggleChip` — a boolean/category toggle (auto-renew, category legend)
 *  - `FilterResetButton` — the one "clear filters" affordance
 *
 * All three share the same pill shape (`borderRadius: 999`, `height: 34`) and
 * active-state tokens (`var(--accent)` / `var(--accent-soft)` by default), so a
 * user learns the pattern once and recognises it on every screen.
 */

/** Pill-styled dropdown filter: a leading icon, a native `<select>`, and a
 * trailing caret. `value=""` is reserved for "no filter" — pass `placeholder`
 * for its label. */
export function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  active,
  icon: Icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  active: boolean;
  /** Leading icon — defaults to the generic "add a filter" affordance. */
  icon: LucideIcon;
}) {
  return (
    <div
      className="relative flex items-center gap-1 shrink-0"
      style={{
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        background: active ? "var(--accent-soft)" : "var(--surface)",
        borderRadius: 999,
        paddingInline: 10,
        height: 34,
      }}
    >
      <Icon size={13} color={active ? "var(--accent)" : "var(--text-soft)"} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent"
        style={{
          border: "none",
          outline: "none",
          fontSize: 12.5,
          fontWeight: 600,
          color: active ? "var(--accent)" : "var(--text)",
          fontFamily: "inherit",
          cursor: "pointer",
          paddingInlineEnd: 16,
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        color="var(--text-soft)"
        className="pointer-events-none"
        style={{ position: "absolute", insetInlineEnd: 8 }}
      />
    </div>
  );
}

/** Pill toggle button — for boolean filters (auto-renew, uploaded-only) and
 * category legends (each category keeps its own `tone` so the chip still
 * reads as that category's color even before/after selection). */
export function FilterToggleChip({
  on,
  onClick,
  icon: Icon,
  iconColor,
  label,
  tone,
}: {
  on: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  /** Force the icon's color regardless of on/off — e.g. a category's legend
   * color. Omit to let the icon just follow the button's text color. */
  iconColor?: string;
  label: string;
  /** Active-state color; defaults to the shared accent. */
  tone?: string;
}) {
  const t = tone ?? "var(--accent)";
  const activeBg = tone
    ? `color-mix(in srgb, ${t} 15%, transparent)`
    : "var(--accent-soft)";
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="tap inline-flex items-center gap-1.5 shrink-0"
      style={{
        border: `1px solid ${on ? t : "var(--border)"}`,
        background: on ? activeBg : "var(--surface)",
        color: on ? t : "var(--text)",
        borderRadius: 999,
        paddingInline: 12,
        height: 34,
        fontSize: 12.5,
        fontWeight: on ? 700 : 600,
        cursor: "pointer",
      }}
    >
      {Icon && <Icon size={13} color={iconColor} />}
      {label}
    </button>
  );
}

/** The one "reset filters" affordance used across the app: a bordered surface
 * pill with a counter-clockwise arrow. */
export function FilterResetButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="tap flex items-center gap-1.5 shrink-0"
      style={{
        color: "var(--text-soft)",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        padding: "6px 12px",
        cursor: "pointer",
      }}
    >
      <RotateCcw size={13} className="rtl-flip" /> {label}
    </button>
  );
}
