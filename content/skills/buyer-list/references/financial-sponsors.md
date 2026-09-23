# Buyer List — Financial Sponsors

Reference for the `buyer-list` skill. Read this before executing Step 3 (Financial Sponsors).

---

### Step 3: Financial Sponsors — Italian preferred, reputable foreign funds acceptable

Discovery here works differently from strategics: find funds in current public sources or a current list supplied by the user, not from Syrto or unaided memory. Default to Italian funds; the rules for admitting a foreign fund are covered below.

Where a sponsor's portfolio company or platform is an Italian operating company, use Syrto to source and screen it the same way as strategics (company search by sector and size, then the financial analysis, then the ownership structure). Fund vehicles themselves aren't companies in Syrto, so find and verify them through public fund and association sites or a current user-supplied list. Verify any Italian portfolio company or add-on candidate directly in Syrto rather than trusting a web description of it. Optional enrichment: an Italian management company (SGR) is a registered company and may resolve in Syrto; if it does, its ownership structure can add who controls the manager, its board, and the companies sharing its officers (candidate portfolio companies, still to be verified one by one).

#### Discovery sources for funds

Syrto does not cover fund vehicles, so the discovery of sponsors must not rely on the model's memory alone — that risks missing real mid-market Italian funds and inventing plausible-but-nonexistent ones. Start with AIFI's current public member directory where available, then check each candidate's own website for an active fund, current mandate, sector, geography and deal size. Supplement with other current public sources for relevant funds outside AIFI. Cite the source and date for each candidate. Do not package or recreate a local copy of any directory.

If browsing is unavailable, ask for a current, authorized fund list or state that sponsor discovery cannot be completed. Keep unknown criteria as "unknown," not "excluded." Research a focused candidate pool and narrow it to a shortlist:

1. **Discover and rank → shortlist (~15-30).** For each candidate, verify: (a) typical check size against the target's implied valuation from Step 1; (b) investor type matching the deal (PE for buy-out/platform, VC/growth for early-stage or high-growth targets, private debt only if debt is relevant); (c) stage and investment strategy; and (d) sector and geographic fit. Generalists and adjacent-sector funds can still fit. Exclude stale, unverified and clearly mismatched candidates; do not invent missing facts.
2. **Portfolio companies → Syrto.** For the shortlisted funds, identify Italian portfolio companies from the fund's site or another current source (optionally from the SGR's ownership structure in Syrto, as above) and re-verify each in Syrto (the financial analysis for financials, the ownership structure for ownership) — this is how add-on candidates are confirmed with real numbers rather than marketing copy.
3. **Targeted extension.** Search current sources for relevant funds outside AIFI, especially foreign funds with a real Italian footprint or newer/non-member funds. Apply the same verification and Italian-footprint bar.

Then apply the same L1/L2 depth ladder as strategics: L1 screening (fund-fit + a size read of any candidate add-on portfolio companies, compared together when there are several) assigns a provisional tier for every shortlisted sponsor; the full L2 work below (fund capacity, portfolio-company multi-year financials, the portfolio company's ownership structure, web enrichment of the site) is for provisional Tier 1/2 sponsors and any that anchor an outside-the-box thesis — Tier 3 sponsors stay at L1.

**Default to Italian funds.** A foreign fund may be included only if it is well-known and has a demonstrable, verifiable footprint or stated mandate in the Italian market — every foreign name must earn its place with a concrete Italian data point (a current Italian portfolio company, a stated Italian-market mandate, or recent Italian deal activity), never added just to pad the list.

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
- **Portfolio company ownership chain** — for the specific portfolio company being considered as an add-on platform, pull its ownership structure from Syrto if it's Italian: is it wholly owned by the fund, or is there management/minority co-investment that also needs to agree? Do not guess this from the fund's marketing materials if the company is Syrto-covered.
- **Listed-parent cross-check** — check whether the sponsor's own parent (some asset managers are publicly traded) is listed. Listed status is not in Syrto, so a web check is appropriate here (for an Italian SGR that resolves in Syrto, its ownership structure can name the parent to check).

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
