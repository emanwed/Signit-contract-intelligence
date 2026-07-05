"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { buildPortfolio, localFallback } from "@/lib/format";
import type { AskAnswer, Contract, Lang, TabKey } from "@/lib/types";
import { ContractCard } from "./ContractCard";

/** Page-aware suggested questions — tailored to the tab the user is on. */
function suggestionsFor(tab: TabKey | undefined, lang: Lang): string[] {
  const ar: Partial<Record<TabKey, string[]>> = {
    obligations: [
      "ما الالتزامات المستحقة هذا الشهر؟",
      "أي عقود تحتاج إشعار عدم تجديد قريبًا؟",
      "أي دفعات أو تسليمات فات موعدها؟",
    ],
    search: [
      "أي عقود تتضمن بنود ملكية فكرية؟",
      "أين توجد بنود حماية البيانات (PDPL)؟",
      "أي عقود تحدّ من المسؤولية؟",
    ],
    notifications: [
      "ما الذي يحتاج انتباهي الآن؟",
      "أي عقود عالية المخاطر؟",
      "أي عقود تخالف سياسة الحد الأدنى للمسؤولية؟",
    ],
  };
  const en: Partial<Record<TabKey, string[]>> = {
    obligations: [
      "Which obligations are due this month?",
      "Which contracts need a non-renewal notice soon?",
      "Are any payments or deliverables overdue?",
    ],
    search: [
      "Which contracts have IP ownership clauses?",
      "Where are the data-protection (PDPL) clauses?",
      "Which contracts limit liability?",
    ],
    notifications: [
      "What needs my attention right now?",
      "Which contracts are high risk?",
      "Which contracts breach the minimum-liability policy?",
    ],
  };
  const fallbackAr = [
    "أي عقود بسقف مسؤولية أقل من مليون ريال؟",
    "ما الذي يتجدد تلقائيًا خلال ٩٠ يومًا؟",
    "أي عقود بها مخاطر على حماية البيانات؟",
  ];
  const fallbackEn = [
    "Which contracts have a liability cap below 1M SAR?",
    "What auto-renews in the next 90 days?",
    "Which contracts carry data-protection risk?",
  ];
  const table = lang === "ar" ? ar : en;
  return (tab && table[tab]) || (lang === "ar" ? fallbackAr : fallbackEn);
}

/**
 * "Ask Signit" — natural-language Q&A over the portfolio. Calls the real
 * server route (/api/ask → Anthropic API). If that path fails for any reason,
 * it silently falls back to the local keyword matcher so the demo never breaks;
 * a badge shows which path served the answer (Live AI vs demo).
 */
export function Ask({
  onOpen,
  tab,
}: {
  onOpen: (c: Contract) => void;
  tab?: TabKey;
}) {
  const { lang, L } = useApp();
  const { contracts } = useContracts();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<AskAnswer | null>(null);
  const [liveTag, setLiveTag] = useState(false);

  const suggestions = suggestionsFor(tab, lang);

  const run = async (question?: string) => {
    const query = (question ?? q).trim();
    if (!query) return;
    setBusy(true);
    setRes(null);

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: query,
          portfolio: buildPortfolio(contracts),
        }),
      });
      const json = await r.json();
      if (json?.ok && json.data) {
        setLiveTag(true);
        setRes(json.data as AskAnswer);
      } else {
        // Route reached but the model/network hiccuped — graceful fallback.
        setLiveTag(false);
        setRes(localFallback(query, contracts));
      }
    } catch {
      setLiveTag(false);
      setRes(localFallback(query, contracts));
    } finally {
      setBusy(false);
    }
  };

  const matched = res
    ? contracts.filter((c) => (res.matchIds || []).includes(c.id))
    : [];

  return (
    <div>
      <div
        className="rise"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          boxShadow: "var(--shadow)",
          padding: 18,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 15 }}>{L.ask}</span>
          <span
            className="flex items-center gap-1"
            style={{
              fontSize: 10.5,
              color: liveTag ? "var(--high)" : "var(--text-soft)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "1px 8px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 6,
                background: liveTag ? "var(--high)" : "var(--med)",
              }}
            />
            {liveTag ? L.live : L.demo}
          </span>
        </div>

        <div
          className="flex items-center gap-2 p-2"
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "var(--bg)",
          }}
        >
          <Search size={17} color="var(--text-soft)" className="shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder={L.askPlaceholder}
            aria-label={L.ask}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              color: "var(--text)",
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => run()}
            disabled={busy}
            className="tap px-4 py-2 shrink-0"
            style={{
              background: "var(--grad-primary)",
              color: "var(--on-accent)",
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {L.ask}
          </button>
        </div>

        <div
          style={{ fontSize: 11, fontWeight: 600, color: "var(--text-soft)", marginTop: 12, marginBottom: 6 }}
        >
          {L.askSuggestFor}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQ(s);
                run(s);
              }}
              className="tap px-3 py-1.5 text-start"
              style={{
                fontSize: 12,
                color: "var(--text-soft)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                background: "transparent",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {busy && (
        <div
          className="flex items-center gap-2 mt-5"
          style={{ color: "var(--text-soft)", fontSize: 13.5 }}
        >
          <Sparkles size={16} className="rise" color="var(--accent)" />{" "}
          {L.thinking}
        </div>
      )}

      {res && !busy && (
        <div className="rise mt-5">
          <div
            className="flex items-start gap-2 p-3 mb-4"
            style={{
              background: "var(--accent-soft)",
              borderRadius: 12,
              fontSize: 13.5,
            }}
          >
            <Sparkles
              size={16}
              color="var(--accent)"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <span>{lang === "ar" ? res.answer_ar : res.answer_en}</span>
          </div>
          <div
            style={{ fontSize: 12.5, color: "var(--text-soft)", marginBottom: 10 }}
          >
            {L.matches} · {matched.length}
          </div>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}
          >
            {matched.map((c) => (
              <ContractCard key={c.id} c={c} onOpen={onOpen} highlight />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
