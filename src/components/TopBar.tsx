"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  Globe,
  Lock,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Notifications } from "./Notifications";
import type { Alert } from "@/lib/alerts";
import { PROTOTYPE_BAR_H } from "./PrototypeBar";

const ACCOUNT = {
  name: "Eman Wed",
  email: "emanwed@gmail.com",
  initials: "EW",
};

/** Sticky product top bar: sidebar toggle, breadcrumb, and the account menu. */
export function TopBar({
  crumbs,
  onMenu,
  onToggleCollapse,
  onNotBuilt,
  onOpenAlert,
}: {
  crumbs: { label: string; onClick: () => void }[];
  onMenu: () => void;
  onToggleCollapse: () => void;
  onNotBuilt: (label: string) => void;
  onOpenAlert: (a: Alert) => void;
}) {
  const { L, plan, setUpgradeOpen } = useApp();
  const free = plan === "free";

  return (
    <header
      className="sticky z-40"
      style={{
        top: PROTOTYPE_BAR_H,
        background: "color-mix(in srgb, var(--bg) 93%, transparent)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="tap md:hidden flex items-center justify-center shrink-0"
          style={iconBtn}
        >
          <Menu size={18} />
        </button>
        <button
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          className="tap hidden md:flex items-center justify-center shrink-0"
          style={iconBtn}
        >
          <PanelLeft size={17} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && (
                  <span style={{ fontSize: 13, color: "var(--text-soft)" }} aria-hidden>
                    ›
                  </span>
                )}
                <button
                  onClick={c.onClick}
                  className={`crumb-link ${last ? "truncate" : "hidden sm:inline"}`}
                  aria-current={last ? "page" : undefined}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: last ? "var(--text)" : "var(--text-soft)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              </span>
            );
          })}
        </nav>

        <div className="flex-1" />

        {free && (
          <button
            onClick={() => setUpgradeOpen(true)}
            className="tap hidden md:flex items-center gap-2 shrink-0"
            style={{
              background: "linear-gradient(90deg, var(--accent-soft), #fff5d6)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              paddingInlineStart: 12,
              paddingInlineEnd: 4,
              paddingBlock: 4,
            }}
          >
            <Sparkles size={14} color="var(--accent)" className="shrink-0" />
            <span
              className="whitespace-nowrap lg:inline hidden"
              style={{ fontSize: 12, color: "var(--text)" }}
            >
              {L.freeBanner}
            </span>
            <span
              className="shrink-0 whitespace-nowrap"
              style={{
                background: "var(--cta)",
                color: "var(--cta-ink)",
                borderRadius: 999,
                padding: "5px 11px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {L.upgradePro}
            </span>
          </button>
        )}

        <Notifications onOpenAlert={onOpenAlert} />
        <AccountMenu onNotBuilt={onNotBuilt} />
      </div>
    </header>
  );
}

const iconBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  border: "1px solid var(--border)",
  borderRadius: 10,
  background: "var(--surface)",
  color: "var(--text)",
};

/** User chip + dropdown: profile links (placeholders), working language & theme. */
function AccountMenu({ onNotBuilt }: { onNotBuilt: (label: string) => void }) {
  const { L, lang, dark, toggleLang, toggleTheme } = useApp();
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

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ACCOUNT.name}
        className="tap flex items-center gap-2 pe-2 ps-1 py-1"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          background: "var(--surface)",
        }}
      >
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {ACCOUNT.initials}
        </span>
        <span className="hidden sm:block text-start leading-tight min-w-0">
          <span
            className="block truncate"
            style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}
          >
            {ACCOUNT.name}
          </span>
          <span
            className="block truncate"
            style={{ fontSize: 11, color: "var(--text-soft)" }}
          >
            {ACCOUNT.email}
          </span>
        </span>
        <ChevronDown
          size={15}
          color="var(--text-soft)"
          className="shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="rise"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            insetInlineEnd: 0,
            minWidth: 236,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "var(--shadow)",
            padding: 6,
            zIndex: 60,
          }}
        >
          <MenuItem
            icon={User}
            label={L.accMyAccount}
            locked
            onClick={() => {
              close();
              onNotBuilt(L.accMyAccount);
            }}
          />
          <MenuItem
            icon={CreditCard}
            label={L.accBilling}
            locked
            onClick={() => {
              close();
              onNotBuilt(L.accBilling);
            }}
          />

          <Divider />

          {/* Working: language switch — shows the language you'd switch to */}
          <MenuItem
            icon={Globe}
            label={lang === "ar" ? "English" : "العربية"}
            onClick={() => {
              toggleLang();
              close();
            }}
          />
          {/* Working: theme switch — shows the mode you'd switch to */}
          <MenuItem
            icon={dark ? Sun : Moon}
            label={dark ? L.accLight : L.accDark}
            onClick={() => {
              toggleTheme();
              close();
            }}
          />

          <Divider />

          <MenuItem
            icon={LogOut}
            label={L.accLogout}
            locked
            onClick={() => {
              close();
              onNotBuilt(L.accLogout);
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  locked = false,
}: {
  icon: typeof User;
  label: string;
  onClick: () => void;
  /** Feature exists in Signit but isn't built in this prototype. */
  locked?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="tap w-full flex items-center gap-3 px-2.5 py-2 text-start"
      style={{ borderRadius: 9, fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}
    >
      <Icon size={17} color="var(--text-soft)" className="shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {locked && (
        <Lock
          size={12}
          color="var(--text-soft)"
          className="shrink-0"
          style={{ opacity: 0.65 }}
        />
      )}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ height: 1, background: "var(--border)", margin: "5px 6px" }} />
  );
}
