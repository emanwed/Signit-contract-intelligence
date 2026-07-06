"use client";

import {
  BarChart3,
  FolderClosed,
  Home,
  LayoutTemplate,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Section } from "@/lib/types";

const META: Partial<Record<Section, { Icon: LucideIcon; key: "navHome" | "navDocuments" | "navTemplates" | "navReports" }>> = {
  home: { Icon: Home, key: "navHome" },
  documents: { Icon: FolderClosed, key: "navDocuments" },
  templates: { Icon: LayoutTemplate, key: "navTemplates" },
  reports: { Icon: BarChart3, key: "navReports" },
};

/**
 * Shown for the real Signit sections that exist in the product but are out of
 * scope for this prototype. Clickable in the nav, but the content explains that
 * only "Contract Intelligence" is actually built here.
 */
export function Placeholder({ section }: { section: Section }) {
  const { L, lang } = useApp();
  const meta = META[section] ?? META.home!;
  const Icon = meta.Icon;

  return (
    <div
      className="flex flex-col items-center justify-center text-center mx-auto"
      style={{ minHeight: "60vh", maxWidth: 460, gap: 6 }}
    >
      <div
        className="flex items-center justify-center rise"
        style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: "var(--surface-alt)",
          marginBottom: 8,
          position: "relative",
        }}
      >
        <Icon size={34} color="var(--text-soft)" />
        <span
          className="flex items-center justify-center"
          style={{
            position: "absolute",
            insetInlineEnd: -6,
            bottom: -6,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Lock size={15} color="var(--accent)" />
        </span>
      </div>

      <div
        className="inline-flex items-center gap-1.5 mt-1"
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: "var(--accent)",
          background: "var(--accent-soft)",
          borderRadius: 20,
          padding: "3px 10px",
        }}
      >
        {L.notBuiltTitle}
      </div>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-soft)",
          lineHeight: 1.7,
          marginTop: 10,
        }}
      >
        {L.notBuiltBody}
      </p>
      <p style={{ fontSize: 12.5, color: "var(--text-soft)", marginTop: 4 }}>
        {lang === "ar"
          ? "افتح «العقود» من القائمة لتجربة الميزة المُطبّقة."
          : "Open “Contracts” from the menu to explore the built feature."}
      </p>
    </div>
  );
}
