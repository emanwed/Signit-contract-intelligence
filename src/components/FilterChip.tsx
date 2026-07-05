"use client";

/** Rounded toggle chip used for portfolio filters and radar windows. */
export function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="tap px-3 py-1.5"
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        borderRadius: 20,
        border: `1px solid ${on ? "var(--accent)" : "var(--border)"}`,
        background: on ? "var(--accent-soft)" : "transparent",
        color: on ? "var(--accent)" : "var(--text-soft)",
      }}
    >
      {children}
    </button>
  );
}
