# Buyer List — Understand the Target & Strategic Buyers

Reference for the `buyer-list` skill. Read this before executing Step 1 (Understand the Target) and Step 2 (Strategic Buyers). Apply the L0/L1/L2 data-depth ladder from the main SKILL.md throughout.

---

### Step 1: Understand the Target

Syrto is the primary, authoritative source for the target's profile — use it first and treat it as ground truth over anything found on the open web.

- **From Syrto** (use `syrto_find_company` / `syrto_search_companies` to locate the target, then):
  - `syrto_get_company_anagraphic` — legal name, sector/ATECO code, description, business model
  - `syrto_get_company_metrics` / `syrto_get_company_analysis` — revenue, EBITDA, margins, growth trend, balance sheet health (financials are the most important data point here — pull the multi-year trend, not a single year)
  - `syrto_get_company_structure` — ownership / shareholder structure, group structure, parents or subsidiaries, and `is_quoted` (listed status — see note below)
  - `syrto_get_spider_data` — quick view of financial health vs. sector benchmark, useful for framing the target's positioning to buyers
- **From the open web** (secondary — adds color, never overrides Syrto): the target's own website (products, positioning, management team, customer logos) and recent news (funding rounds, management changes, litigation, expansion plans, awards)
- Key assets and capabilities (IP, customer relationships, geographic footprint, team)
- **Expected valuation range** — don't just ask the seller for a target number. Ask the user for the **median EV/EBITDA multiple of the relevant market/sector**, then reverse-engineer an implied valuation range from the target's EBITDA (low/base/high case around that median). Present this as an implied range grounded in market multiples, not a fixed asking price.
- Seller preferences (strategic vs. financial, management continuity, timeline)


### Step 2: Strategic Buyers — Syrto-first, Italian-only

**Strategic buyers proposed on this list must be Italian companies.** Do not include foreign industrial strategics, even as "out-of-the-box" or aspirational names. If the seller specifically asks to widen the search to foreign strategics, treat that as an explicit exception and flag it clearly as outside the default scope of this skill.

**Syrto is the exclusive discovery engine for strategic candidates — not the open web.** Use `syrto_search_companies` (with `semantic_search`, `nace`, `radar`, `size`, and geography filters) and `syrto_aggregate_companies` (for market-context statistics) to screen the target's sector *and* adjacent sectors for candidates. Do not use general web search to *discover* new candidate names — web search is only for enriching a company Syrto has already surfaced (positioning, recent news, strategic commentary), never as the primary sourcing mechanism.

**Running Syrto semantic searches — settings that keep it fast.** Two practical rules that matter every time you search:

- **Set `filters.anagraphic.match_cutoff` to 0.8** on every `semantic_search`. The default (0.7) and especially a lower 0.6 drag in weak matches that are almost never worth the noise — a genuinely interesting buyer rarely sits below 0.8. For the lateral outside-the-box queries keep 0.8 as well: the looseness there must come from *reformulating the query* toward adjacent activities, not from lowering the threshold.
- **Run the searches one at a time, not batched in parallel.** Syrto semantic search is heavy server-side, so firing several concurrent `semantic_search` calls in a single turn tends to overload the endpoint and time out — after which they get retried sequentially anyway. Issuing them sequentially from the start avoids that wasted round-trip and is faster overall. Lean on the 0.8 cutoff (and focused queries) rather than deep pagination to keep each response light.

Identify strategic acquirers across categories, all sourced from Syrto:

**Direct Competitors**
- Companies in the same space (same or closely related ATECO/NACE codes) that would gain market share
- Rationale: Revenue synergies, eliminate competitor, scale

**Adjacent Players**
- Companies in adjacent markets — found via `semantic_search` on business-activity descriptions near, but not identical to, the target's — that could expand into the target's space
- Rationale: Product extension, cross-sell, new market entry

**Vertical Integrators**
- Customers or suppliers that could integrate vertically — screen via Syrto for companies whose activity description signals a supply/customer relationship to the target's sector
- Rationale: Supply chain control, margin capture, strategic lock-in

**Platform Builders**
- Larger Italian companies actively building a platform in the space through M&A (identifiable via Syrto's size/radar filters plus a quick web check for recent acquisition activity)
- Rationale: Tuck-in acquisition, fill capability gap

**Buyer non evidenti ("outside-the-box") — give these explicit prominence, don't bury them**

This is not an optional add-on category — it deserves as much attention as the obvious direct-competitor screen, and the resulting names must be visually and structurally distinguished in every output (see Step 6), not folded quietly into a low tier just because they are less obvious.

- Deliberately run additional Syrto `semantic_search` queries using looser, more lateral business-activity phrasing than the target's own description — think about what *else* the target's product touches (its customers' adjacent needs, its suppliers' other end-markets, regulatory/compliance angles, data or technology by-products the target generates) and search for Italian companies operating in those spaces.
- Use `syrto_aggregate_companies` and the radar/size filters to find well-capitalized Italian companies in those adjacent spaces that are big enough to make a move but haven't obviously done so yet.
- The justification for an outside-the-box buyer is **not** "similar business" — it is a genuine point of contact: shared customer base, a capability the target has that the buyer's stated strategy is reaching for, a data/technology asset that complements the buyer's core business, a geographic or distribution overlap, or a signal (from Syrto's growth/size trend or from a quick web check of recent news) that the buyer is actively diversifying. State this point of contact explicitly and concretely for every name in this group — a vague "could be interesting" is not sufficient.
- Target 4-8 outside-the-box names minimum; treat this as a real research task, not a token gesture.

**Size test (gate before deeper work):** the buyer must be meaningfully larger than the target (comparable-or-bigger revenue/EBITDA, at minimum). A buyer smaller than or roughly the same size as the target is not a credible strategic acquirer — exclude it, or explicitly flag it as a "merger of equals" if that's the only realistic structure. Use Syrto's own financials to check the buyer's size against the target's; don't rely on reputation or headline brand size alone.

#### Ownership & legal structure (every shortlisted strategic buyer) — Syrto is the source, not the web

Pull this from Syrto (`syrto_get_company_structure`, `syrto_get_company_anagraphic`) for every buyer that reaches the shortlist, since all strategic buyers are Italian and therefore Syrto-covered. Syrto is more reliable than general web sources for this data — do not substitute a web guess where Syrto has an answer. Because `syrto_get_company_structure` returns ownership type, listed status (`is_quoted`) and the full UBO/group chain together in one call, there's no benefit in splitting it across depth levels — run it once, at L2, only for the names that earn a deep-dive (provisional Tier 1/2, every outside-the-box candidate, and the deep-dive names). Provisional Tier 3 names stay at L1 (the batched size read) and don't get a structure pull:

- **Ultimate Beneficial Owner (UBO)** — who ultimately controls the buyer (person, family, holding company, fund, state), since this is who a corp-dev conversation eventually has to satisfy
- **Group structure** — subsidiaries, parent company, sister companies; is the buyer itself a subsidiary that would need parent-company approval to acquire?
- **Ownership type** — family-owned, founder-owned, financial-sponsor-owned (PE/VC-backed), state-owned/public-sector-linked, or widely-held/listed. This affects both decision speed (family businesses can move fast or be very conservative) and how the deal would likely be financed
- **Listed-company status — read directly from Syrto's `is_quoted` field** (`syrto_get_company_structure`). Syrto covers this field; do not default to a web search for Italian companies. Only fall back to the open web to confirm listed status if `is_quoted` is null/missing for a specific company.

#### Rationale framework (fill in for every strategic buyer, not just a one-line note)

| Element | What to assess |
|---|---|
| **Strategic fit** | Product overlap, market adjacency, customer overlap, geography, technology, distribution, supply chain — or, for outside-the-box names, the specific point of contact identified above |
| **Deal thesis** | One-sentence explanation of why the acquisition makes sense |
| **Potential synergies** | Revenue synergies, cost synergies, cross-selling, procurement, manufacturing, SG&A savings |
| **Market position impact** | Would the buyer gain scale, enter a new market, remove a competitor, or improve margins? |
| **Integration logic** | Can the buyer integrate the target easily, or would it be complex (systems, culture, geography, regulatory)? |
| **Must-have vs. nice-to-have** | Is the asset strategically critical to the buyer's roadmap, or only opportunistic? |

Ground every row in evidence: Syrto financials and sector/radar data for the quantitative side (overlap, scale, margins, growth), and — only as a secondary layer — recent news / the buyer's own website for qualitative strategic-intent color (what they've said about their roadmap, recent deals, market commentary). Syrto data always takes precedence if there is any conflict with something found on the web.

#### Financial capacity — Syrto is the source

This is the L2 deep-dive: run it in full for provisional Tier 1/2 names, every outside-the-box candidate, and the deep-dive names — not for Tier 3, where the L1 size snapshot is enough. Pull from Syrto, since every strategic buyer here is Italian and Syrto-covered; do not substitute web-sourced or estimated figures where Syrto has the data:

- Revenue and EBITDA (multi-year trend via `syrto_get_company_metrics` with `last_n_years`, not a single year). *This full multi-year pull is L2 — run it on the shortlist only. The L1 size read does not come from here: it comes from the single batched `syrto_compare_companies` call across the whole screened pool (see the depth ladder), which is enough to size each buyer vs. the target and assign a provisional tier.*
- Cash balance and net debt / leverage (net debt / EBITDA) via `syrto_get_company_metrics`
- Ability to cover additional debt (existing leverage headroom, interest cover)
- Efficiency (margins, ROIC/ROE vs. sector) and whether the buyer is performing better or worse than its market. Take the market benchmark **inline from `syrto_get_company_analysis(include_market_data=True)`** — it returns the per-metric sector median for that buyer's own sector/size class in the same call, so it costs no extra request and, importantly, self-adjusts for outside-the-box buyers sitting in adjacent sectors. (`syrto_aggregate_companies` is for sizing the *target's* market once in Step 1, not a per-buyer benchmark.)
- Recent M&A activity — Syrto won't show deal history, so a light web check is appropriate here specifically (not for the underlying financials) to see how recent deals were financed, as a signal of remaining capacity

For each strategic buyer, summarize into (in Italian in the final output):

| Buyer | Categoria | Fuori dagli schemi (Sì/No) | Fatturato | Dimensione vs Target | Tipo proprietà | Quotata (Sì/No) | Fit strategico | Capacità finanziaria | Track record M&A | Tier |
|-------|--------|---------|-----------------|-----------------|---------------|----------------|---------------------|--------------------|------------|----------|
| | | | | Maggiore/Comparabile/Minore | Famiglia/Fondatore/Fondo PE/Stato/Quotata | | Alto/Medio/Basso | Solida/Adeguata/Tesa | Attivo/Moderato/Nessuno | 1/2/3 |

The "Tipo proprietà", "Quotata", "Capacità finanziaria" and "Track record M&A" columns all come from the L2 deep-dive (ownership and listed status from `syrto_get_company_structure`, financials from the multi-year metrics/analysis pulls), so they are fully populated for Tier 1/2 and outside-the-box names; for Tier 3 (screened at L1 only — the batched `syrto_compare_companies` size read) give a coarse read or leave them blank rather than forcing a deep-dive. "Fatturato" and "Dimensione vs Target" come straight from the L1 batched comparison, so they are populated for every screened name.

