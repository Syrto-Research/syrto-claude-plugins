# Syrto capability map

Tool names below are current as of 2026-09-22; if a name is missing, pick the tool whose description
matches the capability.

Skills name capabilities ("resolve the company", "the financial analysis"); this file maps them to
tools. How to call a tool (parameters, limits, pages, field meanings, which ids to pass, what to show
the user) is in that tool's own description, which the Syrto server sends on every connection.
Follow the tool description over anything written here, and do not copy call details into skills.
Operating rules are in `core.md`.

## Capabilities

| Capability | The suite uses it for | Tool (current) | Suite policy on top |
|---|---|---|---|
| **Resolve the company** (by name or tax ID) | Every flow that starts from a named company | `syrto_find_company` | Prefer the tax ID when you have it. Take the candidate its returned details identify; ask the user only when they do not. |
| **Resolve a list of tax IDs** | Client lists, CRM exports, a person's companies, subsidiaries | `syrto_lookup_companies_by_tax_id` | Batch; never resolve a list one name at a time. |
| **The company profile** | Business model, sector, size, location, registry risk flags, state-aid summary | `syrto_get_company_anagraphic` | Always the first read: business fit comes from here, never from the web. Pass every company in hand in one call. |
| **The financial analysis** (with its automatic benchmark) | Health, growth, liquidity, solvency, structure; the Fit Score's solidity and growth inputs | `syrto_get_company_analysis` | The default financial read for one company. Every metric carries a 1-5 score against its reference market; ask for the reference values too only when the answer compares with the market. It does not carry the spend-hook cost lines or net worth (see the metric table). |
| **A specific metric read** (one company) | Spend-hook cost lines, net worth, cash flow, anything the analysis lacks | `syrto_get_company_metrics` | After the analysis, for named metrics only. |
| **Compare many companies** (same metrics) | Scored lists, peer tables, portfolios, spend hooks for a batch | `syrto_compare_companies` | One call per batch, never a per-company loop. All companies on one fiscal year (see Suite-wide rules). |
| **Ownership structure** | Who controls the budget, parent or shell detection, group ties, officers, legal form | `syrto_get_company_structure` | When the real buyer or the group matters. Its person ids feed a person-anchored search directly. |
| **Registered branches** | Presence beyond the head office | `syrto_list_company_branches` | Registry records only: never evidence of a plant, shop, team or sales territory. |
| **Company search** (semantic description plus filters) | Prospecting, lookalikes, buyer and add-on discovery, perimeters | `syrto_search_companies` | Sector codes only for hard exclusions or an explicit user request, never as a default gate: they drop the out-of-sector matches semantic search exists to find. The server's default relevance cutoff is 0.8; a skill that wants another value states it with its reason. Page only as far as the deliverable needs. |
| **The search-filter documentation** | Before building any filter (search, aggregates, radar populations) | `syrto_get_search_filter_docs` | Read the sections you need instead of guessing field names. |
| **Aggregate a population** | Market sizing, benchmarks, counts, splits by sector, area or size in one call, typical ranges, totals | `syrto_aggregate_companies` | One call with a breakdown, not one call per cell. Several search texts in one filter count as their union, so overlapping sub-markets can be totalled without double counting (the filter documentation gives the limit). |
| **The positioning radar** (size x efficiency, 0-100, cross-sector) | A company against its sector; buyers or targets side by side; portfolio vs watchlist | `syrto_radar_map` (in the conversation), `syrto_radar_chart` (image for a file) | Optional in every skill. Use it when positioning is the question, not when the user asked for figures. The image version only when a file is being written. |
| **The thematic spider profile** | Per-theme strengths and weaknesses against local peers | `syrto_get_spider_data` | A different concept from the radar; never call one by the other's name. |
| **Metric-definition search** | Confirming a slug, explaining a metric | `syrto_search_metric_definitions`, `syrto_list_available_metrics` | Confirm any slug before using it, including those in the table below. |
| **Financial statements** | Only when the user asks for a statement | `syrto_list_financial_statement_templates`, `syrto_generate_financial_statement` | Never part of a routine overview. |
| **Find a person** | "Which companies does X run or own?", person-anchored searches | `syrto_find_person` | When you already have the company, prefer the person id from its ownership structure: a name search can pick a namesake. |
| **Usage report** | "How much have I used?" | `syrto_get_usage` | Personal consumption only; plans and allowances are in the dashboard. |
| **Official documents (paid)** | No skill flow | `syrto_list_official_documents`, `syrto_request_official_document` | Never bought as a step of a flow. On an explicit user request only, after naming the document and its credit cost and getting a yes. Listing the catalogue and re-issuing an expired link spend no credits. |
| **Person contacts (paid)** | No skill flow | `syrto_get_person_contacts`, `syrto_request_person_contacts` | The suite never buys contacts, including inside prospect lists. If the user explicitly asks, name whose contacts and the credit cost, and get a yes first. Reading contacts the organization already bought spends no credits. |

## Suite-wide rules

- **Credits and usage are different.** Credits pay for official documents and person contacts; the
  suite never spends them on its own. Every data call counts toward the user's Syrto usage, so skip
  calls the deliverable will not use.
- **One Syrto call at a time.** Some clients time out or mix up results when tool calls run in
  parallel.
- **Fiscal year.** Never hard-code one. Use the year the chain already fixed (see the handoff in
  `core.md` §8), else the latest year the companies have filed; the tool descriptions say which
  years have broad coverage.
- **The automatic benchmark is regional.** The 1-5 scores, the reference values and the spider axes
  compare with companies of the same sector class and size band in the company's macro-area
  (country-wide for large companies). Say it in those terms («rispetto ad aziende dello stesso
  settore e della stessa classe dimensionale nella sua macro-area»). Never call it «media nazionale
  di settore», never call it a median or an average unless the skill computed that statistic itself,
  and never name the region. For a perimeter the user defines, run `market-benchmark`.
- **Listed status.** No tool reports whether a company is listed. Only an S.p.A. or an S.a.p.a. can
  be listed: use the legal form from the ownership structure to rule it out, and a web check for the
  names that matter.
- **Statement basis.** See `core.md` §7.10.

## Metric concepts

Skills name the concept; the slug lives only here. Slugs are current as of 2026-09-22: confirm any
slug through the metric-definition search before using it, and show the returned name, never the
slug. "In the analysis" means the financial analysis returns it (checked on 2026-09-22; category
membership is server configuration and can change). Otherwise fetch it with a specific metric read
for one company, or through the comparison for many.

| Concept | Slug | In the analysis | Suite use |
|---|---|---|---|
| Value of production | `value_of_production` | yes | Primary size measure; spend hook for generalists |
| Revenue from sales and services | `revenues_from_sales_and_services` | yes | Top line; ratio denominator |
| Services costs | `cost_services` | no | Spend hook: software and services sellers |
| Raw materials costs | `cost_raw_materials` | no | Spend hook: materials sellers |
| Personnel costs | `personnel_costs` | no | Spend hook: staffing and payroll sellers |
| Production costs | `production_costs` | no | Spend hook: broad operating spend |
| Personnel costs / revenue | `personnel_cost_to_revenue` | yes | Labour intensity |
| EBITDA, EBITDA margin | `ebitda`, `ebitda_margin` | yes | Profitability |
| EBIT | `ebit` | yes | Operating result |
| ROE (return on equity) | `roe` | yes | Profitability for owners |
| Net profit | `profit` | yes | Negative is a loss: credit-risk flag |
| Net worth (equity) | `net_worth` | no | Negative is serious distress |
| Net financial position | `net_financial_position` | yes | Debt level |
| Net financial position / net worth | `financial_leverage` | yes | Fit Score solidity |
| Net financial position / EBITDA | `net_financial_position_ebitda` | yes | Debt sustainability |
| Current ratio | `secondary_liquidity` | yes | Below 1 is a liquidity flag. The slug is not "current_ratio". |
| Quick ratio | `quick_ratio` | yes | Below 1 is a liquidity flag |
| Cash conversion cycle | `cash_conversion_cycle` | yes | Days; longer is weaker |
| Revenue CAGR, 3 years | `revenue_cagr_3_years` | yes | Growth momentum |
| Invested capital | `invested_capital` | yes | |
| Total assets | `total_assets` | no | EU size test (finanza agevolata) |
| Intangible fixed assets (B.I.), goodwill (B.I.5) | `intangible_fixed_assets`, `goodwill` | no | Intangible-intensity signals (finanza agevolata) |
| Unlevered free cash flow | `ufcf` | no | Cash generation |
| Payables (debiti) | `liabilities` | no | Not total liabilities |

Percentages and ratios arrive as decimals (0.1065 = 10,65%); see `core.md` §4.

## Presentation

Numbers follow the house style in `core.md` §5.

Size bands, in Italian:

| Code | Label |
|---|---|
| L | Grande |
| M | Media |
| S | Piccola |
| XS | Micro impresa |

Ownership types (who controls the company), in Italian. Show the label, never the code:

| Code | Label |
|---|---|
| FAMILY | Familiare |
| FAMILY_OWNED_GROUP | Gruppo familiare |
| FINANCIALLY_OWNED_GROUP | Proprietà finanziaria |
| INDUSTRIAL_GROUP | Gruppo industriale |
| FINANCIAL | Società finanziaria |
| OTHER | Altro |

Source line, closing every exported deliverable (the server sends no disclaimer to copy):

> Fonte: elaborazione su dati Syrto (www.syrto.ai) da bilanci depositati. Base: [individuale |
> consolidato]. Ultimo esercizio disponibile: [anno].
