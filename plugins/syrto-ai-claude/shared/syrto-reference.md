# Syrto Tool & Metric Reference

Lookup layer. Operating rules are in `core.md`.

Never expose internal identifiers (slug, syrto_code, template_slug) to users — use the
human-readable name / display_name.

## Tools

### Resolving

| Tool | Use it to |
|---|---|
| `syrto_find_company` | Name → `company_id`. Strip legal suffixes (S.p.A., S.r.l.) first. Returns candidates — pick the best or ask. Also returns the org's `credit_balance`. |
| `syrto_lookup_companies_by_tax_id` | Resolve by codice fiscale / VAT — when the name is ambiguous or you need the exact legal entity. Takes up to 20 at once. |

### Reading a company

| Tool | Use it to |
|---|---|
| `syrto_get_company_anagraphic` | Business activity, sector/ATECO, size, employees, website, target markets. ALWAYS read first. |
| **`syrto_get_company_analysis`** | **The default financial read.** One call, pre-grouped: revenue, value of production, profit, EBITDA, EBIT, ROE/ROA/ROI/ROIC, growth, working capital, cash conversion cycle, current ratio, NFP, debt/EBITDA, leverage, asset composition, capex intensity — plus radar scores and the prior year for trend. |
| `syrto_get_company_metrics` | Only for metrics **outside** those categories (e.g. free cash flow, DPO) or a 1–5 year history. Large response — request fewer years if it overflows. |
| `syrto_get_company_structure` | Ownership, shareholders, beneficial owners, subsidiaries, officers. Each carries a `person_id`. |
| `syrto_list_company_branches` | Registered secondary locations (sedi secondarie / unità locali), with HQ returned separately. |
| `syrto_get_spider_data` | Thematic radar/spider deep-dive. |
| `syrto_generate_financial_statement` | Full statement reconstruction. Needs a `template_slug` from `syrto_list_financial_statement_templates` — don't guess one, and don't fetch templates as part of a routine overview. |

> **Do not open a company read with `syrto_get_company_metrics`, `syrto_list_available_metrics`
> or `syrto_search_metric_definitions`.** `get_company_analysis` already returns everything a
> broad analysis needs in a single call, with no slug selection. Reach for the others only when
> a specific metric is confirmed to be outside its categories.

**Free sector benchmark.** `include_market_data: true` on `get_company_analysis` adds a peer
value per metric at no extra call. The reference market is same NACE 4-digit + size bucket +
macro-region (country-wide for L), and **no field names it** — so never present it as "the
Italian sector average". It is a quick read; for a real perimeter use `market-benchmark`.

### Discovery & comparison

| Tool | Use it to |
|---|---|
| `syrto_search_companies` | Semantic + filtered search. The engine for discovery and lookalikes. |
| `syrto_aggregate_companies` | Sector/peer aggregates → benchmark medians, market sizing. |
| `syrto_compare_companies` | Many companies, same metrics, one call. |
| `syrto_get_search_filter_docs` | The authoritative field list for the `filters` object. Call it before assembling filters rather than guessing field names. |
| `syrto_list_available_metrics` / `syrto_search_metric_definitions` | Find an exact metric slug when one is missing. |

### People

| Tool | Use it to |
|---|---|
| `syrto_find_person` | Name → `person_id`, with up to five officerships, shareholdings and beneficial ownerships each. Also returns `credit_balance`. |

Two things this unlocks that the suite did not have:

1. **Person → companies.** The returned company entries identify themselves by **`tax_id`, not
   company id** — collect the tax ids and batch them through `syrto_lookup_companies_by_tax_id`
   (20 per call) to get usable ids. A rare entry has no tax id, or comes back `not_found`: that
   company is identifiable by `legal_name` only, so say so rather than guessing an id.
2. **The `people` filter section** on `syrto_search_companies` and `syrto_aggregate_companies`
   takes `person_id` values — so a search can be anchored on a person.

**Matching is strict.** Exact spelling, no fuzzy matching, names stored surname-first
(`Rossi Mario`). **Capitalise as stored**: only the exact rung is case-sensitive, so a
lower-cased query silently skips it and answers from the prefix rung, burying the people who
carry the name exactly. Exactly one of three rungs answers a call — exact, else prefix, else
substring; `warning` names the rung and how to widen. Use `match: "contains"` to widen for a
compound surname (`Conti Marco` → `Bonanno Conti Marco`).

> **Contact purchase is out of scope for this suite.** `syrto_get_person_contacts` and
> `syrto_request_person_contacts` exist and spend the organization's credits. Do not call them
> as part of any skill flow. If a user explicitly asks to buy contacts, tell them the cost first
> and get explicit agreement — never as an automatic step in a prospect list.

### Official documents

`syrto_list_official_documents` is free to call and lists what's available (visure, filed
accounts, statuti, protesti) with slugs and credit costs, what the organization already owns,
and the credit balance. Purchases are **organization-wide** — a colleague may already have paid.
Download links expire after ~6 hours and this tool **re-issues them at no cost**, so "the link
doesn't work" is a re-list, never a re-purchase.

`syrto_request_official_document` **spends credits**. Only on explicit user request, after
stating the document name and its cost and getting agreement.

### Usage

`syrto_get_usage` reports the **signed-in user's own** consumption in CU across four windows.
It is not the organization's total, not a remaining balance, and not a bill. There is no
per-conversation figure. The org's **remaining credits** come back free on `find_company`,
`find_person` and `list_official_documents`. Anything about plans, allowances, members or
passwords → the dashboard (https://dashboard.syrto.ai).

## Radar — available, not mandatory

`syrto_radar_map` and `syrto_radar_chart` score companies on **size × efficiency (0–100)**,
scaled across Syrto's whole database rather than within a sector — so companies from *different*
sectors sit on the same axes and compare directly. They are also the **only** tools that return
forecast points, and those are labelled.

Worth reaching for when a positioning question is the actual question — a company against its
sector, a set of buyers or add-on targets side by side, a portfolio against a watchlist. Not
required by any skill, and not a replacement for metric analysis when specific numbers are what
the user asked about.

- `syrto_radar_map` — the on-screen answer. **This client may not render the widget**, so treat
  what comes back as numbers: each company's earliest filed position, its latest, and where its
  projection ends. Report that in prose or a small table; don't read coordinates aloud.
- `syrto_radar_chart` — the same chart as a self-contained **SVG**, for writing into a file.
  Use it when an HTML report or PDF is being produced: write it to `.svg` and reference it, or
  inline it in the HTML. Vector, no network, no fonts needed.

`peer_filters` and `aggregates` accept the same `filters` object as `syrto_search_companies`,
**resolved inside the call** — so "this company against its sector" needs no prior search.
`aggregates` draws a population's average as one line; `peer_filters` plots its members.
`company_lists` colours named sets separately. Right = larger, up = more efficient; 50 is the
scale midpoint, not an average, so read positions relative to the other companies plotted.

## Core metric slugs

| Concept | Slug | Notes |
|---|---|---|
| Revenue / production value | `value_of_production` | Primary size measure. |
| Revenue from sales & services | `revenues_from_sales_and_services` | Denominator for many ratios. |
| Production costs | `production_costs` | |
| Raw materials purchases | `cost_raw_materials` | Spend hook — materials sellers. |
| Services costs | `cost_services` | Spend hook — software/services sellers. |
| Personnel costs | `personnel_costs` | Spend hook — staffing/payroll sellers. |
| EBITDA / margin | `ebitda` · `ebitda_margin` | Margin is a ratio (0.12 = 12%). |
| EBIT | `ebit` | |
| Net profit | `profit` | Negative = loss, credit-risk flag. |
| Total assets / liabilities | `total_assets` · `liabilities` | |
| Net worth | `net_worth` | Negative = serious distress. |
| Net financial position | `net_financial_position` | Leverage vs equity. |
| Current / quick ratio | `current_ratio` · `quick_ratio` | < 1 = liquidity flag. |
| Cash conversion cycle | `cash_conversion_cycle` | Days; longer = weaker. |
| 3-year revenue CAGR | `revenue_cagr_3_years` | Growth momentum. |
| Invested capital | `invested_capital` | |
| Personnel cost / revenue | `personnel_cost_to_revenue` | Ratio. |

Slug missing from a response → `syrto_search_metric_definitions`, never a guess.

## Search parameters that matter

- `match_cutoff` — minimum semantic relevance, e.g. `0.75`. Below that is noise.
- `sort_by: match_score desc` — rank by relevance, not size. Big companies are not the best matches.
- `nace` — OPTIONAL. Hard exclusions or an explicit user-requested narrowing only. Never a
  default target gate, or you drop the out-of-sector targets semantic search exists to surface.
- `semantic_search` and `match_cutoff` go inside `filters.anagraphic`. Cursor pagination
  (`after`, 25/page) — there is no `offset` / `limit`.

## Data hygiene

- Percentage and ratio metrics arrive as decimals (0.1065 = 10.65%). Convert before use.
- Size mapping: L = Grande · M = Media · S = Piccola · XS = Micro impresa.
- A company record is its **individual** statement unless another basis was requested — the
  `consolidated` field says which. Group figures can differ by orders of magnitude.
- Branches are **registry records of registered locations**. Do not infer that a site is
  operating, staffed, a plant/shop/warehouse, a sales territory, or where revenue arises. An
  empty list is not evidence of single-site operation. Branches carry no name of their own.
- Carry the Syrto `note` / disclaimer into every exported deliverable.
