"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useContracts } from "@/context/ContractsContext";
import { useNotifications } from "@/context/NotificationsContext";
import { alertTier, generateObligations, type AlertTier } from "@/lib/obligations";
import type {
  Contract,
  OverviewFilter,
  Persona,
  Section,
  TabKey,
} from "@/lib/types";
import { PrimaryNav } from "@/components/PrimaryNav";
import { SecondaryPanel } from "@/components/SecondaryPanel";
import { Placeholder } from "@/components/Placeholder";
import { PageHeader } from "@/components/PageHeader";
import { NewContractButton } from "@/components/NewContractButton";
import { SettingsScreen } from "@/components/SettingsScreen";
import { TopBar } from "@/components/TopBar";
import { PrototypeBar, PROTOTYPE_BAR_H } from "@/components/PrototypeBar";
import { Overview } from "@/components/Overview";
import { ObligationsCalendar } from "@/components/ObligationsCalendar";
import { SemanticSearch } from "@/components/SemanticSearch";
import { NotificationSettings } from "@/components/NotificationSettings";
import { AskFab } from "@/components/AskFab";
import { Drawer } from "@/components/Drawer";
import { AlertDetail } from "@/components/AlertDetail";
import { AddContractModal } from "@/components/AddContractModal";
import { FreeBanner, ProGate } from "@/components/PlanGate";
import { PlanCompareModal } from "@/components/PlanCompare";
import { MakeRoomModal } from "@/components/MakeRoomModal";
import { contractStatus } from "@/lib/status";
import { FREE_UPLOAD_LIMIT } from "@/lib/plan";
import type { Alert } from "@/lib/alerts";
import type { Dict } from "@/lib/i18n";

const SECTION_LABEL: Record<
  "home" | "documents" | "templates" | "reports",
  "navHome" | "navDocuments" | "navTemplates" | "navReports"
> = {
  home: "navHome",
  documents: "navDocuments",
  templates: "navTemplates",
  reports: "navReports",
};

// Tab keys don't all match their Dict label keys (obligations→obTab, search→ssTab).
const TAB_LABEL: Record<TabKey, keyof Dict> = {
  overview: "overview",
  obligations: "obTab",
  search: "ssTab",
  notifications: "notifications",
  notifsettings: "notifSettingsTab",
  settings: "complianceTab",
};

export default function Page() {
  const { lang, L, plan, upgradeOpen, setUpgradeOpen } = useApp();
  const { contracts } = useContracts();
  const { getState } = useNotifications();
  const free = plan === "free";

  const [section, setSection] = useState<Section>("contracts");
  const [persona, setPersona] = useState<Persona>("exec");
  const [tab, setTab] = useState<TabKey>("overview");
  const [active, setActive] = useState<Contract | null>(null);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [filter, setFilter] = useState<OverviewFilter>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [makeRoomOpen, setMakeRoomOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerNavOpen, setDrawerNavOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Free tier is capped at 3 active contracts. Active contracts drive the cap,
  // and hitting "add" while at the cap prompts the user to delete one first.
  const activeContracts = useMemo(
    () => contracts.filter((c) => contractStatus(c) === "active"),
    [contracts],
  );
  const freeAtLimit = free && activeContracts.length >= FREE_UPLOAD_LIMIT;
  const startAdd = () =>
    freeAtLimit ? setMakeRoomOpen(true) : setAddOpen(true);

  // Action Center badge — counts exactly the open actions shown in مركز الإجراءات
  // for this plan and lens (same gating as the list, minus its ad-hoc filters).
  const openActions = useMemo(() => {
    const personaTeam = free
      ? null
      : persona === "proc"
        ? "Procurement"
        : persona === "legal"
          ? "Legal Team"
          : null;
    const FREE_TIERS = new Set<AlertTier>(["overdue", "d1", "d7"]);
    return generateObligations(contracts).filter((o) => {
      const st = getState(`ob-${o.id}`);
      if (st.done) return false;
      if (personaTeam && (st.assignee ?? o.owner) !== personaTeam) return false;
      if (free && !FREE_TIERS.has(alertTier(o.daysLeft))) return false;
      return true;
    }).length;
  }, [contracts, free, persona, getState]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 2800);
    return () => clearTimeout(id);
  }, [notice]);

  const isContracts = section === "contracts";
  // Free tier is a single-lens (Executive) product; other lenses are Pro.
  const effPersona: Persona = free ? "exec" : persona;

  const onSection = (s: Section) => {
    setSection(s);
    setActive(null);
    setDrawerNavOpen(false);
    // Entering a section always lands on its first secondary tab.
    setTab("overview");
    // Picking a primary item expands the rail (no-op if already open).
    setCollapsed(false);
  };
  const onTab = (t: TabKey) => {
    setTab(t);
    setActive(null);
    setDrawerNavOpen(false);
    // Drilling into a secondary item collapses the rail for more room.
    setCollapsed(true);
  };
  const onPersona = (p: Persona) => {
    setPersona(p);
    setFilter(null);
  };
  const notBuilt = (label: string) => setNotice(label);

  // Each breadcrumb navigates to its page: brand → Home, section → its section,
  // tab → its tab.
  const goRoot = () => onSection("home");
  const goContractsHome = () => {
    onSection("contracts");
    setTab("overview");
  };
  const crumbs: { label: string; onClick: () => void }[] = isContracts
    ? [
        { label: L.name, onClick: goRoot },
        { label: L.navContracts, onClick: goContractsHome },
        { label: L[TAB_LABEL[tab]] as string, onClick: () => onTab(tab) },
      ]
    : [
        { label: L.name, onClick: goRoot },
        {
          label:
            L[
              SECTION_LABEL[
                section as "home" | "documents" | "templates" | "reports"
              ]
            ],
          onClick: () => onSection(section),
        },
      ];
  const pageTitle = crumbs[crumbs.length - 1].label;
  // The New action lives on the header of the pages where adding applies.
  const showNewAction =
    (isContracts && tab !== "settings") ||
    section === "home" ||
    section === "documents";

  const primaryProps = {
    section,
    onSection,
    // "New document" runs the same flow as "New contract" (add a signed contract).
    onNewDocument: startAdd,
    onNotBuilt: notBuilt,
  };
  const secondaryProps = {
    tab,
    onTab,
    actionCount: openActions,
  };

  return (
    <div className="min-h-screen">
      {/* Prototype-testing strip (outside the product design) */}
      <PrototypeBar persona={effPersona} onPersona={onPersona} />

      <div className="flex">
        {/* Layer 1 — primary rail */}
        <aside
          className="hidden md:flex flex-col shrink-0 sticky overflow-y-auto scroll-slim"
          style={{
            top: PROTOTYPE_BAR_H,
            height: `calc(100vh - ${PROTOTYPE_BAR_H}px)`,
            width: collapsed ? 68 : 232,
            background: "var(--surface)",
            borderInlineEnd: "1px solid var(--border)",
            transition: "width .2s ease",
          }}
        >
          <PrimaryNav {...primaryProps} collapsed={collapsed} />
        </aside>

        {/* Layer 2 — secondary panel (contracts only, ≥md) */}
        {isContracts && (
          <aside
            className="hidden md:flex flex-col shrink-0 sticky overflow-y-auto scroll-slim"
            style={{
              top: PROTOTYPE_BAR_H,
              height: `calc(100vh - ${PROTOTYPE_BAR_H}px)`,
              width: 236,
              background: "var(--surface)",
              borderInlineEnd: "1px solid var(--border)",
            }}
          >
            <SecondaryPanel {...secondaryProps} />
          </aside>
        )}

        {/* Main column */}
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar
            crumbs={crumbs}
            onMenu={() => setDrawerNavOpen(true)}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            onNotBuilt={notBuilt}
            onOpenAlert={setActiveAlert}
          />

        <main className="flex-1 w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-6">
          <PageHeader
            title={pageTitle}
            action={
              showNewAction ? (
                <NewContractButton compact onClick={startAdd} />
              ) : undefined
            }
          />
          {isContracts ? (
            <>
              {free &&
                tab !== "settings" &&
                tab !== "search" && <FreeBanner />}
              {tab === "overview" && (
                <Overview
                  persona={effPersona}
                  filter={filter}
                  setFilter={setFilter}
                  onOpen={setActive}
                  onTab={onTab}
                />
              )}
              {tab === "search" &&
                (free ? (
                  <ProGate title={L.ssTab} body={L.ssIntro} />
                ) : (
                  <SemanticSearch onOpen={setActive} />
                ))}
              {tab === "notifications" && (
                <ObligationsCalendar
                  persona={effPersona}
                  onOpenAlert={setActiveAlert}
                />
              )}
              {tab === "notifsettings" && <NotificationSettings />}
              {tab === "settings" && <SettingsScreen />}
            </>
          ) : (
            <Placeholder section={section} />
          )}
        </main>

        <footer
          className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-6"
          style={{
            color: "var(--text-soft)",
            fontSize: 12,
            borderTop: "1px solid var(--border)",
          }}
        >
          {L.name} · {L.tag} —{" "}
          {lang === "ar"
            ? "نموذج أولي للعرض · بيانات تجريبية واقعية"
            : "Prototype demo · realistic sample data"}
        </footer>
      </div>

      {/* Floating Ask (contract intelligence only) */}
      {isContracts && <AskFab onOpenContract={setActive} tab={tab} />}

      {active && <Drawer c={active} onClose={() => setActive(null)} />}

      {activeAlert && (
        <AlertDetail
          alert={activeAlert}
          onClose={() => setActiveAlert(null)}
          onOpenContract={(c) => {
            setActiveAlert(null);
            setActive(c);
          }}
        />
      )}

      <AddContractModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={(c) => {
          setAddOpen(false);
          setSection("contracts");
          setTab("overview");
          setActive(c);
        }}
      />

      {/* Plan comparison / upgrade modal (opened by any "Upgrade" CTA) */}
      {upgradeOpen && <PlanCompareModal onClose={() => setUpgradeOpen(false)} />}

      {/* Free "make room" prompt — delete a contract to add a new one */}
      {makeRoomOpen && (
        <MakeRoomModal
          contracts={activeContracts.slice(0, FREE_UPLOAD_LIMIT)}
          onClose={() => setMakeRoomOpen(false)}
          onMadeRoom={() => {
            setMakeRoomOpen(false);
            setAddOpen(true);
          }}
          onUpgrade={() => {
            setMakeRoomOpen(false);
            setUpgradeOpen(true);
          }}
        />
      )}

      {/* Mobile nav drawer */}
      {drawerNavOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex">
          <div
            onClick={() => setDrawerNavOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)" }}
          />
          <aside
            className="rise relative flex flex-col h-full"
            style={{
              width: "min(300px, 86vw)",
              background: "var(--surface)",
              borderInlineEnd: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div className="flex justify-end p-2">
              <button
                onClick={() => setDrawerNavOpen(false)}
                aria-label="Close menu"
                className="tap flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 8, color: "var(--text-soft)" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-slim">
              <PrimaryNav {...primaryProps} collapsed={false} flat />
              {isContracts && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <SecondaryPanel {...secondaryProps} />
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Not-built toast */}
      {notice && (
        <div
          className="rise fixed z-[80] left-1/2 -translate-x-1/2"
          style={{
            bottom: 24,
            maxWidth: "calc(100vw - 32px)",
            background: "var(--text)",
            color: "var(--bg)",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "var(--shadow)",
          }}
          role="status"
        >
          {notice} — {L.notBuiltTitle}
        </div>
      )}
      </div>
    </div>
  );
}
