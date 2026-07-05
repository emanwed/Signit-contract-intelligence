"use client";

import {
  Building2,
  FlaskConical,
  Lock,
  Scale,
  Sparkles,
  Table2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { FREE_PERSONA } from "@/lib/plan";
import type { Persona } from "@/lib/types";

export const PROTOTYPE_BAR_H = 46;

const PERSONAS: [Persona, LucideIcon][] = [
  ["exec", Building2],
  ["proc", TrendingUp],
  ["legal", Scale],
];

/**
 * A prototype-testing strip fixed to the very top — deliberately *outside* the
 * product design. Lets a reviewer switch the user-type lens (Executive /
 * Operations / Legal) and the subscription plan (Free / Pro) to see how the
 * product gates features per tier. Styled as a dark meta bar so it never reads
 * as part of the Signit UI.
 */
export function PrototypeBar({
  persona,
  onPersona,
}: {
  persona: Persona;
  onPersona: (p: Persona) => void;
}) {
  const { L, plan, setPlan, setUpgradeOpen } = useApp();
  const free = plan === "free";

  return (
    <div
      className="sticky top-0 z-[55] w-full"
      style={{
        height: PROTOTYPE_BAR_H,
        background: "#17162a",
        color: "#eceafd",
        borderBottom: "1px solid #2c2a45",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 h-full px-3 sm:px-5 overflow-x-auto scroll-slim">
        <div className="flex items-center gap-1.5 shrink-0" style={{ opacity: 0.85 }}>
          <FlaskConical size={14} color="#b7adf5" />
          <span
            className="hidden sm:inline"
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}
          >
            {L.prototype}
          </span>
        </div>
        <span className="shrink-0" style={{ fontSize: 11.5, opacity: 0.6 }}>
          {L.viewAs}
        </span>

        <div
          className="flex items-center gap-1 p-0.5 shrink-0"
          style={{ background: "rgba(255,255,255,.07)", borderRadius: 9 }}
          role="tablist"
          aria-label={L.viewAs}
        >
          {PERSONAS.map(([p, Ic]) => {
            const on = persona === p;
            const locked = free && p !== FREE_PERSONA;
            return (
              <button
                key={p}
                onClick={() => !locked && onPersona(p)}
                disabled={locked}
                role="tab"
                aria-selected={on}
                title={locked ? L.proLockPersona : undefined}
                className="tap flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap"
                style={{
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: on ? 700 : 500,
                  color: on ? "var(--on-accent)" : "#cdc9ef",
                  background: on ? "var(--accent)" : "transparent",
                  opacity: locked ? 0.4 : 1,
                  cursor: locked ? "not-allowed" : "pointer",
                }}
              >
                {locked ? <Lock size={11} className="shrink-0" /> : <Ic size={13} className="shrink-0" />}
                {L[p]}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Plan switch */}
        <span className="shrink-0 hidden sm:inline" style={{ fontSize: 11.5, opacity: 0.6 }}>
          {L.planLabel}
        </span>
        <div
          className="flex items-center gap-1 p-0.5 shrink-0"
          style={{ background: "rgba(255,255,255,.07)", borderRadius: 9 }}
          role="tablist"
          aria-label={L.planLabel}
        >
          <PlanTab
            on={free}
            onClick={() => setPlan("free")}
            label={L.planFree}
          />
          <PlanTab
            on={!free}
            onClick={() => setPlan("paid")}
            label={L.planPaid}
            pro
          />
        </div>

        <button
          onClick={() => setUpgradeOpen(true)}
          className="tap flex items-center gap-1.5 px-2 py-1 shrink-0 whitespace-nowrap"
          style={{ fontSize: 11.5, color: "#cdc9ef", opacity: 0.9 }}
        >
          <Table2 size={13} />
          <span className="hidden sm:inline">{L.planCompare}</span>
        </button>
      </div>
    </div>
  );
}

function PlanTab({
  on,
  onClick,
  label,
  pro = false,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  pro?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={on}
      className="tap flex items-center gap-1 px-2.5 py-1 whitespace-nowrap"
      style={{
        borderRadius: 7,
        fontSize: 12,
        fontWeight: on ? 700 : 500,
        color: on ? (pro ? "#17162a" : "var(--on-accent)") : "#cdc9ef",
        background: on ? (pro ? "#ffd24a" : "var(--accent)") : "transparent",
      }}
    >
      {pro && <Sparkles size={12} className="shrink-0" />}
      {label}
    </button>
  );
}
