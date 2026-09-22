---
name: add-on-finder
description: Corporate-finance screener that finds bolt-on / add-on acquisition targets in Italy starting from a company (or a portfolio), using Syrto. From the starting company's own business it surfaces similar or complementary companies SMALLER than it, prefers geographic proximity, de-prioritises companies in distress, and by default focuses on family-owned targets whose average beneficial owner is over 65 (an exit signal). If criteria aren't specified it states sensible defaults and asks to confirm. Trigger on add-on, bolt-on, buy and build, trova add-on, chi posso comprare partendo da [azienda], or any request starting from a company/portfolio for smaller similar companies to acquire. Do NOT use for a sell-side buyer universe (buyer-list), a peer group (syrto-comparables), or a generic succession screen (ma-succession-prospecting).
---

## PRECONDITION — user profile required (do this FIRST)
# Add-on Finder

Find **bolt-on / add-on acquisition targets** on the Italian market for a **starting company** (buy-and-build logic): starting from the starting company's own business, surface **smaller, similar or complementary companies** that the starting company could acquire and integrate to grow by external lines.

Syrto is the **exclusive** source for discovery, ownership and financials. All deliverables and chat updates are in **Italian**, regardless of the language of the request.

## What makes a good add-on (the default thesis)

An add-on is not just "a similar company" — it must be **acquirable and integrable**. The defaults below encode that. State them back to the user and let them confirm or override at the start of every run (see Step 0):

1. **Similar / complementary business** — the core of the search. Found via Syrto `semantic_search` built from the starting company's own activity description (competitors and adjacent players, *not* Ateco codes).
2. **Smaller than the starting company** — a bolt-on, not a merger of equals. Default gate: target revenue **below the starting company's** (a sensible default band is roughly 5%–60% of the starting company's revenue; adjust per user). A company the same size or larger is not an add-on — flag it as a "fusione tra pari", don't put it in the main list.
3. **Geographic proximity preferred, not mandatory** — same region / macro-area eases integration and synergies, so proximate targets rank higher, but a strong out-of-region fit still qualifies.
4. **Not in serious financial distress** — financial health is *not* the selection driver, but companies in real crisis (e.g. persistently negative EBITDA, negative equity, very high leverage / clear distress signals) are **de-prioritized**, not silently dropped: they go to a separate "Da valutare con cautela" list with the reason.
5. **Family-owned with an ageing owner (succession signal) — default focus.** By default prioritise **family-owned** targets (`controlling_entity_category = FAMILY`) whose **average beneficial owner age is over 65**. An old family owner without an obvious successor is a classic exit signal — exactly the target most likely to sell. This is a **default, not a hard requirement**: the user can widen it (all ownership types, no age filter) at the start.

**Crucial behavioural rule:** if the user does **not** specify the criteria, do **not** guess silently. First **state explicitly** what you would search for (the five points above, with the concrete thresholds you'd apply), then ask the user to **confirm or adjust** before running the search. This mirrors how the user works: propose the sensible default, let them correct the aim.

## Two input modes

- **Single starting company (default):** the user gives one company (name or tax id) as the starting company/seed. Its own Syrto business description drives the semantic search; its own revenue sets the "smaller than" gate.
- **Portfolio:** the user gives a **list** of companies that together represent a portfolio (e.g. a fund's holdings, or a group's operating companies). Treat the portfolio as the starting company: build the semantic query from the **union** of the portfolio's activity descriptions (search per-company and merge results, de-duplicated), and set the "smaller than" gate against the **largest** portfolio company (or per-company if the user wants add-ons mapped to each holding). Always **exclude the portfolio companies themselves** from results.

## Key Syrto data notes (read before designing the search)

- **`beneficial_owner_age` is the *average* age of the beneficial owners.** That is exactly what the default here wants (average > 65), so it can be used directly as a search filter — e.g. `{"min": 65}`. (This differs from `ma-succession-prospecting`, which needs the *majority* owner's age and therefore can't rely on this field.)
- **`controlling_entity_category`** is now an **anagraphic search filter** (`filters.anagraphic.controlling_entity_category`, single-value enum: FAMILY, FAMILY_OWNED_GROUP, FINANCIALLY_OWNED_GROUP, INDUSTRIAL_GROUP, FINANCIAL, OTHER). Apply the family default **upstream in discovery (Step 1)** — value `FAMILY` — not as a post-hoc gate. `syrto_get_company_structure` is then used only to enrich (top owners, successor flag) and resolve the perimeter, never to gate ownership type.
- `syrto_get_company_structure` caps shareholders and beneficial owners at 10 each; `share_percent` and `age` may be null; `age` is only present for natural persons. Handle nulls gracefully (route unresolved cases to the caution / verify list rather than corrupting the result).
- Call `syrto_get_search_filter_docs` for each section you're about to build (`anagraphic`, `financial`) to confirm exact field names before assembling `filters`.

## Workflow

### Step 0 — Understand the starting company & confirm criteria

1. **Locate the starting company(ies).** `syrto_find_company` / `syrto_lookup_companies_by_tax_id` for each seed. If ambiguous, ask the user which match.
2. **Pull the starting company profile.** `syrto_get_company_anagraphic` (activity_overview, target_markets_description, sede/regione) and `syrto_get_company_metrics` (revenue, EBITDA — sets the size gate). For a portfolio, do this for each company.
   - If `activity_overview` / `target_markets_description` are missing (common for small companies), fall back to the company `website_url` or a web lookup, confirm the site with the user, and generate the missing description in Syrto's concise style before proceeding.
3. **Craft the semantic query** from the activity description(s) — a precise, faithful rewrite of what the starting company does. Keep it specific to the real business; don't broaden into an unrelated market.
4. **State the criteria and get confirmation.** Present, in Italian, exactly what you'll search for and ask the user to confirm or change:
   - la query semantica (mostrala) e `match_cutoff` (default **0.8**);
   - **dimensione**: target più piccoli dell'azienda di partenza — proponi la banda di fatturato (default ~5%–60% del fatturato dell'azienda di partenza), da confermare;
   - **geografia**: stessa regione/area preferita ma non obbligatoria (di default nessun filtro rigido, solo bonus nel ranking) — chiedere se vogliono restringere;
   - **proprietà**: di default **solo familiari** (`FAMILY`) — chiedere se aprire a tutte;
   - **età titolare effettivo (media)**: di default **> 65** — chiedere se togliere/cambiare la soglia;
   - **salute finanziaria**: le aziende in forte crisi vengono de-prioritizzate (non escluse) → lista "Da valutare con cautela".

   Only proceed to Step 1 after the user confirms (or adjusts).

### Step 1 — Discovery (cheap, Syrto semantic search)

Run `syrto_search_companies` with:
- `filters.anagraphic.semantic_search` = the query crafted in Step 0, `match_cutoff` = 0.8 (default).
- `filters.anagraphic.beneficial_owner_age = {"min": 65}` when the age default is on (it's the *average* age — the right field here).
- `filters.anagraphic.controlling_entity_category = "FAMILY"` when the family default is on — **filter ownership type upstream here**, not with a post-hoc gate. Single-value enum: if the user also wants family-owned *groups*, run an extra search with `"FAMILY_OWNED_GROUP"` and merge; if they open to all ownership types, omit it.
- `financial.metric_filters` on `revenues_from_sales_and_services` with the confirmed **max = below the starting company** (and the confirmed min), `year = 2024` for filtering (unless the user overrides).
- geography (`nuts`/`lau`/`country_code: "IT"`) only if the user chose to restrict; otherwise leave geo open and use proximity only as a ranking bonus.

**Run semantic searches one at a time, never batched in parallel** — Syrto semantic search is heavy server-side and concurrent calls time out. For a **portfolio**, run one search per company sequentially and merge/de-duplicate the candidate pools. Paginate (`after` = `end_cursor`) until the pool is large enough that ~15–25 will survive (gather somewhat more, e.g. 40–70; ownership type and owner age are already filtered upstream, so the main remaining trims are the size and health screens). **Save each candidate's semantic match score** — it feeds the fit score. **Always exclude the starting company / portfolio companies themselves.**

Widen the net (if too few survive) by **reformulating the query** toward adjacent activities, not by dropping the cutoff below 0.8 unless the user agrees.

### Step 2 — Screening (L1, cheap): size confirmation

For the candidate pool, confirm the **size gate** in bulk with `syrto_compare_companies` rather than looping `syrto_get_company_metrics` one company at a time. `syrto_compare_companies` fetches the same metric slugs for many companies (2–20) in a single call, so it is markedly faster than the per-company read (one batched call) — exactly the shape of this step, where you want one or two revenue/EBITDA numbers across a large pool.

How to run it here:
- Only pull the companies the discovery response didn't already size — no need to re-fetch what you have.
- Batch the rest through `syrto_compare_companies` in chunks of ≤20 `company_ids` (the tool's cap), sequential, using the candidate IDs from discovery.
- `metric_slugs`: the size metrics you gate on (e.g. `revenues_from_sales_and_services`, and `ebitda` if useful). Confirm exact slugs via `syrto_search_metric_definitions` / `syrto_list_available_metrics` first — wrong slugs silently return no data.
- `year` is **required** and single for the whole comparison, so gate on a common reference year (the discovery filter year, default **2024**). Anything in `missing_company_ids` (no data for that year) → fall back to a single `syrto_get_company_metrics` read for that one company, or route it to "Da verificare" if still unresolved.

Drop / reclassify anything not smaller than the starting company ("fusione tra pari" note). This trims the pool before the ownership pulls.

### Step 3 — Ownership & succession enrichment (batched)

Ownership type and average owner age are already filtered **upstream in discovery** (Step 1), so this step no longer gates on them — it enriches. For the survivors call `syrto_get_company_structure` **in small batches (≈4–5 per batch, sequential, brief pause between batches)** to avoid overcalling and getting blocked.

For each company:
- **Ownership detail:** record the controlling type and the top owner(s) for the output. The family/type filter already ran in discovery — no re-gating here.
- **Age context:** capture beneficial owners with `share_percent` and `age`. The average-age filter already ran in discovery; here record the top owner(s) and age for the output and note whether a **potential successor** exists (a younger same-surname owner) as useful colour — this is not a gate, just enrichment.
- **Null handling:** ownership/age unresolved (null shares, holding on top, age not disclosed) → route to **"Da verificare"** with the reason, don't drop silently.

### Step 4 — Fit scoring & financial-health check (L2, on survivors only)

For every in-target company, pull the overview. The financial KPIs are the bulk of the work here, so fetch them in bulk with `syrto_compare_companies` rather than looping `syrto_get_company_metrics` company by company — same numbers, far fewer calls:
- `syrto_compare_companies` — the deep-dive KPIs in one shot across the survivors: Fatturato, EBITDA, Margine EBITDA %, crescita/CAGR, PFN e leva (net debt / EBITDA). Batch `company_ids` in chunks of ≤20 (tool cap), sequential. Confirm the `metric_slugs` via `syrto_search_metric_definitions` / `syrto_list_available_metrics` before calling (wrong slugs silently return nothing). `year` is **required and single** for the comparison, so pick one common reference year (default the discovery year, **2024**) and **label it in the output**. Note this trades the old per-company "latest available year" for a shared comparison year — the tradeoff that makes the side-by-side comparison meaningful. For any company in `missing_company_ids`, fall back to a single `syrto_get_company_metrics` read at its latest year (label that year on the row).
- `syrto_get_company_anagraphic` — legal name, tax_id, sector/NACE, sede, activity description (this is per-company and stays a normal batched read; it isn't a metric loop).
- Where the inline sector benchmark genuinely helps the health read, a targeted `syrto_get_company_analysis(include_market_data=True)` on a specific company is still fine — but use it as a follow-up on notable cases, not as the default per-company loop, since `syrto_compare_companies` already covers the KPIs.

Then compute a transparent **Fit Score (0–100)** — explain the weighting to the user, don't present it as a black box. Suggested default weights (tunable): **Similarità di business 40**, **Dimensione 20**, **Segnale di successione 20**, **Prossimità geografica 10**, **Salute finanziaria 10**. See `references/scoring-output-formatting.md` for what each weight captures.

Flag distress explicitly (persistently negative EBITDA, negative equity, leverage clearly out of line) → caution list with the reason. Distress de-prioritises, it does not auto-exclude.

### Step 5 — Validation preview in chat (BEFORE any file)

Do **not** build the Excel straight away. First show the ranked in-target companies **as a table/widget in the chat** so the user can validate: Azienda, Attività (sintesi), Regione, Fatturato, EBITDA, Titolare effettivo (età media), Proprietà, Fit Score, razionale in una riga. Below it, state the parameters used (query, match_cutoff, banda dimensione, geo, soglia età, proprietà, anno) and the counts (candidati screenati, in target, in "Da valutare con cautela", in "Da verificare").

Then **ask the user to confirm**. Only after explicit confirmation proceed to Step 6. If they want changes (different band, wider ownership, different query), re-run the relevant steps first.

### Step 6 — Output (only after confirmation)

**Default deliverables: produce BOTH an Excel and a readable report — always, without asking.** The Excel is the data/scanning tool; the readable report is the presentable version of the same analysis, rendered per `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (not hand-built). Build the Excel first (with the `xlsx` skill), then the readable report from the same data so the two never diverge.

→ **Before building the output, read `references/scoring-output-formatting.md`** for the full Fit Score weighting rubric, the Excel tab/column specs (Add-on Target, Da valutare con cautela, Da verificare, Riepilogo), the readable-report structure, the number/percentage formatting rules, the ownership-type translation table, and the efficiency & robustness checklist.

## Important notes

- Syrto is the exclusive source for discovery, ownership and financials — do not substitute web guesses (web is only for filling a missing activity description, confirmed with the user).
- **The five criteria (similar · smaller · proximate · not distressed · family + ageing owner) are defaults, not laws.** If the user hasn't specified them, state them and ask for confirmation before searching; if they widen or drop any, honour that and record what was used in the Riepilogo.
- **Always validate in chat first (Step 5), build files only after the user confirms.**
- The Fit Score is a decision aid — always show its weighting so the user can trust and tune it.
- Include the Syrto API `note` field (if present) as a disclaimer at the bottom of the output.

---
_Fonte dati: Syrto_

## Ownership & footprint helpers

- **`syrto_find_person`** — when the ownership read turns up a name worth following (an owner
  who already controls several companies, a family holding), resolve it to see everything they
  are involved in. Entries identify companies by **`tax_id`** — batch through
  `syrto_lookup_companies_by_tax_id`. Names are matched exactly, surname-first, correctly
  capitalised. The `people` filter on `syrto_search_companies` accepts the resulting ids.
- **`syrto_list_company_branches`** — sharpens the geographic-proximity component of the Fit
  Score beyond the HQ address alone. These are *registered* locations only: do not infer that a
  site is operating, staffed, a plant or a shop, that it defines a territory, or that revenue
  arises there. An empty list is not evidence of a single-site business.
- Do not buy contacts — this suite does not spend contact credits.
