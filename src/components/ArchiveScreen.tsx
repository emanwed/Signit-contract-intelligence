"use client";

import { useState } from "react";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { money } from "@/lib/format";
import { FilterChip } from "./FilterChip";
import type { Contract } from "@/lib/types";

type Bin = "deleted" | "archived";

/**
 * Trash + Archive: deleting a contract never loses it — it lands here. From the
 * trash it can be restored to the portfolio or archived for long-term keeping;
 * archived contracts can still be restored.
 */
export function ArchiveScreen() {
  const { lang, L } = useApp();
  const { deletedContracts, archivedContracts, restoreContract, archiveContract } =
    useContracts();
  const [bin, setBin] = useState<Bin>("deleted");

  const list = bin === "deleted" ? deletedContracts : archivedContracts;

  return (
    <div className="max-w-[760px] mx-auto">
      <p style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.7, marginBottom: 12 }}>
        {L.archiveIntro}
      </p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <FilterChip on={bin === "deleted"} onClick={() => setBin("deleted")}>
          {L.binDeleted} · {deletedContracts.length}
        </FilterChip>
        <FilterChip on={bin === "archived"} onClick={() => setBin("archived")}>
          {L.binArchived} · {archivedContracts.length}
        </FilterChip>
      </div>

      {list.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center gap-2"
          style={{
            padding: "38px 24px",
            color: "var(--text-soft)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
          }}
        >
          {bin === "deleted" ? <Trash2 size={22} /> : <Archive size={22} />}
          <span style={{ fontSize: 13 }}>
            {bin === "deleted" ? L.binDeletedEmpty : L.binArchivedEmpty}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((c) => (
            <Row
              key={c.id}
              c={c}
              lang={lang}
              bin={bin}
              onRestore={() => restoreContract(c.id)}
              onArchive={() => archiveContract(c.id)}
              restoreLabel={L.restore}
              archiveLabel={L.archiveAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({
  c,
  lang,
  bin,
  onRestore,
  onArchive,
  restoreLabel,
  archiveLabel,
}: {
  c: Contract;
  lang: "ar" | "en";
  bin: Bin;
  onRestore: () => void;
  onArchive: () => void;
  restoreLabel: string;
  archiveLabel: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>
          {lang === "ar" ? c.title_ar : c.title_en}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
          {c.id} · {lang === "ar" ? c.party_ar : c.party_en}
          {c.valueSAR ? ` · ${money(c.valueSAR, lang)}` : ""}
        </div>
      </div>
      <button
        onClick={onRestore}
        className="tap flex items-center gap-1.5 shrink-0"
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: "var(--accent)",
          background: "var(--accent-soft)",
          border: "1px solid var(--border)",
          borderRadius: 9,
          padding: "6px 11px",
        }}
      >
        <RotateCcw size={14} className="rtl-flip" /> {restoreLabel}
      </button>
      {bin === "deleted" && (
        <button
          onClick={onArchive}
          className="tap flex items-center gap-1.5 shrink-0"
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--text-soft)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 9,
            padding: "6px 11px",
          }}
        >
          <Archive size={14} /> {archiveLabel}
        </button>
      )}
    </div>
  );
}
