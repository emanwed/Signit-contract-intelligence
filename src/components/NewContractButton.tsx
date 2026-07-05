"use client";

import { CirclePlus } from "lucide-react";
import { useApp } from "@/context/AppContext";

/** Signit-styled primary action to add a signed contract. */
export function NewContractButton({
  onClick,
  compact = false,
  variant = "gradient",
  block = false,
}: {
  onClick: () => void;
  /** In compact mode the label is hidden below `sm`. */
  compact?: boolean;
  /** "gradient" = purple primary (content); "cta" = yellow (sidebar). */
  variant?: "gradient" | "cta";
  /** Stretch to full width (sidebar use). */
  block?: boolean;
}) {
  const { L } = useApp();
  const cta = variant === "cta";
  return (
    <button
      onClick={onClick}
      className={`tap flex items-center gap-1.5 ${
        block ? "w-full justify-start" : "shrink-0 justify-center"
      }`}
      style={{
        background: cta ? "var(--cta)" : "var(--grad-primary)",
        color: cta ? "var(--cta-ink)" : "var(--on-accent)",
        border: "none",
        borderRadius: 10,
        padding: "9px 14px",
        fontSize: 13,
        fontWeight: 700,
        boxShadow: cta ? "none" : "var(--shadow)",
      }}
    >
      <CirclePlus size={16} className="shrink-0" />
      <span className={compact ? "hidden sm:inline" : ""}>{L.newContract}</span>
    </button>
  );
}
