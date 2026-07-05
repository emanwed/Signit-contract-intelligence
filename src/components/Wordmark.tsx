"use client";

import { useApp } from "@/context/AppContext";

// Signit brand gradient — blue (on "i"/"إ") → purple (on "t"/"ت" and squiggle).
const GRAD_FROM = "#3f6bf0";
const GRAD_TO = "#8a4ce3";

/**
 * The Signit wordmark, recreated from the brand logo and rendered in the active
 * language: "Signit" in English, "ساين إت" in Arabic. The base ("Sign" / "ساين")
 * takes the theme text colour; the tail ("it" / "إت") is filled with the
 * blue→purple brand gradient, with the signature squiggle beneath. Each script
 * gets its own writing direction so the two halves stay correctly ordered.
 */
export function Wordmark({ size = 23 }: { size?: number }) {
  const { lang } = useApp();
  const ar = lang === "ar";
  const base = ar ? "ساين " : "Sign";
  const tail = ar ? "إت" : "it";

  return (
    <span
      dir={ar ? "rtl" : "ltr"}
      className="wordmark font-display shrink-0"
      style={{ fontSize: size, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}
    >
      {base}
      <span
        style={{
          background: `linear-gradient(100deg, ${GRAD_FROM}, ${GRAD_TO})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          display: "inline-block",
        }}
      >
        {tail}
      </span>
      <svg
        className="wave"
        viewBox="0 0 64 15"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="signit-wave-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={GRAD_FROM} />
            <stop offset="1" stopColor={GRAD_TO} />
          </linearGradient>
        </defs>
        <path
          d="M2 9 C 6 4 12 4 16 8 C 19 11 24 12 27 8 C 30 4 25 3 27 8 C 29 13 41 12 47 7 C 51 4 58 6 62 3"
          stroke="url(#signit-wave-grad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
