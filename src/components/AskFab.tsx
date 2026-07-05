"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Contract, TabKey } from "@/lib/types";
import { Ask } from "./Ask";

/**
 * "Ask Signit" as a floating action button, available on every view. Clicking
 * it expands a popover with the search box, suggested questions, and results.
 * Anchored to the inline-end corner (right in LTR, left in RTL).
 */
export function AskFab({
  onOpenContract,
  tab,
}: {
  onOpenContract: (c: Contract) => void;
  tab?: TabKey;
}) {
  const { L } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} style={{ display: "contents" }}>
      {open && (
        <div
          className="rise scroll-slim"
          role="dialog"
          aria-label={L.ask}
          style={{
            position: "fixed",
            bottom: 84,
            insetInlineEnd: 16,
            zIndex: 58,
            width: "min(400px, calc(100vw - 32px))",
            maxHeight: "min(72vh, 640px)",
            overflowY: "auto",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            boxShadow: "var(--shadow)",
            padding: 12,
          }}
        >
          <div className="flex justify-end">
            <button
              onClick={() => setOpen(false)}
              aria-label={L.back}
              className="tap flex items-center justify-center"
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                color: "var(--text-soft)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={17} />
            </button>
          </div>
          <Ask onOpen={onOpenContract} tab={tab} />
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={L.ask}
        className="tap flex items-center gap-2"
        style={{
          position: "fixed",
          bottom: 20,
          insetInlineEnd: 16,
          zIndex: 59,
          background: "var(--grad-primary)",
          color: "var(--on-accent)",
          border: "none",
          borderRadius: 999,
          padding: "12px 18px",
          fontSize: 14,
          fontWeight: 700,
          boxShadow: "0 6px 20px rgba(40,30,120,.28), var(--shadow)",
          cursor: "pointer",
        }}
      >
        {open ? <X size={18} /> : <Sparkles size={18} />}
        <span className="hidden sm:inline">{L.ask}</span>
      </button>
    </div>
  );
}
