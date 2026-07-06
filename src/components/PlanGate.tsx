"use client";

import { Lock, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

/** Full-screen gate shown when a Pro-only feature is opened on Free. */
export function ProGate({ title, body }: { title?: string; body?: string }) {
  const { L, setPlan } = useApp();
  return (
    <div
      className="flex flex-col items-center justify-center text-center mx-auto"
      style={{ minHeight: "55vh", maxWidth: 420, gap: 8 }}
    >
      <div
        className="flex items-center justify-center rise"
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "var(--accent-soft)",
          marginBottom: 6,
          position: "relative",
        }}
      >
        <Sparkles size={30} color="var(--accent)" />
        <span
          className="flex items-center justify-center"
          style={{
            position: "absolute",
            insetInlineEnd: -6,
            bottom: -6,
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Lock size={14} color="var(--accent)" />
        </span>
      </div>
      <div
        className="inline-flex items-center gap-1.5"
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "var(--accent)",
          background: "var(--accent-soft)",
          borderRadius: 20,
          padding: "3px 10px",
        }}
      >
        {L.proOnly}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, marginTop: 4 }}>
        {title ?? L.proGateTitle}
      </div>
      <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.7 }}>
        {body ?? L.proGateBody}
      </p>
      <button
        onClick={() => setPlan("paid")}
        className="tap mt-2"
        style={{
          background: "var(--cta)",
          color: "var(--cta-ink)",
          border: "none",
          borderRadius: 10,
          padding: "10px 18px",
          fontSize: 13.5,
          fontWeight: 700,
        }}
      >
        {L.upgradePro}
      </button>
    </div>
  );
}
