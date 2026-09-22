---
name: buyer-list
description: Build and organize a universe of potential acquirers for sell-side M&A processes, using Syrto as the exclusive source of company discovery, ownership and financial data. Identifies strategic buyers (Italian companies only) and financial sponsors (Italian funds preferred, well-known foreign funds acceptable), assesses fit, ownership, and financial capacity, gives deliberate prominence to non-obvious "outside-the-box" buyers, and produces all deliverables in Italian. Use when preparing for a sell-side mandate, building a buyer universe, or evaluating potential partners. Triggers on "buyer list", "buyer universe", "potential acquirers", "who would buy this", "strategic buyers", "financial sponsors", "lista di potenziali acquirenti", or "chi potrebbe comprare".
---

## PRECONDITION — user profile required (do this FIRST)
# Buyer List

## Language

**All deliverables (Excel workbook, HTML buyer book, HTML deep-dive) must be written entirely in Italian** — headers, column labels, rationale text, tier names, notes, everything. This applies regardless of the language the user used to request the buyer list. Chat updates to the user should also default to Italian unless the user writes in another language.

## Workflow

### Data-depth ladder — spend effort where it pays off

A buyer universe surfaces many more names than deserve a full deep-dive, so the analysis is deliberately staged in three depth levels. The point is not to cut corners — it is to avoid burning a full financial deep-dive on names that a cheap screen already shows are low-probability, so the saved budget goes to the buyers the seller will actually contact. This applies to both strategic buyers (Step 2) and financial sponsors (Step 3).

- **L0 — Discovery (near-free):** name, sector, short description. This is what the Syrto search endpoints already return for strategics, and what the AIFI lite table gives for sponsors. Used to assemble the candidate pool and apply the fit + size gates.
- **L1 — Screening (one batched call for the whole pool):** enough to assign a *provisional* tier and fill the summary table — essentially the size read vs. the target (fatturato/EBITDA and dimensione vs. target). Get this for *all* candidates that cleared L0 in a single `syrto_compare_companies` call, passing them together, rather than looping a `syrto_get_company_metrics` read per name — one batched comparison is far faster (one batched call) than N single reads and returns the buyers side-by-side against the target in one shot. Every candidate that clears the L0 gates gets L1. Ownership type and listed status are *not* pulled here — a company's structure (`syrto_get_company_structure`) is a single call that returns ownership type, `is_quoted` and the UBO/group chain together, so there's nothing to gain by splitting it: it moves wholesale to the shortlist (see L2).
- **L2 — Deep-dive (the heavy pulls):** multi-year financial trend, leverage/net debt, market benchmark (inline via `syrto_get_company_analysis(include_market_data=True)`), spider, recent-M&A web check, and the full ownership picture — the single `syrto_get_company_structure` pull covering ownership type, listed status (`is_quoted`) and the UBO/group chain. **Reserve L2 for provisional Tier 1 and Tier 2 names, every outside-the-box candidate, and the four deep-dive names.** Provisional **Tier 3 names stay at L1** — they are low-probability "broaden the process" names and don't warrant the full pull, so they carry the batched size read but no structure/ownership pull.

**Tiering is provisional then confirmed.** Assign the tier from L1 data, then let L2 promote or demote a name. Any name sitting on the Tier 2/3 borderline should be taken to L2 before finalizing, so a genuinely strong buyer is never left in Tier 3 just because the cheap screen undersold it. Outside-the-box names always get L2 regardless of provisional tier — their whole case rests on a non-obvious point of contact that needs real evidence.

### Step-by-step (high level)

The detailed operating instructions for each step (discovery queries, categories, ownership pulls, rationale frameworks, summary-table columns, output layouts) live in the `references/` files — read the named file at the point of need.

1. **Step 1 — Understand the Target.** Build the target's profile from Syrto (anagrafica, multi-year financials, structure/`is_quoted`, spider), enriched by the open web. Derive an **implied valuation range** from the sector median EV/EBITDA multiple applied to the target's EBITDA. Capture seller preferences.
2. **Step 2 — Strategic Buyers (Syrto-first, Italian-only).** Discover Italian strategics exclusively via Syrto (`syrto_search_companies` / `syrto_aggregate_companies`, `match_cutoff` 0.8, searches run one at a time) across direct competitors, adjacent players, vertical integrators, platform builders, and — with deliberate prominence — 4-8 **outside-the-box** buyers justified by a concrete point of contact. Gate on the size test (buyer meaningfully larger than the target), then pull ownership and financial capacity from Syrto for the shortlist.
   → **Before Step 1 and Step 2, read `references/strategic-buyers.md`** (discovery categories, outside-the-box hunting, size test, ownership & rationale frameworks, financial-capacity pulls, summary-table columns).
3. **Step 3 — Financial Sponsors (Italian preferred).** Discover funds from the **bundled AIFI list**, not from Syrto or memory: read `references/aifi_funds_lite.csv` in full (all 189), rank to a shortlist, open the full `references/aifi_financial_players.csv` only for survivors, verify Italian portfolio companies in Syrto, then enrich/extend via the web. Foreign funds only if well-known with a verifiable Italian footprint.
   → **Before Step 3, read `references/financial-sponsors.md`** (the three-step AIFI funnel, sponsor categories, add-on logic, ownership, rationale, financial-capacity, summary-table columns).
4. **Step 4 — Prioritization.** Confirm the provisional tiers (L2 may promote/demote): Tier 1 (5-10), Tier 2 (10-15), Tier 3 (10-20). "Fuori dagli schemi" is a cross-cutting flag, not a tier. Every buyer needs a grounded rationale.
5. **Step 5 — Contact Mapping.** For each Tier 1 buyer, map decision-maker, relationship status, constraints and best approach channel, informed by the ownership/UBO work.
6. **Step 6 — Output (all in Italian).** Produce the Excel workbook (scanning tool), the HTML buyer book (complete narrative), and the HTML deep-dive (best 2 strategics + best 2 sponsors). Outside-the-box names must be visually distinct in every output.
   → **Before Steps 4-6, read `references/prioritization-and-output.md`** (tier definitions, contact-mapping fields, full Excel/HTML/deep-dive layout specs).

## Important Notes

- **Syrto is the exclusive source for discovery, ownership and financial data on every Italian buyer** — strategic candidates are found via Syrto (`syrto_search_companies`, `syrto_aggregate_companies`), and their ownership (`syrto_get_company_structure`, including the `is_quoted` field for listed status) and financials (`syrto_get_company_metrics`, `syrto_get_company_analysis`) are pulled from Syrto, not estimated or sourced from general web pages. The open web is used only for: (a) qualitative color and strategic-intent signals on companies Syrto has already surfaced, (b) fund-level facts for financial sponsors (current thesis, live check-size, recent deals — beyond what the AIFI CSV provides), and (c) enrichment/extension of the fund list (foreign funds with a real Italian footprint, non-AIFI funds). Where Syrto and a web source disagree, Syrto wins.
- **Funds are discovered from the bundled AIFI list, not from Syrto or memory.** Read `references/aifi_funds_lite.csv` in full (all 189, ~8k tokens) so no fund is filtered out unseen, rank by check-size / type / focus / sector, then open the full `references/aifi_financial_players.csv` only for the shortlist (profile; contacts come from the fund's website), verify portfolio companies in Syrto, and enrich/extend via the web. This is what stops the fund search from either missing real mid-market Italian funds or hallucinating nonexistent ones. If a fresher AIFI export replaces the full CSV, regenerate the lite table with `scripts/make_lite.py`.
- **Strategic buyers must be Italian companies.** Do not propose foreign industrial strategics on this list.
- **Financial sponsors should default to Italian funds.** A foreign fund may be included only if well-known and demonstrably active in the Italian market — state the specific Italian data point (portfolio company, mandate, or deal) that justifies its inclusion.
- **Give real, structural prominence to outside-the-box buyers** — these are buyers whose case rests on a genuine point of contact (shared customers, complementary capability, diversification signal) rather than an obvious similar business. Actively hunt for 4-8 of these via lateral Syrto `semantic_search` queries, tag them clearly, and make sure they are visible in a dedicated section/callout in the HTML and via a flag column in Excel — never let them get buried in Tier 3 by default.
- **All deliverables and chat updates are in Italian.**
- Ownership type (family, founder, sponsor-backed, state, listed) should inform both the tiering and the contact-mapping decision-maker — it changes who you'd actually approach and how fast they can move.
- Quality over quantity — a focused list of 30-40 well-researched buyers beats a list of 200 names, but don't let that discipline crowd out the outside-the-box names — those are worth the extra research time.
- A strategic buyer that isn't meaningfully larger than the target isn't a real buyer for this list — verify size with Syrto before including one.
- Check for antitrust concerns with direct competitors — flag any that might face regulatory issues.
- Financial sponsors: check fund vintage and deployment pace — a fund nearing end of investment period may be more motivated.
- Always ask the seller if there are buyers they want included or excluded.
- Update the list as the process progresses — move buyers between tiers based on feedback.

## Person-anchored discovery (optional)

When a name is in play — a fund partner, a serial acquirer, a known industrial family — resolve
it with `syrto_find_person` and read the officerships, shareholdings and beneficial ownerships
it returns. That maps what a person already controls, which surfaces buyers no sector search
reaches. The entries carry **`tax_id`, not company id**: batch them through
`syrto_lookup_companies_by_tax_id` (20 per call) before analysing them.

The `people` filter on `syrto_search_companies` also accepts `person_id` values, so a buyer
search can be anchored on a person rather than an activity.

Name matching is exact and surname-first (`Rossi Mario`), correctly capitalised — see
`syrto-reference.md`. Do not buy contacts: this suite does not spend contact credits.
