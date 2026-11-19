# Buyer List — Understand the Target & Strategic Buyers

Reference for the `buyer-list` skill. Read this before executing Step 1 (Understand the Target) and Step 2 (Strategic Buyers). Apply the L0/L1/L2 data-depth ladder from the main SKILL.md throughout.

---

### Step 1: Understand the Target

Syrto is the primary, authoritative source for the target's profile — use it first and treat it as ground truth over anything found on the open web.

- **From Syrto** (resolve the target by name or tax ID first, then):
  - company profile: legal name, sector/ATECO code, description, business model
  - financial analysis over several recent years: revenue, EBITDA, margins, growth trend, balance sheet health (financials are the most important data point here, so read the multi-year trend, not a single year). If the target heads a group, read its consolidated statement too and say which basis each figure uses.
  - ownership structure: shareholders, group structure, parents or subsidiaries. Listed status is not in Syrto: only an S.p.A. or S.a.p.a. can be listed, so the legal form settles most cases and a web check confirms the rest.
  - thematic spider profile: how the target scores on each financial theme against companies of the same sector class and size band in its macro-area, useful for framing the target's positioning to buyers
- **From the open web** (secondary — adds color, never overrides Syrto): the target's own website (products, positioning, management team, customer logos) and recent news (funding rounds, management changes, litigation, expansion plans, awards)
- Key assets and capabilities (IP, customer relationships, geographic footprint, team)
- **Expected valuation range** — don't just ask the seller for a target number. Ask the user for the **median EV/EBITDA multiple of the relevant market/sector**, then reverse-engineer an implied valuation range from the target's EBITDA (low/base/high case around that median). Present this as an implied range grounded in market multiples, not a fixed asking price.
- Seller preferences (strategic vs. financial, management continuity, timeline)


### Step 2: Strategic Buyers — Syrto-first, Italian-only

**Strategic buyers proposed on this list must be Italian companies.** Do not include foreign industrial strategics, even as "out-of-the-box" or aspirational names. If the seller specifically asks to widen the search to foreign strategics, treat that as an explicit exception and flag it clearly as outside the default scope of this skill.

**Syrto is the exclusive discovery engine for strategic candidates, not the open web.** Use Syrto's company search (semantic, narrowed where useful by sector, size band, radar position, ownership type or geography; the search-filter documentation lists the exact fields) to screen the target's sector *and* adjacent sectors for candidates. Aggregating a population gives market-context statistics but names no companies. Do not use general web search to *discover* new candidate names: web search is only for enriching a company Syrto has already surfaced (positioning, recent news, strategic commentary), never as the primary sourcing mechanism.

**Running Syrto semantic searches.**

- Keep the default relevance cutoff on every search, including the lateral outside-the-box queries. It is tuned for competitor discovery, and a genuinely interesting buyer rarely sits below it. The looseness of the lateral queries must come from *reformulating the query* toward adjacent activities, not from lowering the cutoff.
- Run one search per buyer category, one at a time (see `core.md` §6). Within a category, put alternative phrasings of the same activity in one search as a list of queries: the search keeps a company that matches any of them, which saves sequential calls without mixing categories.
- Put the size floor in the search (the target's value of production for the reference year as a minimum), so results arrive pre-gated and each match reports its size. Keep each response light with focused queries rather than deep pagination.

Identify strategic acquirers across categories, all sourced from Syrto:

**Direct Competitors**
- Companies in the same space (same or closely related ATECO/NACE codes) that would gain market share
- Rationale: Revenue synergies, eliminate competitor, scale

**Adjacent Players**
- Companies in adjacent markets — found via semantic search on business-activity descriptions near, but not identical to, the target's — that could expand into the target's space
- Rationale: Product extension, cross-sell, new market entry

**Vertical Integrators**
- Customers or suppliers that could integrate vertically — screen via Syrto for companies whose activity description signals a supply/customer relationship to the target's sector
- Rationale: Supply chain control, margin capture, strategic lock-in

**Platform Builders**
- Larger Italian companies actively building a platform in the space through M&A (identifiable via a size or radar-position floor in company search, the subsidiaries listed in their ownership structure as Syrto's own sign of past acquisitions, plus a quick web check for recent acquisition activity)
- Rationale: Tuck-in acquisition, fill capability gap

**Buyer non evidenti ("outside-the-box") — give these explicit prominence, don't bury them**

This is not an optional add-on category — it deserves as much attention as the obvious direct-competitor screen, and the resulting names must be visually and structurally distinguished in every output (see Step 6), not folded quietly into a low tier just because they are less obvious.

- Deliberately run additional Syrto semantic searches using looser, more lateral business-activity phrasing than the target's own description — think about what *else* the target's product touches (its customers' adjacent needs, its suppliers' other end-markets, regulatory/compliance angles, data or technology by-products the target generates) and search for Italian companies operating in those spaces.
- Size those adjacent spaces by aggregating the population if that helps, then find the Italian companies in them with company search plus a size or radar-position floor: companies big enough to make a move that haven't obviously done so yet.
- The justification for an outside-the-box buyer is **not** "similar business" — it is a genuine point of contact: shared customer base, a capability the target has that the buyer's stated strategy is reaching for, a data/technology asset that complements the buyer's core business, a geographic or distribution overlap, or a signal (from Syrto's growth/size trend or from a quick web check of recent news) that the buyer is actively diversifying. State this point of contact explicitly and concretely for every name in this group — a vague "could be interesting" is not sufficient.
- Target 4-8 outside-the-box names minimum; treat this as a real research task, not a token gesture.

**Size test (gate before deeper work):** the buyer must be meaningfully larger than the target (comparable-or-bigger revenue/EBITDA, at minimum). A buyer smaller than or roughly the same size as the target is not a credible strategic acquirer — exclude it, or explicitly flag it as a "merger of equals" if that's the only realistic structure. Use Syrto's own financials to check the buyer's size against the target's; don't rely on reputation or headline brand size alone. A buyer that heads a group is judged on its consolidated figures where it files them, because a holding's individual accounts can understate the group by orders of magnitude; say which basis each buyer's size uses.

#### Ownership & legal structure (every shortlisted strategic buyer) — Syrto is the source, not the web

Pull this from Syrto (ownership structure and company profile) for every buyer that reaches the shortlist, since all strategic buyers are Italian and therefore Syrto-covered. Syrto is more reliable than general web sources for this data — do not substitute a web guess where Syrto has an answer. Run the ownership structure at L2, one company per read so the full UBO/group chain comes back, only for the names that earn a deep-dive (provisional Tier 1/2, every outside-the-box candidate, and the deep-dive names). Provisional Tier 3 names stay at L1 (the batched size read) and don't get a structure pull:

- **Ultimate Beneficial Owner (UBO)** — who ultimately controls the buyer (person, family, holding company, fund, state), since this is who a corp-dev conversation eventually has to satisfy
- **Group structure** — subsidiaries, parent company, sister companies; is the buyer itself a subsidiary that would need parent-company approval to acquire?
- **Ownership type** — family-owned, founder-owned, financial-sponsor-owned (PE/VC-backed), state-owned/public-sector-linked, or widely-held/listed. This affects both decision speed (family businesses can move fast or be very conservative) and how the deal would likely be financed. Show it in plain Italian, as the capability map names Syrto's ownership categories.
- **Listed-company status** — no Syrto tool reports it. Only an S.p.A. or S.a.p.a. can be listed, so the legal form in the ownership structure rules most names out; confirm the rest with a web check.

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

This is the L2 deep-dive: run it in full for provisional Tier 1/2 names, every outside-the-box candidate, and the deep-dive names; Tier 3 keeps the L1 size read. One financial analysis per buyer, over several recent years and with its automatic benchmark, covers the list below; reach for a specific metric read only for a figure the analysis does not carry. Pull from Syrto, since every strategic buyer here is Italian and Syrto-covered; do not substitute web-sourced or estimated figures where Syrto has the data:

- Revenue and EBITDA as a multi-year trend, not a single year
- Cash balance and net debt / leverage (net debt / EBITDA)
- Ability to cover additional debt (existing leverage headroom, interest cover)
- Efficiency (margins, ROIC/ROE vs. sector) and whether the buyer is performing better or worse than its market. The automatic benchmark from the same financial analysis compares the buyer with companies of the same sector class and size band in its macro-area, so it costs no extra request and self-adjusts for outside-the-box buyers sitting in adjacent sectors. (Aggregating a population is for sizing the *target's* market once in Step 1, not a per-buyer benchmark.)
- Recent M&A activity — Syrto has no deal history, though the subsidiaries in the ownership structure show what the buyer already controls; a light web check is appropriate here specifically (not for the underlying financials) to see when and how recent deals were financed, as a signal of remaining capacity

For each strategic buyer, summarize into (in Italian in the final output):

| Buyer | Categoria | Fuori dagli schemi (Sì/No) | Fatturato | Dimensione vs Target | Tipo proprietà | Quotata (Sì/No) | Fit strategico | Capacità finanziaria | Track record M&A | Tier |
|-------|--------|---------|-----------------|-----------------|---------------|----------------|---------------------|--------------------|------------|----------|
| | | | | Maggiore/Comparabile/Minore | Famiglia/Fondatore/Gruppo industriale/Fondo PE/Stato/Quotata | | Alto/Medio/Basso | Solida/Adeguata/Tesa | Attivo/Moderato/Nessuno | 1/2/3 |

The "Tipo proprietà", "Quotata", "Capacità finanziaria" and "Track record M&A" columns all come from the L2 deep-dive (ownership type from the ownership structure, listed status from the legal form plus a web check, financials from the multi-year financial analysis), so they are fully populated for Tier 1/2 and outside-the-box names; for Tier 3 (screened at L1 only, the batched size read) give a coarse read or leave them blank rather than forcing a deep-dive. "Fatturato" and "Dimensione vs Target" come straight from the L1 batched comparison, so they are populated for every screened name.
