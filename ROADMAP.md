# Signit · Contract Intelligence — Product Roadmap

This roadmap takes the prototype in this repo (Phase 0's three hero interactions, already
working) and sequences it into a Saudi-native contract-intelligence product. Each phase names a
goal, the concrete scope, and a success metric. The **✅ / 🟡 / ⬜** markers show what this
prototype already demonstrates.

- ✅ built in this prototype  ·  🟡 partially demonstrated  ·  ⬜ future work

---

## Phase 0 — Foundation (Weeks 0–6): prove the core loop

**Goal:** validate that AI extraction + source-linked trust + plain-language query genuinely works
on real, messy Saudi contracts before investing in breadth.

- 🟡 **Bilingual (AR/EN) ingestion pipeline** — OCR for scanned PDFs, native parsing for digital
  docs, language auto-detection. *Prototype: paste-or-upload ingestion with server-side AI
  extraction (`/api/extract`) and a graceful manual fallback; production OCR still to add.*
- ✅ **Core extraction schema** — parties, value, currency, term, renewal/notice, governing law,
  liability caps, penalties — **each with a confidence score and a source-clause pointer**.
- ✅ **Three hero interactions** — source-linked confidence, dual Hijri/Gregorian obligation view,
  one dataset / three persona lenses.
- ✅ **Human-in-the-loop review queue** for low-confidence extractions.
- ⬜ **Design partner** — 1–2 mid-size enterprises on real, anonymized contract sets.
- **Success metric:** ≥90% extraction accuracy on core fields vs. lawyer-reviewed ground truth;
  review-queue confirmation rate trending down over the pilot.

## Phase 1 — Compliance-anchored MVP (Months 2–4): ride the PDPL/ZATCA urgency

**Goal:** launch the smallest version that makes a legal/compliance team's quarter measurably
easier, using regulatory deadlines as the wedge.

- 🟡 **PDPL Exposure Scanner** — flag every contract with a data-processing / cross-border /
  data-residency clause; surface those missing a legal basis, consent language, or transfer
  mechanism, mapped to PDPL Implementing Regulation articles. *Prototype: a PDPL compliance KPI +
  data-residency anomaly flags; article-level mapping is next.*
- ⬜ **ZATCA / financial-obligation view** — surface invoicing, penalty, and payment-term clauses
  relevant to e-invoicing Wave 23/24 onboarding (a bridge to procurement/finance, not a finance
  system).
- 🟡 **Anomaly detection v1** — rule-based + AI flags for loss-causing patterns: liability caps
  below contract value, missing termination cure periods, undefined penalties, auto-renewal with
  short notice. *Prototype: the Playbook comparison + anomaly flags already cover these rules.*
- ✅ **Natural-language Arabic query ("Ask Signit")** over the portfolio — grounded, source-cited,
  no hallucinated figures (also accepts Franco-Arabic / Arabizi).
- ⬜ **GTM wedge** — sell against the deadline: "know your PDPL exposure before the next audit
  wave," not "contract analytics."
- **Success metric:** time-to-answer for "which contracts are non-compliant with X" drops from
  days to minutes; first paying design partners converted.

## Phase 2 — Portfolio intelligence & multi-persona depth (Months 4–8)

**Goal:** deepen from "read my contracts" to "manage my portfolio" — where the three personas
fully diverge in daily usage.

- 🟡 **Executive dashboard** — portfolio view: total commitments, vendor concentration, category
  exposure, compliance-posture *trend over time*, board-ready export. *Prototype: the Executive
  lens shows commitments, concentration, category exposure, liability exposure; trends + export
  are next.*
- 🟡 **Procurement renewal workflow** — the Obligation Radar becomes actionable: assign renewal
  owners, log renegotiation notes, track leverage, Slack/Teams/email reminders ahead of
  notice-window closures. *Prototype: the dual-calendar Radar surfaces the windows; ownership +
  reminders are next.*
- 🟡 **Legal cross-contract comparison** — side-by-side clause comparison across similar contract
  types (e.g., all SaaS liability caps at once) to catch inconsistent terms. *Prototype: the
  Playbook checks each contract against policy; true side-by-side compare is next.*
- ⬜ **Arabic legal-language robustness** — beyond common types to fully-Arabic and notarized
  (Najiz-style) and government-standard templates.
- ⬜ **Integrations** — ingest e-signature completion events (**Signit itself**, DocuSign, Adobe
  Sign) so newly signed contracts flow in automatically — the natural bridge back into Signit's
  core platform.
- **Success metric:** portfolio-wide queries (concentration, renewal exposure, compliance %)
  become a weekly executive habit, not a quarterly fire drill.

## Phase 3 — Proactive & agentic intelligence (Months 8–14)

**Goal:** move from "answers when asked" to "surfaces risk before you ask" — where global leaders
(Ironclad agents, Evisort/Workday) are heading, but Saudi-native.

- ⬜ **Proactive obligation agent** — a weekly, per-persona "what changed / what needs attention"
  digest, prioritized by financial/legal risk.
- ⬜ **Negotiation-leverage agent** — for expiring vendor contracts, auto-assemble a briefing:
  spend history, market-rate context, past performance, comparable clause terms.
- ⬜ **Regulatory-change watch** — when SDAIA, ZATCA, NCA, or SAMA update a requirement, flag which
  existing contracts are newly exposed (e.g., a new data-transfer rule re-scans all cross-border
  clauses).
- ⬜ **Multi-entity / group support** — roll-up or subsidiary-filtered portfolio views for
  conglomerates and holding structures.
- **Success metric:** measurable reduction in missed renewal windows and PDPL-exposure incidents
  across pilot customers, cited as a retention/expansion driver.

---

### Where the prototype sits today

It is a working **Phase 0** slice with early **Phase 1–2** signal: source-linked confidence,
the dual-calendar radar, three persona lenses, the review queue, AI + Franco-Arabic Q&A, an
ingestion flow with AI extraction, and a Playbook/PDPL compliance layer. The phases above sequence
the remaining breadth (OCR, article-level PDPL/ZATCA mapping, workflows, integrations, agents)
without changing that validated core loop.
