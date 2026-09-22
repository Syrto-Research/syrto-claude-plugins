---
name: briefing
description: >
  Fast lane: a compact commercial profile for one or more companies, built on the same Syrto +
  core commercial backbone as company-analysis but lighter and quicker. Two input modes: (a)
  CALENDAR — auto-profile the companies in the day's meetings (a date/today), also schedulable as
  a routine; (b) SPOT — one or more named companies. Combines Syrto data (anagrafica, struttura,
  analisi finanziaria, Fit Score) with web intelligence on person, services and relevant
  news (deal, M&A, investimenti), then talking points. Trigger: "briefing di oggi", "prepara le
  call", "briefing", "profila le call di oggi", "cosa ho oggi" (calendar) and "briefing di
  [azienda]", "briefing compatto su X", "prepara la call con X" (spot), or automatic execution via
  scheduled task. Se l'azienda non è su Syrto, produce comunque un profilo web-only. For the full
  formalized report at a chosen depth, use `company-analysis` (with its taglio commerciale dial).
metadata:
  version: "2.0.0"
---

## PRECONDITION — user profile required (do this FIRST)
# Briefing (fast lane)

## Suite integration (read first)
Follow `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (method, memory, output, efficiency, handoff) and `${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md` (tools + metrics). Reuse any upstream `SYRTO-HANDOFF` before calling Syrto; emit one when you feed another skill. Prerequisites: the Syrto connector and, for the calendar mode, a calendar connector (whichever the user has connected — e.g. Outlook or Google Calendar) must be connected.

This is the **fast lane** — a quick, compact commercial profile, lighter than `company-analysis`.
Use it for call-prep and speed. When the user wants the full formalized report at a chosen depth,
route to `company-analysis` (its **taglio commerciale** dial gives the same commercial reading in a
richer report).

## Input modes
- **Calendar** — profile the companies in the day's meetings for a target date (auto, and schedulable as a routine via `/setup-briefing`). Triggers: "briefing di oggi", "prepara le call", "profila le call di oggi", "cosa ho oggi", or a scheduled task.
- **Spot** — one or more named companies, no calendar. Triggers: "briefing di [azienda]", "briefing compatto su X", "prepara la call con X". Skip Steps 1–2 (calendar) and go straight to Syrto + web enrichment for the named company; ask the meeting person's name only if relevant and not given; produce a single card.

## Read your context first

Read the seller's context from **memory**, never from a hardcoded file:
- `/areas/syrto-commercial-context.md` — what the user sells, ICP / target, products-services catalogue,
  target revenue band, spend hook + capture rate, exclusions. Serve per generare i talking
  points e la logica "cosa proporgli" coerente con `company-analysis` (taglio commerciale).
- `/profile.md` — tone and numeric depth (calibration of the deliverable).

If a needed field is missing, **proceed with a lighter briefing** (company read + web
intelligence, generic talking points) and note the gap **once**, inviting the user to complete
their memory profile. Do not invent products, ICP or pricing.

## Workflow

### Step 1 — Read the calendar (calendar mode only)

Read the day's meetings from the user's connected calendar (e.g. Outlook or Google Calendar) using its calendar search/list tool, for the **target date**:
- Scheduled evening run → the **next working day**:
  - Mon–Thu evening → tomorrow
  - Friday evening → **Monday** (skip Saturday/Sunday)
- Manual run (`/briefing-now`, or "briefing di oggi") → **today** (unless a different date/argument is given)

The `target_date` parameter is passed by the command that invokes the skill; if absent, default = today. In **spot mode** (a named company is given), skip this step.

Keep only meetings with **external participants** (the user's own domain is internal).
Infer the internal domain from `/profile.md` / `/areas/syrto-commercial-context.md` (or the organizer's
address); do not hardcode a specific company domain.

### Step 2 — Extract company and person from each meeting (calendar mode only)

For each meeting, extract:

**Company name** — parse the subject with these patterns (in priority order):
1. `"<Host> <> NomeAzienda"` (host = the user's company, from memory)
2. `"<Host> x NomeAzienda"`
3. `"Meeting con NomeAzienda"` / `"Call con NomeAzienda"` / `"Intro NomeAzienda"`
4. `"NomeAzienda — topic"` or `"NomeAzienda | topic"`
5. **Fallback**: take the email domain of the first external participant, strip the TLD,
   capitalize → candidate company name.

**Person name** — the display name of the first external participant on the invite. If absent,
use the email prefix (nome.cognome → Nome Cognome).

**Time and type** — start time, duration, and whether it is a first call or follow-up (subject
keywords: "intro", "demo", "follow-up", "allineamento", "recap").

Build a list of meeting objects:
```
{ ora, durata, tipo, nome_azienda, nome_persona, email_persona, subject_originale }
```

### Step 3 — Syrto enrichment (per company)

Follow the robustness and efficiency rules in `core.md`. For batches of companies
on the same metrics, prefer `syrto_compare_companies` (one read for the whole group); run
semantic/find calls sequentially, not many in parallel, to avoid timeouts. For larger sets,
split into blocks.

For each unique company:
1. **`syrto_find_company`** with the name (strip legal suffixes: S.r.l., S.p.A., etc.), or
   `syrto_lookup_companies_by_tax_id` when a P.IVA/CF is available or the name is ambiguous.
2. If found:
   - **`syrto_get_company_anagraphic`** → sede, ATECO, real activity, sito, dimensione, dipendenti, mercato di riferimento (the business model comes from here, never the web).
   - **`syrto_get_company_analysis`** with **`include_market_data: true`** → the pre-grouped read (profitability, liquidity, solvency, structure + radar + 2-year trajectory) plus a free sector benchmark in a single call. Reach for `syrto_get_company_metrics` only for slugs outside those categories (e.g. the exact spend-hook slug, `revenue_cagr_3_years`, `current_ratio`) or a longer history.
   - **`syrto_get_company_structure`** → tipo di controllo, soci, titolari effettivi — quando conta per capire chi controlla il budget (gruppo / holding).
3. If **not found** on Syrto → mark `syrto_missing: true` and proceed web-only (Step 4).

### Step 4 — Web enrichment (per company/meeting)

Three web searches with `WebSearch` per meeting (web adds commercial colour only; it never
classifies the business or judges the finances):

- **4a. Person** (calendar mode / when a person is known) — query `"Nome Cognome" "Nome Azienda"`: current role, seniority, professional
  background, public statements/articles/events. Synthesize in 3–5 lines.
- **4b. Company services (detail)** — query `"Nome Azienda" servizi OR services OR solutions`:
  which practices, industries, deliverables. If Syrto has the activity overview, use it as the
  base and enrich; if the company is not on Syrto, this is the primary source.
- **4c. News & deals** — query `"Nome Azienda" news OR acquisizione OR M&A OR deal OR investimento OR round`
  (last 12 months): closed corporate-finance deals, acquisitions, funding rounds, strategic
  partnerships. If none, fall back to a sector trend — still a good talking point.

### Step 5 — Fit read (same backbone as company-analysis, taglio commerciale)

For each company found on Syrto, produce the fit read with `core.md`:
the **same Fit Score (0–100)**, the **same spend-capacity estimate** (spend-hook
metric × capture rate from memory) and the **same verdict tier** (Strong fit / Qualified /
Monitor / Out of target / Insufficient data). A company briefed here and later analysed by
`company-analysis` (taglio commerciale) must show the same score and info. Never a bare score — follow it
with the 1–2 sentence narrative naming the main drivers and the main drag. First time a score
appears in a conversation, briefly explain its composition per the method.

### Step 6 — Talking points

For each meeting/company, from all data gathered (Syrto + fit read + web + memory context), produce
3–4 **concrete** talking points:
- **Specific** — tie a Syrto datum or a news item to a concrete need.
- **Product-fit ("cosa proporgli")** — draw on the products/services catalogue in
  `/areas/syrto-commercial-context.md`, the same logic `company-analysis`'s commercial cut uses for its "Cosa proporgli"
  block: map which offering this company is in target for and the hook, tied to a finding
  (growth, margin headroom, leverage, size, supplier base). If no catalogue is in memory, skip
  the product mapping (do not invent products) and keep the points generic.
- **Actionable** — what to say, what to ask, which pain point to touch.
Respect exclusions from memory; flag distress signals (negative equity, current ratio < 1,
losses + decline) explicitly even if other dimensions look good.

### Step 7 — Deliverable

Render the briefing as a **formalized deliverable per `${CLAUDE_PLUGIN_ROOT}/shared/core.md`**:
default **HTML** built from the canon tokens (from `/preferences.md` in memory, else the neutral
default), then offer the **PDF** ("vuoi anche il PDF?"), plus a **chat digest** carrying the
essentials (meetings/companies, fit verdicts, key talking point) so value lands without opening
the file. Keep it compact — this is the fast lane. Do **not** hand-build a self-contained inline-CSS
HTML template — use the shared canon.

Each meeting/company is one **card** with this content/structure, ordered by meeting time (calendar mode):
- **Person** — name, role, 3–5 line bio from web (or "Profilo non disponibile pubblicamente"). Omit in spot mode when no person is given.
- **Company profile** — ragione sociale, sede, sector/activity, size + employees (from Syrto
  anagraphic), enriched with the web detail on services. If not on Syrto, show a "profilo
  web-only" note and build the profile from the web.
- **Key financials + fit read** — the recent-year figures that matter (e.g. Ricavi + YoY,
  EBITDA margin, D/E, efficiency/size scores, ownership) and the **Fit Score + verdict**
  from Step 5. Omit the financial block entirely when the company is not on Syrto.
- **Web intelligence** — recent news (deals, M&A, investments) or the sector trend fallback.
- **Talking points** — the 3–4 points from Step 6.

Monetary values in European format (`€12,3M`). Use the most recent Syrto year available.

At the **end** of the deliverable, emit a `SYRTO-HANDOFF` block (per `core.md`,
chain `briefing→company-analysis`) listing the profiled companies with resolved ids,
anagraphic, metrics and the fit result, so downstream skills (`company-analysis`, `outreach-writer`) reuse the same data.

### Step 8 — Save and present

Save the HTML as `briefing-YYYY-MM-DD.html` in the outputs folder, use `present_files`
to share it, offer the PDF, and report in chat: companies/meetings profiled, verdicts, any company not
found on Syrto.

## Edge Cases

**No meetings** (calendar mode): minimal deliverable / chat note — "Nessun meeting con esterni in agenda per la
data. Buona giornata!" — and suggest a spot briefing ("briefing di [azienda]") or `/briefing-now` to profile a specific company.

**Internal-only meetings**: skip — the briefing is for external calls.

**Cancelled / declined meetings**: skip; include only confirmed or tentative.

**All-day events**: skip (typically reminders, not calls). Include only timed meetings.

**Same company in several meetings**: profile the company once, but show a separate card per
meeting (different people = different talking points).

**Ambiguous company**: if `syrto_find_company` returns several candidates and you cannot
disambiguate, prefer the one whose sede + ATECO best fits the context; if still ambiguous, show
the best match with a "Possibile omonimia — verificare" note. When a P.IVA/CF is available, use
`syrto_lookup_companies_by_tax_id` for an unambiguous match.

**Person not findable online**: "Profilo non disponibile pubblicamente"; still show name, email
and any role inferable from the invite.

**Web search fails / times out**: proceed with Syrto data only; note "Ricerca web non disponibile".

## Efficiency

Keep the read lean: `syrto_get_company_analysis` with `include_market_data: true` covers most of
the company read in one call; `syrto_compare_companies` reads a batch in one call. Web searches
carry no Syrto cost. Fetch only what each card needs — don't loop per-company for data a single
compare call returns.
