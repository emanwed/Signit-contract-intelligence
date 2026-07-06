"use client";

import { useEffect, useState } from "react";
import { Sparkles, Trash2, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { money } from "@/lib/format";
import type { Contract } from "@/lib/types";

/**
 * Shown when a Free user (already at the 3 active-contract limit) tries to add a
 * new contract: they must delete one of their contracts to make room — or
 * upgrade. Deleting one closes this and continues straight into the add flow.
 */
export function MakeRoomModal({
  contracts,
  onMadeRoom,
  onClose,
  onUpgrade,
}: {
  contracts: Contract[];
  onMadeRoom: () => void;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const { lang, L } = useApp();
  const { removeContract } = useContracts();
  // Delete requires a second tap to confirm — only one row confirms at a time.
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Auto-reset the pending confirmation if the user doesn't follow through.
  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 3500);
    return () => clearTimeout(t);
  }, [confirmId]);

  const del = (id: string) => {
    if (confirmId === id) {
      removeContract(id);
      onMadeRoom();
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        className="rise relative scroll-slim"
        style={{
          width: "min(460px,100%)",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          className="flex items-start justify-between gap-2 px-5 py-4 sticky top-0"
          style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="min-w-0">
            <div className="font-display" style={{ fontSize: 16, fontWeight: 700 }}>
              {L.makeRoomTitle}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginTop: 2, lineHeight: 1.5 }}>
              {L.makeRoomBody}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={L.back}
            className="tap flex items-center justify-center shrink-0"
            style={{ width: 30, height: 30, borderRadius: 8, color: "var(--text-soft)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-2">
          {contracts.map((c) => {
            const confirming = confirmId === c.id;
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${confirming ? "var(--low)" : "var(--border)"}`,
                  borderRadius: 12,
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {lang === "ar" ? c.title_ar : c.title_en}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
                    {c.id} · {c.valueSAR ? money(c.valueSAR, lang) : "—"}
                  </div>
                </div>
                <button
                  onClick={() => del(c.id)}
                  className="tap flex items-center gap-1.5 shrink-0"
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: confirming ? "var(--on-accent)" : "var(--low)",
                    background: confirming ? "var(--low)" : "var(--low-bg)",
                    border: `1px solid ${confirming ? "var(--low)" : "var(--border)"}`,
                    borderRadius: 9,
                    padding: "6px 11px",
                  }}
                >
                  <Trash2 size={14} />
                  {confirming ? L.confirmDelete : L.deleteContract}
                </button>
              </div>
            );
          })}

          <button
            onClick={onUpgrade}
            className="tap flex items-center justify-center gap-2 mt-2 py-3"
            style={{
              background: "var(--grad-primary)",
              color: "var(--on-accent)",
              border: "none",
              borderRadius: 12,
              fontSize: 13.5,
              fontWeight: 700,
            }}
          >
            <Sparkles size={16} /> {L.makeRoomUpgrade}
          </button>
        </div>
      </div>
    </div>
  );
}
