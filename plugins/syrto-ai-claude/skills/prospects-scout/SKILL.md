---
name: prospects-scout
description: >
  Build a fresh, ranked list of prospect COMPANIES using Syrto semantic search — from
  criteria you describe, from a seed of your best clients (lookalikes), or from a
  connected CRM / uploaded client file. Use whenever the user says "trova prospect", "trova clienti",
  "cerca aziende target", "lista prospect", "aziende simili ai miei clienti",
  "lookalikes", "espandi la pipeline", "find new prospects", "companies like [client]",
  "new targets", "who else looks like this", or wants a target-company list in a
  sector/region. Profiles companies only — no contact finding, no campaign push.
  Outputs a scored, tiered top-prospect list plus a SYRTO-HANDOFF for downstream skills.
metadata:
  version: "1.0.0"
---

## PRECONDITION — user profile required (do this FIRST)
# Prospects Scout

## Suite integration (read first)
Follow `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (method, memory, output, efficiency, handoff) and `${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md` (tools + metrics). Reuse any upstream `SYRTO-HANDOFF` before calling Syrto; emit one when you feed another skill.

Produce a screened, ranked list of candidate companies to pursue. Companies only — this skill does not find people or push campaigns. Prerequisite: the Syrto connector is connected.

## Read your context first
Read the commercial profile from memory (`/areas/syrto-commercial-context.md`): target revenue band, target sectors/geographies (used as plain-language semantic queries), hard exclusions, spend hook + capture rate, and any portfolio/reference clients. Any field the user states this turn overrides memory. If a field the search needs is missing, ask once and offer to save it to memory. NACE/ATECO is used only for hard exclusions or an explicit narrowing — never as a default gate.

## Three entry modes
Detect the mode from the request; ask only if ambiguous.

- **(a) From criteria / from scratch** — the user describes the target (sector, activity, size, geo) or you take it from the memory profile. Build semantic queries from that description.
- **(b) Seed list of best clients (lookalikes)** — the user names clients or points to a portfolio. Take the top clients, pull each one's activity description via `syrto_get_company_anagraphic`, and derive semantic queries from what they actually do.
- **(c) Connected CRM / uploaded Excel-CSV of clients** — read the client list from the connected CRM or a parsed file (pandas). Use it both to seed lookalike queries and to dedup (never re-surface an existing client).

## Steps
1. **Assemble the queries.** One or more semantic queries in the company's language (Italian by default). For lookalikes, one query per distinct client archetype.
2. **Search Syrto.** Run `syrto_search_companies` per query, sequentially (not parallel), applying `match_cutoff: 0.75`, `sort_by: match_score desc` (relevance, not size), and revenue/geo filters from the profile where supported. Add a `nace` filter only for a hard exclusion or an explicit narrowing.
3. **Screen out.** Remove companies already in the portfolio/CRM, anything hitting a configured exclusion, and obvious holding/retail shells (search the operating entity by tax ID instead). State how many were removed and why.
4. **Quick-score survivors.** For the top candidates pull anagraphic + the scoring metrics; for the batch use `syrto_compare_companies` (one read for the group). Compute an abbreviated Fit Score, spend-capacity estimate, and verdict tier per `core.md`.
5. **Suggested angle.** One line per kept prospect: for lookalikes, which client it resembles and why it scored well; for criteria mode, the main driver.

## Output
A visual widget: top ~10 prospects with company, sector (Syrto), revenue, match score, Fit Score, spend-capacity estimate, coloured verdict tier, and suggested angle. Above it, how the seeds/queries were chosen and the screening summary (excluded N for reason X). Offer to export to Excel (`xlsx`). End with a `SYRTO-HANDOFF` (chain `prospects-scout→company-analysis→outreach-writer`) carrying resolved ids, filters used, anagraphic and the metrics/fit already gathered, so `company-analysis` and `outreach-writer` start from there.

## Guardrails
Relevance over size — don't let big-but-irrelevant matches top the list. Quick-score is provisional; recommend full profiling before outreach on the top names. Rationale mandatory per prospect. Call out distress signals explicitly. Respect exclusions from memory.
