"use client";

/**
 * Consistent page header shown at the top of every view: the page title on one
 * side and an optional primary action (e.g. New contract) on the same line,
 * with a divider beneath — mirroring the Signit product's page chrome.
 */
export function PageHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 pb-4 mb-5"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <h1
        className="font-display truncate"
        style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}
      >
        {title}
      </h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
