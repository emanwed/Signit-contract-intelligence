# Signit

**Post-signature contract intelligence** — an Arabic-first, bilingual prototype built for a
product-manager assignment at Signit. It reads a portfolio of already-signed contracts and
surfaces what matters _after_ the signature: obligations coming due, anomalies to review, and every
AI-extracted fact traced back to the exact clause it came from.

Built with **Next.js (App Router) + TypeScript + Tailwind v4**, with a real **server-side Anthropic
API** route for live Q&A.

---

## Start here — 60-second reviewer path

```bash
npm install && npm run dev      # → http://localhost:3000
```

This walks the **thesis**, not the feature list. The dark strip at the very top is a
**prototype testing control** (persona + plan toggles), deliberately outside the product UI.

1. **You land on Contract Intelligence → Overview**, Arabic-first (RTL). Switch to English anytime
   from the account chip (top-right) → _Language_.
2. **Flip to Pro first.** In the top strip, switch **مجانية → احترافية (Free → Pro)** to see the
   full product. (Free is a real, enforced slice — you'll come back to it in step 8.)
3. **The hero — source-linked confidence.** Open contract **C-1042**. In the drawer, every
   AI-extracted fact carries a **confidence pill**; click any value to jump to the **exact source
   clause** it came from (Values → Document → Risk tabs). _The core idea: never trust an AI fact you
   can't verify._
4. **One dataset, three lenses.** In the top strip, switch persona — **Executive / Procurement /
   Legal**. The same contracts re-frame to each role's altitude (exposure → renewals → clauses).
5. **Obligations** tab — the org-wide calendar with **30 / 7 / 1-day** alert tiers, owners,
   email/Slack channels, and manager escalation.
6. **Semantic search** tab — type _"IP ownership"_ (EN), _"المسؤولية"_ (AR), or Franco-Arabic
   _"mas2ooleya"_ → clauses matched by **meaning**, with similarity scores.
7. **Ask Signit** (floating button) — grounded, source-cited Q&A over the portfolio, in Arabic /
   English / Franco-Arabic. Runs live with an API key, or a graceful local fallback (**demo** badge)
   without one.
8. **Toggle back to Free** to see the enforced plan-gating and the upgrade comparison — the
   monetisation story is itself a designed feature.

---

## What it does

- **Framed inside the Signit product shell.** The app uses Signit's two-layer navigation — a primary
  main menu (Home / Documents / **Contract Intelligence** / Templates / Reports) plus a contextual
  secondary panel. Only **Contract Intelligence** (our feature) is built; the other menu items are
  clickable but show an "existing Signit feature — outside this prototype's scope" placeholder.
- **Arabic-first & bilingual.** Default is Arabic (RTL); a header toggle switches to English (LTR).
  Language flips the real `dir`/`lang` attributes on `<html>` for true RTL layout mirroring.
- **Dark & light themes.** Toggled in the header, held in memory (no persistence, per the brief).
  The colour system is a set of CSS variables that flip on `[data-theme]`, so theme switching is
  instant and centralised.
- **Three persona lenses over one dataset** — Executive, Procurement/Ops, and Legal Counsel — each
  with its own KPIs and emphasis on the same contracts.
- **Source-linked confidence (the hero).** In the contract drawer, every extracted fact is tappable
  and reveals its confidence (High/Medium/Low) and the exact source clause, in the original language.
- **Dual-calendar Obligation Radar** — a timeline of upcoming renewals, dated in both **Hijri** and
  **Gregorian**, colour-escalating as the notice window closes.
- **Live "Ask Signit".** Natural-language questions hit the server route `/api/ask`, which calls
  the Anthropic API server-side. If the call fails for any reason, the UI falls back to local
  keyword matching so the demo never breaks — a badge shows **Live AI** vs **demo**.
- **Playbook comparison** — every contract is checked against a defined policy (liability-cap
  floor, preferred jurisdiction, renewal-notice floor); deviations are flagged automatically, with
  a portfolio-level **total liability exposure**, **jurisdiction coverage**, and **deviation count**
  in the Legal lens, and a per-contract playbook summary in the drawer.
- **Review queue** — human-in-the-loop confirmation of low-confidence extractions.
- **Fully responsive** — the persona switch becomes full-width equal segments on mobile, and the tab
  nav scrolls horizontally on narrow screens.

## Tech & structure

```
src/
  app/
    layout.tsx          # font (IBM Plex Sans Arabic via next/font), providers, <html> dir/theme
    page.tsx            # app shell: two-layer nav (PrimaryNav + SecondaryPanel) + top bar, content, drawer, modal
    globals.css         # Tailwind + the CSS-variable colour system + motion
    api/ask/route.ts    # server-side Anthropic call (key never reaches the client)
    api/extract/route.ts# server-side extraction of a pasted/uploaded contract
  components/           # PrimaryNav, SecondaryPanel, Placeholder, TopBar, Wordmark, Overview, Radar, AskFab, Review, Drawer, AddContractModal, …
  context/             # theme + language (AppContext) and the live portfolio (ContractsContext)
  data/contracts.ts     # typed sample portfolio
  lib/                  # i18n dictionary, domain types, formatters, confidence meta, playbook
```

Arabic copy, sample dataset, and interaction logic are ported from the reference artifact
(`reference/baseerah.jsx`); the visual identity follows the **Signit** brand — clean white surfaces,
an indigo/violet primary, and a yellow brand accent (with a matching indigo-tinted dark theme).
Tailwind handles layout/responsive utilities; the palette lives entirely in CSS variables, so the
theme flips instantly. Type is **IBM Plex Sans Arabic** throughout (full Arabic + Latin coverage).

## Run locally

Requires Node 20 or 22 LTS.

```bash
npm install
cp .env.local.example .env.local   # optional — add your Anthropic key for Live AI
npm run dev                         # http://localhost:3000
```

The key is read **only** in `src/app/api/ask/route.ts` (server-side) and never ships to the browser.
Without a key, everything works — "Ask Signit" runs the local fallback and shows the **demo** badge.

### The AI model

The live route uses `claude-sonnet-4-6` (the current workhorse Sonnet). It returns strict JSON
(`{answer_ar, answer_en, matchIds}`); the client renders the answer and highlights the matching
contracts. Swap to `claude-haiku-4-5` in `route.ts` for a cheaper/faster option.

> Note: the assignment's SETUP.md referenced `claude-sonnet-5`; this prototype standardises on
> `claude-sonnet-4-6` as a stable, widely-available workhorse for both routes.

## Deploy (Vercel)

```bash
npm i -g vercel
vercel                              # first deploy
vercel env add ANTHROPIC_API_KEY    # paste the key (Production + Preview)
vercel --prod
```

## Out of scope

No e-signature, drafting/authoring, redlining, auth/login, or document-upload/OCR pipeline — this is
a focused vertical slice of the post-signature intelligence experience.

## AI tools used

The brief encourages leaning on AI to build faster and better — this prototype was built almost
entirely through AI-assisted development, and uses AI at runtime.

**To build it**

- **Claude Code (Anthropic)** — the primary build environment. Used to scaffold the Next.js app,
  implement every feature, generate the bilingual sample-contract dataset, work through RTL/Arabic
  and Franco-Arabic (Arabizi) edge cases, and verify changes live in an in-editor browser preview.
  It also produced the accompanying **product document** and the **pitch deck**
  (`public/Signit-Product-Deck.pptx`).

**In the product (runtime AI) — `claude-sonnet-4-6` via the Anthropic API (`@anthropic-ai/sdk`)**

- `POST /api/extract` — reads a pasted/uploaded signed contract and returns typed, **source-linked**
  facts with confidence scores (the data behind the "source-linked confidence" hero).
- `POST /api/ask` — grounded, source-cited **bilingual** Q&A over the portfolio (Ask Signit),
  accepting Arabic, English, and Franco-Arabic.
- Both routes are structured for **prompt caching** (stable system + portfolio prefix, volatile
  input last) and **degrade gracefully** to deterministic local logic (with a visible **demo**
  badge) when no `ANTHROPIC_API_KEY` is set — so the prototype always runs. Keys are read
  server-side only and never reach the browser.

**Simulated (stated honestly)**

- **Semantic search** simulates the embedding → vector-DB pipeline with an in-browser concept-vector
  model + similarity scores. Production would swap in a real text-embedding model + pgvector/Pinecone
  behind the same UX.
- **Notifications & escalation** (email / Slack, manager escalation) are represented in the UI, not
  wired to live channels.
