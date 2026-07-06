"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { buildPortfolio, localFallback } from "@/lib/format";
import type { AskAnswer, Contract, Lang, TabKey } from "@/lib/types";

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

/** One question–answer exchange in the conversation. */
interface Exchange {
  id: string;
  q: string;
  res?: AskAnswer;
  /** Whether the live model (vs the local demo matcher) served this answer. */
  live?: boolean;
}

/**
 * "Ask Signit" — natural-language Q&A over the portfolio, as a multi-turn
 * conversation. Each answer keeps its own Live-AI/demo badge, a copy action,
 * and tappable source-contract chips. Calls the real server route
 * (/api/ask → Anthropic API); if that fails, the local keyword matcher answers
 * so the demo never breaks.
 */
export function Ask({
  onOpen,
  tab,
}: {
  onOpen: (c: Contract) => void;
  tab?: TabKey;
}) {
  const { lang, L, plan, setUpgradeOpen } = useApp();
  const ar = lang === "ar";
  const free = plan === "free";
  const { contracts: allContracts } = useContracts();
  // Free asks over its own uploaded contracts only; Pro searches the whole
  // portfolio. Mirrors the same uploaded-only scoping used for Free insights.
  const contracts = free ? allContracts.filter((c) => c.source === "added") : allContracts;
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [thread, setThread] = useState<Exchange[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const suggestions = suggestionsFor(tab, lang);

  // Keep the newest exchange in view as the conversation grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [thread, busy]);

  const noFreeContracts = free && contracts.length === 0;

  const run = async (question?: string) => {
    const query = (question ?? q).trim();
    if (!query || busy || noFreeContracts) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setThread((t) => [...t, { id, q: query }]);
    setQ("");
    setBusy(true);

    let res: AskAnswer;
    let live = false;
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
        live = true;
        res = json.data as AskAnswer;
      } else {
        res = localFallback(query, contracts);
      }
    } catch {
      res = localFallback(query, contracts);
    }
    setThread((t) => t.map((x) => (x.id === id ? { ...x, res, live } : x)));
    setBusy(false);
  };

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
          <div className="flex-1" />
          {thread.length > 0 && (
            <button
              onClick={() => setThread([])}
              className="tap flex items-center gap-1"
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--text-soft)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                padding: "3px 10px",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={12} className="rtl-flip" />
              {ar ? "محادثة جديدة" : "New chat"}
            </button>
          )}
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
            placeholder={
              noFreeContracts
                ? ar
                  ? "ارفع عقدًا أولًا لتسأل عنه…"
                  : "Upload a contract first to ask about it…"
                : L.askPlaceholder
            }
            aria-label={L.ask}
            disabled={noFreeContracts}
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
            disabled={busy || noFreeContracts}
            className="tap px-4 py-2 shrink-0"
            style={{
              background: "var(--grad-primary)",
              color: "var(--on-accent)",
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              opacity: busy || noFreeContracts ? 0.5 : 1,
            }}
          >
            {L.ask}
          </button>
        </div>

        {free && (
          <button
            onClick={() => setUpgradeOpen(true)}
            className="tap inline-flex items-center gap-1 mt-2.5"
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "var(--accent)",
              background: "var(--accent-soft)",
              borderRadius: 999,
              padding: "3px 9px",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Sparkles size={12} />
            {ar
              ? "الخطة المجانية: البحث ضمن عقودك المرفوعة فقط — ترقَّ للبحث في المحفظة كاملة"
              : "Free plan: searches your uploaded contracts only — upgrade to search the whole portfolio"}
          </button>
        )}

        {/* Suggestions — shown until a conversation starts (need a scoped
            contract to run against) */}
        {thread.length === 0 && !noFreeContracts && (
          <>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-soft)",
                marginTop: 12,
                marginBottom: 6,
              }}
            >
              {L.askSuggestFor}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => run(s)}
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
          </>
        )}
      </div>

      {/* Conversation thread */}
      <div className="flex flex-col gap-3 mt-4">
        {thread.map((x) => (
          <ExchangeView key={x.id} x={x} lang={lang} L={L} contracts={contracts} onOpen={onOpen} />
        ))}
        {busy && (
          <div
            className="flex items-center gap-2"
            style={{ color: "var(--text-soft)", fontSize: 13 }}
          >
            <Sparkles size={15} className="rise" color="var(--accent)" /> {L.thinking}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}

/** One Q→A pair: user bubble, then the answer with badge, copy and sources. */
function ExchangeView({
  x,
  lang,
  L,
  contracts,
  onOpen,
}: {
  x: Exchange;
  lang: Lang;
  L: { live: string; demo: string; matches: string };
  contracts: Contract[];
  onOpen: (c: Contract) => void;
}) {
  const ar = lang === "ar";
  const [copied, setCopied] = useState(false);

  const matched = x.res
    ? contracts.filter((c) => (x.res!.matchIds || []).includes(c.id))
    : [];
  const answer = x.res ? (ar ? x.res.answer_ar : x.res.answer_en) : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* User question bubble */}
      <div className="flex justify-end">
        <div
          style={{
            maxWidth: "85%",
            background: "var(--accent-soft)",
            color: "var(--text)",
            borderRadius: "14px 14px 4px 14px",
            padding: "8px 12px",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {x.q}
        </div>
      </div>

      {/* Answer */}
      {x.res && (
        <div
          className="rise"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "14px 14px 14px 4px",
            boxShadow: "var(--shadow)",
            padding: "10px 12px",
          }}
        >
          <div className="flex items-start gap-2">
            <Sparkles
              size={15}
              color="var(--accent)"
              className="shrink-0"
              style={{ marginTop: 2 }}
            />
            <span style={{ fontSize: 13.5, lineHeight: 1.7, flex: 1 }}>{answer}</span>
          </div>

          {matched.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              <span style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 600 }}>
                {L.matches} · {matched.length}
              </span>
              {matched.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpen(c)}
                  className="tap inline-flex items-center gap-1"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    padding: "3px 9px",
                    cursor: "pointer",
                  }}
                >
                  <FileText size={11} />
                  <span className="truncate" style={{ maxWidth: 180 }}>
                    {ar ? c.title_ar : c.title_en}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div
            className="flex items-center gap-2 mt-2.5 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span
              className="inline-flex items-center gap-1"
              style={{
                fontSize: 10.5,
                color: x.live ? "var(--high)" : "var(--text-soft)",
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
                  background: x.live ? "var(--high)" : "var(--med)",
                }}
              />
              {x.live ? L.live : L.demo}
            </span>
            <div className="flex-1" />
            <button
              onClick={copy}
              className="tap inline-flex items-center gap-1"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: copied ? "var(--high)" : "var(--text-soft)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? (ar ? "نُسخ" : "Copied") : ar ? "نسخ" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
