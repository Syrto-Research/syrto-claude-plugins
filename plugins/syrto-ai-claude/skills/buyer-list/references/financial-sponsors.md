# Buyer List — Financial Sponsors

Reference for the `buyer-list` skill. Read this before executing Step 3 (Financial Sponsors). The two AIFI CSVs referenced live alongside this file in `references/`.

---

### Step 3: Financial Sponsors — Italian preferred, reputable foreign funds acceptable

Discovery here works differently from strategics: funds are sourced from the bundled AIFI list (see below), not from Syrto and not from unaided memory. Default to Italian funds; the rules for admitting a foreign fund are covered in the discovery section below.

Where a sponsor's portfolio company or platform is an Italian operating company, use Syrto to source and screen it the same way as strategics (sector/size search via `syrto_search_companies`, then financials via `syrto_get_company_metrics`/`syrto_get_company_analysis`, then ownership via `syrto_get_company_structure`). Funds themselves (the GP/management company) generally aren't in Syrto, so their discovery starts from the bundled AIFI list below — not from unaided recall — and any Italian portfolio company or add-on candidate is then verified directly in Syrto rather than trusting a web description of it.

#### Discovery source for funds: the bundled AIFI list

Syrto does not cover fund vehicles, so the discovery of sponsors must not rely on the model's memory alone — that risks missing real mid-market Italian funds and, worse, inventing plausible-but-nonexistent ones. Instead, start every sponsor search from the bundled AIFI directory of ~189 financial players (the Italian PE/VC/private-debt association). It is the authoritative starting universe for this step, playing the same role for funds that Syrto plays for strategics.

It comes as two files, split on purpose so the whole universe stays visible without loading a heavy file every run:

- **`references/aifi_funds_lite.csv` — read this one in full, every time.** It is all 189 funds with just the screening columns (`name`, `type`, `focus_investimento`, `check_min_eur`, `check_max_eur`, `preferenze_settore`, `preferenze_geo`, `totale_aum_eur`, `sito_web`) and is light enough (~8k tokens) to keep every fund in view. Reading it whole matters: you screen by *judgment over the complete list*, so nothing gets filtered out before you've seen it.
- **`references/aifi_financial_players.csv` — the full record** (adds `remarks` profile, `num_fondi`, `num_portfolio`, `aum_raw`, etc.). Consult it **only for the shortlisted funds**, to read their profile. It carries no people or contact details: for Step 5, find the relevant partner and approach channel on the fund's own website (`sito_web`). Don't load it wholesale — that's the heavy 34k-token file the lite table exists to avoid.

Not every cell is populated (check-size is filled for ~120/189, AUM for ~127/189), so treat blanks as "unknown," not "excluded." If a fresher AIFI export replaces the full CSV, regenerate the lite table with `scripts/make_lite.py`.

Screen with a three-step funnel — read the lite table whole, *rank and narrow* (never hard-drop before you've seen a name), then go deep only on the shortlist:

1. **Rank the full lite table → shortlist (~15-30).** Weigh, in rough order of importance: (a) `check_min_eur`/`check_max_eur` bracketing the target's implied valuation from Step 1 — a fund whose minimum ticket dwarfs the target, or whose maximum is far below it, is not a real buyer; (b) `type` matching the deal (PE for buy-out/platform, VC/growth for early-stage or high-growth targets, private debt only if a debt structure is on the table); (c) `focus_investimento` matching the situation (Buy Out for platform/control, Expansion/Early Stage for growth-equity, Turnaround for distressed); (d) `preferenze_settore` and `preferenze_geo` fitting the target — judge sector fit *semantically*, since a generalist ("None"/"Other") or an adjacent-sector fund can still be a real buyer. Then open the full CSV for the survivors and read their `remarks` for a sanity check.
2. **Portfolio companies → Syrto.** For the shortlisted funds, identify Italian portfolio companies (from `remarks`, the fund's site, or web) and re-verify each in Syrto (`syrto_get_company_metrics`/`syrto_get_company_analysis` for financials, `syrto_get_company_structure` for ownership) — this is how add-on candidates are confirmed with real numbers rather than marketing copy.
3. **Web enrichment + targeted extension.** Only now go to the web, and keep it scoped: (a) enrich the shortlisted funds via their `sito_web` for the fund-level facts the CSV can't fully give — current thesis, live check-size, exclusion criteria, latest portfolio and recent deals; (b) run a few *targeted* searches to catch relevant funds active in the target's sector that are **not** in AIFI (foreign funds with a real Italian footprint, or newer/non-member funds), applying the same Italian-footprint bar as below. The AIFI list is the base; the web extends and freshens it — it is not a from-scratch discovery pass over the whole market.

Then apply the same L1/L2 depth ladder as strategics: L1 screening (fund-fit + a size read of any candidate add-on portfolio companies — batch these through `syrto_compare_companies` when there are several) assigns a provisional tier for every shortlisted sponsor; the full L2 work below (fund capacity, portfolio-company multi-year financials, GP/portfolio-company structure via `syrto_get_company_structure`, web enrichment of the site) is for provisional Tier 1/2 sponsors and any that anchor an outside-the-box thesis — Tier 3 sponsors stay at L1.

**Default to Italian funds** (the CSV is overwhelmingly Italian-based). A foreign fund surfaced via step 3 may be included only if it is well-known and has a demonstrable, verifiable footprint or stated mandate in the Italian market (e.g. Ardian, Antin Infrastructure Partners, Macquarie Asset Management, InfraVia, Equitix, Meridiam with confirmed Italian activity) — every foreign name must earn its place with a concrete Italian data point (a current Italian portfolio company, a stated Italian-market mandate, or recent Italian deal activity), never added just to pad the list.

Identify PE/financial buyers:

**Platform Investors**
- Sponsors looking for a new platform in this sector
- Criteria: Fund size, sector focus, deal size range

**Add-on Buyers**
- Sponsors with existing portfolio companies that could acquire the target as a bolt-on
- Identify the specific portfolio company and, if it is Italian, verify its financials/ownership in Syrto rather than on the web

**Growth Equity**
- For earlier-stage or high-growth targets
- Minority vs. majority preference
- If the target is too large for classic growth-equity check sizes, say so explicitly and exclude growth equity from the list rather than forcing a weak fit

**For every sponsor, verify fit by checking their website directly for the fund-level facts (fund size, thesis, mandate) that Syrto cannot provide** — Syrto only helps with Italian portfolio companies, not the fund vehicle itself:
- Stated investment thesis, sector focus, and check-size / deal-size range
- Explicit exclusion criteria (some funds rule out certain sectors, geographies, or deal sizes)
- Portfolio company list — check for existing holdings in the target's space or adjacent spaces. For any Italian portfolio company found, re-verify its financials and ownership in Syrto rather than relying on the fund's own website description:
  - Holds a similar-sized or smaller company already → **flag as a strong add-on candidate**, name the specific portfolio company
  - Holds a much larger company in the space already → **flag as unlikely**: they may be past the point of bolting on a company this size, or already have the platform they need
  - Fund doesn't do buy-and-build / add-on investing at all (check their site for stated strategy) → **flag as not applicable**, even if the sector matches

#### Ownership & legal structure (every shortlisted sponsor)

- **UBO / GP structure** — who controls the fund (founding partners, a larger listed asset manager parent, a sovereign wealth or pension anchor investor) — relevant for knowing who ultimately signs off
- **Portfolio company ownership chain** — for the specific portfolio company being considered as an add-on platform, pull its structure from Syrto if it's Italian (`syrto_get_company_structure`): is it wholly owned by the fund, or is there management/minority co-investment that also needs to agree? Do not guess this from the fund's marketing materials if the company is Syrto-covered.
- **Listed-parent cross-check** — check whether the sponsor's own parent (some asset managers are publicly traded) is listed. This is a fund-level fact not covered by Syrto, so a web check is appropriate here.

#### Rationale framework (fill in for every sponsor, adapted from the strategic framework)

| Element | What to assess |
|---|---|
| **Strategic/thesis fit** | Sector focus match, platform vs. add-on fit, geography, stated investment criteria |
| **Deal thesis** | One-sentence explanation of why this sponsor would pursue the target |
| **Potential synergies** | For add-ons: cost synergies with the existing portfolio company, cross-selling, procurement, management overlap |
| **Market position impact** | Would this create/strengthen a platform, consolidate a fragmented market, or add scale to an existing portfolio company? |
| **Integration logic** | If an add-on, can the existing portfolio company's team realistically integrate the target, or is it already stretched? |
| **Must-have vs. nice-to-have** | Is this the platform-defining deal for the fund's stated strategy, or an opportunistic bolt-on? |

Use Syrto for the numbers side of this check (target financials, and financials of any existing Italian portfolio company) so the fit assessment is grounded in verified data, not just impressions from a website.

#### Financial capacity (every shortlisted sponsor)

- Fund size and vintage; stage of the investment period (early vintage = more dry powder and more time; late vintage = more urgency but less capacity) — fund-level fact, verify on the fund's own site/press
- Estimated dry powder (undeployed capital) if disclosed or inferable from fund size and known deployment
- Typical check size / deal size range vs. the target's implied valuation — is this deal in their normal range, too small, or too large?
- If an add-on: the existing portfolio company's own financial capacity to fund/absorb the deal (revenue, EBITDA, leverage headroom, net debt/EBITDA) — **pulled from Syrto if Italian, not estimated from the web**
- Recent deployment pace and fund performance signals (are they actively closing deals, or quiet?)

For each sponsor, summarize into (in Italian in the final output):

| Fondo | Dimensione Fondo | Focus Settoriale | Sovrapposizione Portfolio | Struttura Proprietà/GP | Parent Quotato (Sì/No) | Fit Add-on (Sì/No/Non chiaro) | Capacità Finanziaria | Attività Recente | Tier |
|---------|-----------|-------------|-------------------|--------------------------|------------------------------|------------------------------|----------------------|-----------------|----------|
| | | | | | | | Solida/Adeguata/Tesa | | 1/2/3 |

