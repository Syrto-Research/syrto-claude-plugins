---
name: priority-ranker
description: >
  Score and rank a list of companies by financial fit so a sales team knows where to
  focus. Use whenever the user provides or points to a list / territory / target-account
  list and says "prioritizza", "ordina questi account", "chi chiamo prima", "tiera la
  pipeline", "prioritize", "rank these accounts", "who should I call first",
  "score this list", "tier my pipeline", "which of these are worth pursuing", or uploads
  a spreadsheet of company names / tax IDs for qualification. Outputs a ranked, tiered
  table with a Fit Score and one-line rationale per company.
metadata:
  version: "1.0.0"
---

## PRECONDITION — user profile required (do this FIRST)
# Priority Ranker

## Suite integration (read first)
Follow `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (method, memory, output, efficiency, handoff) and `${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md` (tools + metrics). Reuse any upstream `SYRTO-HANDOFF` before calling Syrto; emit one when you feed another skill.

Turn a flat list of companies into a ranked, tiered call list. Prerequisite: the Syrto connector is connected.

## Read your context first
Read the commercial profile from memory (`/areas/syrto-commercial-context.md`): target revenue band, spend hook + capture rate, exclusions. If the target band or spend hook is missing, ask once and offer to save it to memory. If an upstream `SYRTO-HANDOFF` already carries some of these companies (resolved ids, metrics, fit), reuse it and fetch only what is missing.

## Steps
1. **Get the list.** From the user's message, an uploaded file (CSV/XLSX — parse with pandas), or a CRM export. Extract company names and/or tax IDs.
2. **Resolve each** via `syrto_find_company` / `syrto_lookup_companies_by_tax_id`. Note any that don't resolve — they become "Insufficient data".
3. **Batch the financials.** Read the scoring metrics for the whole group with `syrto_compare_companies` (one read for the batch) rather than querying each company separately; split very large lists into blocks. Use `syrto_aggregate_companies` for shared sector benchmarks instead of re-querying peers per company. Check for `missing_company_ids` / warnings before using results.
4. **Score & tier.** Compute the Fit Score and verdict tier for each. Apply exclusions and the target band as hard filters (excluded → flagged, not ranked into the top tiers).
5. **Rank.** Sort by score within tier: Strong fit → Qualified → Monitor → (Out of target / Insufficient data listed separately).

## Output
A visual widget: a ranked table with columns — company, sector (Syrto), revenue, Fit Score, spend-capacity estimate, coloured tier, and a one-line rationale naming the main driver and main drag. Above it a short summary: how many in each tier and the top 3 to call first. Offer to export to Excel (`xlsx`) or a pipeline PDF. If the ranked companies feed another skill, end with a `SYRTO-HANDOFF` carrying the resolved ids, metrics, and fit.

## Guardrails
One-line rationale per row is mandatory — never a bare column of numbers. Don't drop unresolved companies silently; list them as "Insufficient data — verify tax ID". Distress signals override a high size score: flag credit risk in the rationale. Respect exclusions from memory.
