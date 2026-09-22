---
name: syrto-comparables
description: >
  Find comparable companies (peer group) for any Italian company using Syrto data.
  Trigger when the user types "comparables [company name]" or "comparables [partita iva/codice fiscale]",
  or asks for aziende simili, peer group, comparable, benchmarking competitivo, competitor, analisi comparativa,
  or confronto con aziende simili. Crafts a semantic search prompt from the company's short description,
  asks the user for a revenue range, searches for similar companies, then selects the top 5 direct competitors
  by comparing activity descriptions and target markets (NOT Ateco codes).
  Trigger examples: "comparables Enel", "comparables 00484960588", "peer group di Luxottica",
  "chi sono i competitor di Ferrari", "trova aziende simili a Mutti".
  Do NOT trigger for single company overview or report — those are other skills.
---

## PRECONDITION — user profile required (do this FIRST)
# Syrto Comparables Finder

This skill finds comparable companies to a target company using Syrto's semantic search, filtered by a user-specified revenue range, then narrows down to the 5 most direct competitors.

## When to Use

The user triggers this with phrases like:
- `comparables Enel`
- `comparables 00484960588`
- "trova aziende simili a [azienda]"
- "peer group di [azienda]"
- "chi sono i competitor di [azienda]"
- "benchmarking [azienda]"

## Workflow

### Step 1: Find the Target Company

Call `syrto_find_company` with the company name or codice fiscale/partita IVA.
- Strip legal form suffixes (S.p.A., S.r.l., etc.) before searching
- If multiple results, pick the best match or ask the user
- Save the `company_id`

### Step 2: Fetch Target Company Data (in parallel)

Launch these calls simultaneously:

1. **`syrto_get_company_anagraphic`** → get the `activity_overview` (the short description of what the company does), the `target_markets_description` (who their customers are), and the sede/regione
2. **`syrto_get_company_metrics`** with `metric_slugs`: `revenues_from_sales_and_services,ebit_margin,net_financial_position_ebitda,revenue_cagr_3_years,ebitda` for the most recent year → get the revenue figure (useful context for suggesting a range to the user)

### Step 2b: Fallback — Missing Description Data

Small companies on Syrto may not have `activity_overview` and/or `target_markets_description`. If either field is null or empty after Step 2:

1. **Look up the company online.** Use the `website_url` from Syrto anagraphic data (if available), or search the web for the company name.
2. **Show the website to the user** and ask them to confirm it's the right company (e.g., "Ho trovato il sito dell'azienda: https://www.example.com — è corretto?").
3. **Once confirmed, read the website** and generate the missing fields yourself, matching the style and format of Syrto's own descriptions.

When generating these fields, follow Syrto's style closely. Here are real examples to use as reference:

**`activity_overview` examples from Syrto:**
- "Management and strategy consulting for Italian SMEs: M&A, organization, digitalization, compliance, sustainability, sector-focused integrated solutions."
- "Designs, engineers, and builds high-performance and luxury sports cars, runs motorsport teams, and delivers brand experiences."
- "Produces and distributes premium frozen and chilled ready meals, sauces, and pasta for retail and foodservice channels."
- "Develops and operates cloud-based ERP and management software for Italian SMEs, with modules for accounting, invoicing, warehouse, and CRM."

**`target_markets_description` examples from Syrto:**
- "Primarily targets SMEs and mid-market enterprises seeking growth and transformation across multiple sectors."
- "Targets B2C consumers and enthusiasts of luxury sports cars, racing experiences, and premium lifestyle products."
- "Serves large-scale retail chains, independent grocery stores, and professional foodservice operators across Italy and Europe."
- "Targets micro-enterprises, freelancers, and small businesses needing affordable, easy-to-use management tools."

The pattern: `activity_overview` is a concise, factual description of what the company does (products, services, core activities) — typically one sentence. `target_markets_description` describes who they sell to (customer type, segments, channels) — also one sentence.

Generate both fields and show them to the user for confirmation before proceeding.

### Step 3: Ask the User for Revenue Range

Do NOT assume a revenue range. Instead, present the target company's revenue to the user and ask them what range they want to search in. This is important because different use cases require different ranges — an M&A advisor might want companies half the size, while a benchmarking exercise needs companies of similar scale.

Ask the user something like:

```
L'azienda ha un fatturato di XX,XM €. In che range di fatturato vuoi cercare le comparabili?
- Inserisci min e max (es. "5M - 50M")
- Oppure solo un massimo (es. "fino a 100M")
- Oppure un range relativo (es. "±40%")
```

Use the user's answer to set the `min` and `max` for the revenue filter in the next step. If the user gives a relative range like "±40%", calculate it from the target's revenue. If they give only a max, set min to 0.

### Step 4: Build the Semantic Search Prompt

Take the `activity_overview` from Syrto (the short description) and craft a prompt that describes **specifically** the type of business this company does. The goal is NOT to broaden or generalize into a wider market — it's to write a precise, well-structured description of the same business activity.

**How to build the prompt:**
1. Read the `activity_overview` from Syrto
2. Rewrite it as a clear, specific description of what this type of company does
3. Keep it faithful to the original — don't add adjacent sectors or unrelated specializations
4. Structure it as a natural sentence that works well as a semantic search query

**Example:**
- Syrto `activity_overview`: "Management and strategy consulting for Italian SMEs: M&A, organization, digitalization, compliance, sustainability, sector-focused integrated solutions."
- Your crafted prompt: `"Management and strategy consulting firms advising small and medium-sized enterprises (SMEs), specializing in one or more of the following: mergers and acquisitions (M&A), organizational design, digital transformation, regulatory compliance, ESG and sustainability."`

**Another example:**
- Syrto `activity_overview`: "Progettazione e fornitura di sistemi di illuminazione naturale, ventilazione e evacuazione fumi, software, consulenza e manutenzione."
- Your crafted prompt: `"Aziende che progettano, forniscono e supportano sistemi di illuminazione naturale, sistemi di ventilazione naturale e sistemi di evacuazione fumi, incluse le relative soluzioni software, consulenza tecnica e servizi di manutenzione."`

The prompt stays specific to what the company actually does — it just restructures the short description into a clean query that works well for Syrto's semantic matching engine.

Show the crafted prompt to the user before searching, so they can adjust it if needed.

### Step 5: Search for Comparable Companies

Use `syrto_search_companies` with:
- `anagraphic_filters`: use `semantic_search` set to the **prompt crafted in Step 4**. Set `match_cutoff` to 0.5 to get a good breadth of results while keeping relevance.
- `metric_filters`: filter by `revenues_from_sales_and_services` with the `min` and `max` from Step 3
- `year`: most recent available year (typically current year - 2, e.g. 2024 for data available in 2026)

This should return companies that do similar things AND are in the user's desired revenue bracket.

If fewer than 10 results come back, consider widening the revenue range slightly or lowering the `match_cutoff` to 0.4. If still too few, note this to the user — some niches are small.

**Important — save the per-result fields you'll reuse.** For each result the search returns, keep:
- the `company_id`
- the `match_score` (the semantic match score — you'll show it in the final top 5)
- the `short_description` (the company's activity summary, returned by every semantic search result)

Holding on to `short_description` here is what lets Step 6 skip a batch of extra API calls.

### Step 6: Select the Top 5 Direct Competitors

The semantic search returns up to 10 companies ranked by similarity, but similarity alone doesn't guarantee they're direct competitors. This step filters for the most relevant ones.

The good news: the semantic search already handed you each candidate's `short_description` (its activity summary) in Step 5. That is the same information as the `activity_overview` you'd otherwise fetch, so **do not call `syrto_get_company_anagraphic` for the candidates just to read their activity** — reuse the `short_description` you already saved. Firing off ~10 anagraphic calls to re-fetch data you already have is wasted time and API cost.

You only need `syrto_get_company_anagraphic` for a candidate in two situations:
- its `short_description` came back empty or missing from the search, or
- the activity comparison is a genuine toss-up and you want `target_markets_description` (which the search does not return) to break the tie.

In those cases, fetch anagraphic only for the specific companies that need it — not the whole list.

Now compare each candidate against the target company:

1. **Activity match:** Does the candidate do the same core business? Compare its `short_description` with the target's `activity_overview`. Companies that perform the same type of work (not just adjacent or tangentially related) score higher.

2. **Market match:** Does the candidate serve the same type of customers? Where you have `target_markets_description` (the target always, candidates only if you fetched it), compare it with the target's. Companies that describe working with the same kind of clients (e.g., both serve SMEs, both target industrial manufacturers, both sell to end consumers) are more likely direct competitors. When you don't have a candidate's target-market text, lean on the activity match and, if needed, fetch anagraphic for just the borderline names.

A company that both does the same thing AND serves the same customers is a direct competitor. A company that does something similar but serves a completely different market (e.g., same product but different customer segment) is less relevant.

Select the **5 most relevant** companies based on this analysis and present them to the user with their name, activity description, target market (where known), revenue, and the **semantic match score** from the original search (so the user can see how closely Syrto matched them).

### Step 7: Ask About Excel Export

After presenting the top 5, ask the user whether they want an Excel export of the comparison table:

```
Vuoi che ti crei un file Excel della tabella di confronto?
```

If yes, ask the user what additional columns they want beyond the default set. The default columns are:

| Colonna | Fonte |
|---------|-------|
| Codice Fiscale / Partita IVA | anagraphic (tax_id) — always first column |
| Ragione Sociale | anagraphic (company_name) |
| Fatturato | metrics (revenues_from_sales_and_services) |
| EBIT Margin | metrics (ebit_margin) |
| Tipo Ownership | structure (controlling_entity_category) |

The user may ask for additional data like PFN/EBITDA, CAGR, shareholders, regione, etc. Add the columns using the appropriate Syrto tools.

**Fetch the financials for all 5 in a single call.** Use `syrto_compare_companies` with the 5 `company_id`s, the metric slugs for every financial column requested (e.g. `revenues_from_sales_and_services,ebit_margin` plus any extras like `net_financial_position_ebitda` or `revenue_cagr_3_years`), and the `year` you searched on. `compare_companies` fetches the same slugs for all companies in one API call, so it is much faster (one batched call) than looping `syrto_get_company_metrics` company-by-company — reach for it whenever you need the same metrics across the peer group. (It requires a `year`; use the same one as the search.)

**Only fetch ownership data when a column actually needs it.** `syrto_get_company_structure` must be called once per company, so treat it as the expensive step it is. Call it only if the "Tipo Ownership" column (or any other ownership/shareholder column the user asked for) is in the final set — and then only for the 5. If the user drops ownership from the columns, skip `get_company_structure` entirely.

Read the `xlsx` skill before generating the Excel; the file's formatting follows the `xlsx` skill (and the suite's `core.md`), not a hand-built layout. Save the Excel to the outputs directory and provide the user with a link.

## Formatting Rules (for Excel and chat output)

- Values >= 1B: "X,XB €"
- Values >= 1M: "XX,XM €" (one decimal if under 10M: "X,XM €")
- Values >= 1k: "XXXk €"
- Percentages: Italian format with comma (e.g., "12,3%")
- Ratios: two decimals, comma separator (e.g., "2,34")
- Null/missing: "N/D"
- Percentage metrics from Syrto come as ratios (0.12 = 12%) — multiply by 100

## Ownership Type Translation

- FAMILY → "Familiare"
- INDUSTRIAL_GROUP → "Gruppo industriale"
- FINANCIALLY_OWNED_GROUP → "Proprietà finanziaria"
- PUBLIC → "Pubblico"
- Unknown/null → "N/D"

## Important Notes

- The crafted semantic prompt should be specific and faithful to the company's `activity_overview` — it's a clean rewrite of what they do, not a broader market definition.
- The revenue range is always user-specified because different use cases need different ranges. Never assume the range — always ask.
- The final selection (Step 6) is what makes this skill valuable: semantic search finds broadly similar companies, but comparing activity descriptions and target markets identifies the real direct competitors. Reuse the `short_description` the search already returned rather than re-fetching it.
- Always include the Syrto API `note` field as a disclaimer at the bottom.

---
_Fonte dati: Syrto_

## Radar positioning (optional)

If the question is really about *where this company sits* rather than which numbers it posts,
`syrto_radar_map` places it on size × efficiency scored across Syrto's whole database — so
companies from different sectors compare directly, and it is the only tool that returns
labelled forecast points. `peer_filters` / `aggregates` take the same `filters` object as
`syrto_search_companies` and resolve inside the call, so a company-vs-sector view needs no
prior search. For a file, `syrto_radar_chart` returns the same chart as an embeddable SVG.
Optional — reach for it when positioning is the point, not as a routine step.
