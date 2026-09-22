---
name: company-analysis
description: >-
  Single-company financial report on an Italian company using Syrto, with TWO independent dials
  the user chooses: a depth **livello** (1 solo azienda + benchmark ATECO · 2 + mercato · 3 +
  peer · 4 completo) and a **taglio** lens — `normale` (understand the company: health, market,
  peers) or `commerciale` (qualify it for sales: Fit Score, spend capacity, product-fit,
  go/no-go). The commercial cut works at EVERY level. Use for "analisi azienda", "analizza
  [azienda]", "report [azienda]", "com'è messa [azienda]", "salute finanziaria", "dossier azienda",
  "scheda azienda" (analytical intent) AND for "profila [azienda]", "qualifica [azienda]", "è un
  buon fit", "vale la pena", "scheda finanziaria", "cosa vendergli", "should we go after [company]"
  (commercial intent). Livello 1 + taglio commerciale is the quick commercial qualification (the
  former prospects-profiler). For a fast, compact briefing (calendar or spot) use `briefing`.
metadata:
  version: "2.0.0"
---

## PRECONDITION — user profile required (do this FIRST)
# Company Analysis

## Suite integration (read first)
Follow `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (method, memory, output, efficiency, handoff) and `${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md` (tools + metrics). Reuse any upstream `SYRTO-HANDOFF` before calling Syrto; emit one when you feed another skill. This skill **composes** `market-benchmark`, `market-sizing` and `syrto-comparables` as building blocks — reuse their logic, do not re-implement it.

Prerequisite: the Syrto connector is connected.

## Read your context first
From `/profile.md`: the user's sector and role — they drive **which numbers to feature** (the sector goal from the proficiency overlay) and the language register. From memory also read `/preferences.md` if present: it stores BOTH a default **livello** (a tier, or "ask each time") AND a default **taglio** (`normale` / `commerciale`, or "ask each time"). If the sector-relevant emphasis is unclear, lean on the sector goal in `core.md`'s overlay — do not ask the user to pick metrics.

## The two dials (independent, both selectable)
Every report has two orthogonal dials. Resolve each with a smart default; either is overridable per request.

### Dial 1 — livello (depth / scope)
Four levels. On the **first** company-analysis request in memory (or every time, if `/preferences.md` says so), ask:

> Che livello di analisi vuoi per **[Azienda]**?
>
> 1. **Solo azienda** — i numeri di [Azienda] con un confronto rapido rispetto alla media del suo settore per **codice ATECO** (benchmark automatico).
> 2. **Azienda + mercato** — [Azienda] più un'analisi del mercato in cui opera, costruita su un perimetro pulito basato sulla sua **attività reale** (non sull'ATECO): dimensione, dinamiche e benchmark veri.
> 3. **Azienda + competitor** — [Azienda] a confronto con i suoi **peer diretti** (senza l'analisi di mercato).
> 4. **Completa** — azienda + mercato + competitor, il quadro intero.
>
> Da quale partiamo?

### Dial 2 — taglio (lens)
Two lenses, available at **every** level 1–4:

- **`normale`** — understand the company: financial health, market, peers. The formalized report.
- **`commerciale`** — qualify the company for sales on top of the analytical content: Fit Score, spend capacity, "perché è in target", product-fit ("Cosa proporgli"), and a go/no-go verdict.

**Ask the taglio explicitly** (alongside the livello — never infer it silently). Right after the livello question, ask:

> Lo vuoi **commerciale** (fit score in alto, perché è in target, cosa proporgli, verdetto) o **normale** (report standard: numeri, e mercato/peer secondo il livello)?

You may hint the likely fit for their profile (commerciale for sales / BD / banking-commercial / commercial intent; normale for credit / M&A / due-diligence / pure understanding), but let the user choose. Always overridable per request: *"stavolta normale"*, *"fammelo commerciale"*.

### Persisting the defaults
Right after the first run, ask **once**:

> Vuoi che questi diventino i tuoi **default** — livello **[N]** e taglio **[normale/commerciale]** — quando chiedi un'analisi azienda (salvo diversa indicazione), oppure preferisci che te lo **chieda ogni volta**?

Save to `/preferences.md` in memory (recall + merge, never blind-overwrite) BOTH the default level AND the default lens. Thereafter use the defaults silently, or keep asking, per their choice — always overridable per request ("stavolta fammela completa e commerciale").

## The four levels + the ATECO-benchmark rule
Internal labels: `solo-azienda` · `azienda-mercato` · `azienda-competitor` · `completa`.

- `solo-azienda` — company financials + the **automatic sector benchmark carried by `include_market_data`** on the analysis call (no separate `aggregate_companies`). This automatic benchmark is used **only** at this level.
- `azienda-mercato` — company + a proper market analysis via `market-sizing` / `market-benchmark` on a **clean perimeter built from the real activity** (not ATECO). **Turn the ATECO auto-benchmark OFF** — it confuses next to a real market read.
- `azienda-competitor` — company + direct peers via `syrto-comparables`. ATECO auto-benchmark **OFF**.
- `completa` — company + market + peers. ATECO auto-benchmark **OFF**.

Rule of thumb: the moment a real market or peer layer enters (levels 2–4), the ATECO auto-benchmark is off. The **taglio** dial is independent of this rule — the commercial cut can ride on top of any level.

## The commercial cut (taglio = commerciale) — works at ALL levels 1–4
When the lens is `commerciale`, keep everything the chosen **livello** produces and add the commercial reading — using data already fetched (no extra Syrto calls beyond what the level needs), per `core.md`. **Layout: the commercial part goes at the TOP of the deliverable**, then the level's analytical content below.

1. **Fit Score (0–100) at the top**, prominent, with — right underneath — a strong **"perché è in target"** narrative (leads with the business-fit reason, then the main drag; first time in a conversation, briefly explain the score's composition).
2. **"Cosa proporgli"** — a section on which of the user's products/services (from the catalogue in `/areas/syrto-commercial-context.md`) this company is in target for, each tied to a concrete finding. **Include it only if you actually know the catalogue** (it's in memory); otherwise omit the section — never invent products, and at first run invite the user to add their catalogue.
3. **Spend capacity (€)** = spend-hook metric × capture rate (from `/areas/syrto-commercial-context.md`), the rough deal ceiling.
4. **Go/no-go verdict** — one tier (Strong fit / Qualified / Monitor / Out of target / Insufficient data). Respect exclusions from memory.

Then, below, the level's analytical content (the company numbers, plus market/peers at levels 2–4).

**Livello 1 + taglio commerciale = the quick commercial qualification** (what the former `prospects-profiler` produced): company card, Fit Score, key-ratio table with the ATECO benchmark, spend capacity, "perché è in target", "Cosa proporgli", and the coloured verdict. At levels 2–4 the same commercial block rides on top of the richer market/peer analysis.

## Routing — this skill vs `briefing`
Both handle a single company; the discriminator is **format / speed**, not lens.

- **`company-analysis`** (this skill): the full report at a chosen **livello**, with the **taglio** dial (`normale` / `commerciale`) selecting the lens. The analytical-vs-commercial distinction is now this **taglio dial inside this skill**, not a separate skill.
- **`briefing`** (fast lane): a compact, quick commercial profile — same core backbone, lighter and faster — driven by the calendar (the day's meetings, schedulable as a routine) or by named companies (spot). Use it when the user wants speed / call-prep, not a formalized deliverable.

Rule of thumb: "quick / prima della call / cosa ho oggi / briefing" → `briefing`; "report / dossier / analisi / a che livello" → this skill.

## Build steps
1. **Resolve the company** — `syrto_find_company`, or `syrto_lookup_companies_by_tax_id` for a CF/VAT or an ambiguous name. Confirm the legal entity; watch for holding/retail shells. Reuse an upstream handoff if present.
2. **Company core.** `syrto_get_company_anagraphic` + `syrto_get_company_analysis` with `include_market_data: true` as the base — pre-grouped (margins, ROE/ROA/ROI/ROIC, liquidity, solvency, structure, radar, 2y trajectory) and it carries the sector benchmark in the same call. The sector lens is mostly a **presentation** choice: analysis already returns a broad set, so feature the sector-relevant numbers from it. Only if a sector-lens metric is genuinely **outside** those four categories (a raw balance-sheet line, a niche ratio) add **one** `syrto_get_company_metrics` call for just those slugs (≤50, the years needed) — check coverage first with `syrto_list_available_metrics` / `syrto_search_metric_definitions`. Never loop, never re-fetch what analysis already has. Convert ratio metrics from decimals.
3. **Level-specific layer** —
   - `solo-azienda`: the automatic sector benchmark comes from `include_market_data` on the analysis call — no separate `aggregate_companies`.
   - `azienda-mercato`: run `market-sizing` / `market-benchmark` on the clean real-activity perimeter.
   - `azienda-competitor`: run `syrto-comparables`.
   - `completa`: market + peers.
4. **Commercial cut** — only when `taglio = commerciale`: add the Fit Score, spend capacity, "perché è in target", product-fit and go/no-go verdict from the data already fetched (see "The commercial cut" above).
5. **Compose** — assemble the report; feature the sector-relevant numbers; keep the register per the proficiency profile.

## Output
Per `core.md`: a formalized deliverable — **HTML by default, then offer the PDF**; the visual canon comes from memory (`/preferences.md`) or the neutral default. Structure adapts to the level (company section always; market and/or peer sections as applicable) and to the lens: when `taglio = commerciale` the deliverable **leads with the Fit Score + "perché è in target" at the top, then "Cosa proporgli"** (only if the catalogue is in memory), then the level's analytical content and the verdict. Depth and technicality of the prose follow the proficiency profile. Carry the Syrto source/disclaimer. End with a `SYRTO-HANDOFF` (chain `prospects-scout→company-analysis→outreach-writer`) carrying the resolved id, anagraphic, metrics, any market/peer artifacts, and — when the commercial cut ran — the fit result and product-fit mapping, so downstream skills (e.g. `outreach-writer`) reuse them.

## Guardrails
Syrto first, web only for colour. Never invent metrics — if a figure is missing, flag it. Respect the ATECO-benchmark rule (off from level 2). Bare scores are forbidden in the commercial cut — always the narrative naming main drivers and main drag; missing financials → "Insufficient data" with the tax-id suggestion. Respect exclusions from memory. Call out distress signals (negative equity, current ratio < 1, losses + decline) explicitly, even when other dimensions look good. Do not silently switch level or lens — if the user overrode either, confirm what you built.

## Radar positioning (optional)

If the question is really about *where this company sits* rather than which numbers it posts,
`syrto_radar_map` places it on size × efficiency scored across Syrto's whole database — so
companies from different sectors compare directly, and it is the only tool that returns
labelled forecast points. `peer_filters` / `aggregates` take the same `filters` object as
`syrto_search_companies` and resolve inside the call, so a company-vs-sector view needs no
prior search. For a file, `syrto_radar_chart` returns the same chart as an embeddable SVG.
Optional — reach for it when positioning is the point, not as a routine step.
