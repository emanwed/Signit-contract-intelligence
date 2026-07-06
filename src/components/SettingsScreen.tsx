"use client";

import { useRef } from "react";
import {
  Briefcase,
  Building2,
  CalendarClock,
  Coins,
  Copyright,
  Fingerprint,
  FileText,
  Gavel,
  Landmark,
  Lock,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useSettings } from "@/context/SettingsContext";
import {
  CHECK_DEFS,
  checkDesc,
  checkLabel,
  isProCheck,
  type CheckDef,
  type CheckId,
} from "@/lib/compliance";

const ICON: Record<CheckId, LucideIcon> = {
  pdpl: ShieldCheck,
  zatca: ReceiptText,
  laborLaw: Briefcase,
  companiesLaw: Building2,
  govTenders: Landmark,
  antiBribery: ShieldAlert,
  saudization: Users,
  ipProtection: Copyright,
  cybersecurity: Fingerprint,
  aml: Coins,
  liabilityFloor: Scale,
  jurisdiction: Gavel,
  renewalNotice: CalendarClock,
};

const fmtSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Product setup: which compliance/playbook checks apply + company documents. */
export function SettingsScreen() {
  const { lang, L, plan, setUpgradeOpen } = useApp();
  const free = plan === "free";
  const {
    checks,
    toggleCheck,
    companyDocs,
    addCompanyDocs,
    removeCompanyDoc,
    toggleCompanyDoc,
  } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const regulations = CHECK_DEFS.filter((d) => d.group === "regulation");
  const playbook = CHECK_DEFS.filter((d) => d.group === "playbook");

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).map((f) => ({
      name: f.name,
      size: f.size,
    }));
    if (files.length) addCompanyDocs(files);
    e.target.value = "";
  };

  return (
    <div className="max-w-[760px] mx-auto">
      <p
        style={{
          fontSize: 14,
          color: "var(--text-soft)",
          lineHeight: 1.7,
        }}
      >
        {L.setIntro}
      </p>

      <Card title={L.setRegulations}>
        {regulations.map((d) => (
          <CheckRow
            key={d.id}
            def={d}
            lang={lang}
            on={checks[d.id]}
            onToggle={() => toggleCheck(d.id)}
            locked={free && isProCheck(d.id)}
            onUpgrade={() => setUpgradeOpen(true)}
            proLabel={L.planPaid}
          />
        ))}
      </Card>

      <Card title={L.setPlaybook}>
        {playbook.map((d) => (
          <CheckRow
            key={d.id}
            def={d}
            lang={lang}
            on={checks[d.id]}
            onToggle={() => toggleCheck(d.id)}
            locked={free && isProCheck(d.id)}
            onUpgrade={() => setUpgradeOpen(true)}
            proLabel={L.planPaid}
          />
        ))}
      </Card>

      <Card title={L.setCompanyDocs}>
        <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 12 }}>
          {L.setCompanyDocsHint}
        </div>

        {free ? (
          <button
            onClick={() => setUpgradeOpen(true)}
            className="tap w-full flex items-start gap-2 p-3.5 text-start"
            style={{
              background: "var(--accent-soft)",
              border: "1px dashed var(--accent)",
              borderRadius: 12,
              color: "var(--accent)",
            }}
          >
            <Lock size={16} className="shrink-0" style={{ marginTop: 1 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.6 }}>
              {lang === "ar"
                ? "رفع مستندات سياسات الشركة الداخلية ومراجعة العقود عليها متاح في الخطة الاحترافية."
                : "Uploading internal company policy documents and reviewing against them is a Pro feature."}
            </span>
          </button>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={onFiles}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="tap w-full flex items-center justify-center gap-2 py-3"
              style={{
                border: "1.5px dashed var(--border)",
                borderRadius: 12,
                background: "var(--bg)",
                color: "var(--accent)",
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              <Upload size={17} /> {L.setUpload}
            </button>

            <div className="mt-3 flex flex-col gap-2">
              {companyDocs.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--text-soft)", padding: "6px 2px" }}>
                  {L.setNoDocs}
                </div>
              )}
              {companyDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-2.5"
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    background: "var(--surface)",
                    opacity: doc.enabled ? 1 : 0.55,
                  }}
                >
                  <button
                    onClick={() => removeCompanyDoc(doc.id)}
                    aria-label={L.remove}
                    className="tap flex items-center justify-center shrink-0"
                    style={{ width: 32, height: 32, borderRadius: 8, color: "var(--low)" }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: doc.enabled ? "var(--accent-soft)" : "var(--surface-alt)",
                    }}
                  >
                    <FileText
                      size={17}
                      color={doc.enabled ? "var(--accent)" : "var(--text-soft)"}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-soft)" }}>
                      {fmtSize(doc.size)} ·{" "}
                      {doc.enabled
                        ? lang === "ar"
                          ? "مُفعّل"
                          : "Applied"
                        : lang === "ar"
                          ? "معطّل"
                          : "Off"}
                    </div>
                  </div>
                  <Switch
                    on={doc.enabled}
                    onToggle={() => toggleCompanyDoc(doc.id)}
                    label={doc.name}
                    mt={0}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <div
        className="flex items-start gap-2 mt-4 p-3"
        style={{
          background: "var(--accent-soft)",
          borderRadius: 12,
          fontSize: 12.5,
          color: "var(--text)",
        }}
      >
        <ShieldCheck size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{L.setAppliedNote}</span>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mt-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        boxShadow: "var(--shadow)",
        padding: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}

function CheckRow({
  def,
  lang,
  on,
  onToggle,
  locked = false,
  onUpgrade,
  proLabel,
}: {
  def: CheckDef;
  lang: "ar" | "en";
  on: boolean;
  onToggle: () => void;
  /** Pro-only on the Free plan — shown but not usable. */
  locked?: boolean;
  onUpgrade?: () => void;
  proLabel?: string;
}) {
  const Icon = ICON[def.id];
  const inner = (
    <>
      <span
        className="flex items-center justify-center shrink-0"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: !locked && on ? "var(--accent-soft)" : "var(--surface-alt)",
        }}
      >
        <Icon size={18} color={!locked && on ? "var(--accent)" : "var(--text-soft)"} />
      </span>
      <div className="min-w-0 flex-1">
        <div style={{ fontSize: 14, fontWeight: 600 }}>{checkLabel(def, lang)}</div>
        <div
          style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.6, marginTop: 2 }}
        >
          {checkDesc(def, lang)}
        </div>
      </div>
      {locked ? (
        <span
          className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--accent)",
            background: "var(--accent-soft)",
            borderRadius: 999,
            padding: "3px 9px",
            marginTop: 6,
          }}
        >
          <Sparkles size={12} /> {proLabel}
        </span>
      ) : (
        <Switch on={on} onToggle={onToggle} label={checkLabel(def, lang)} />
      )}
    </>
  );

  if (locked) {
    return (
      <button
        onClick={onUpgrade}
        className="tap w-full text-start flex items-start gap-3 py-3"
        style={{
          borderTop: "1px solid var(--border)",
          background: "none",
          border: "none",
          borderTopWidth: 1,
          borderTopStyle: "solid",
          borderTopColor: "var(--border)",
          cursor: "pointer",
        }}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      {inner}
    </div>
  );
}

function Switch({
  on,
  onToggle,
  label,
  mt = 6,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  mt?: number;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="shrink-0"
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        background: on ? "var(--accent)" : "var(--surface-alt)",
        border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
        position: "relative",
        transition: "background .2s",
        cursor: "pointer",
        marginTop: mt,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          insetInlineStart: on ? 20 : 2,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: "#fff",
          transition: "inset-inline-start .2s",
          boxShadow: "0 1px 2px rgba(0,0,0,.25)",
        }}
      />
    </button>
  );
}
