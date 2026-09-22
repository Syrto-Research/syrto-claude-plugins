# Memory schema & Syrto Suite capability map

## Where context is written

Three real memory paths — the ones the memory system actually reads back. Read before
writing (the read returns the version token), merge, never blind-overwrite. Do not create
an index file and do not invent new paths.

### `/profile.md` — who the user is
Company, role, department. Usually already present from ordinary use — read it rather than
re-asking. Onboarding adds only what is genuinely missing.

### `/preferences.md` — how answers should look
The behavioural defaults, written as stated preferences:

```
- Preferred deliverable format: HTML (offer PDF) | PDF | Excel
- Register / numeric depth: <derived from role + sector>
- Default report livello: 1 | 2 | 3 | 4 | ask each time
- Default report taglio: normale | commerciale | ask each time
```

### `/areas/syrto-commercial-context.md` — the business
```markdown
---
name: syrto-commercial-context
description: Commercial context for Syrto work — what the user sells, to whom, targeting rules
sources: [cowork]
---
## Offering
- Products / services offered:
- What the company buys (inputs):

## Commercial profile
- Who they sell to / ICP:
- Typical target characteristics:
- Typical deal size · target revenue band (€ min–max):
- Target sectors / geographies (plain language — used as semantic queries):
- Spend hook + realistic capture rate:
- Hard exclusions:
- Portfolio / reference clients:

## Brand canon (optional)
- Colours / logo / fonts — overrides the default deliverable look
```

Never write blocked-category personal data here (health, finances of the individual,
political or religious affiliation and the like) — this file is about the business.

## Syrto Suite capability map

Use this to order the Step 4 overview: relevant-to-profile first, the rest under
"Altri spunti". Describe capabilities in plain terms. The suite has three verticals.

**Sales & Marketing**
- Find & score prospect **companies** — from criteria, from your best clients (lookalikes), or a connected CRM / uploaded file. *(prospects-scout)*
- Rank / tier a list of accounts by financial fit. *(priority-ranker)*
- Find upsell headroom in existing clients. *(upsell-potential-scout)*
- Write personalised outreach — email + LinkedIn. *(outreach-writer)*
- Fast lane — a quick, compact commercial profile of a company, from your calendar (the day's meetings — schedulala come routine con `/setup-briefing`) or spot by name, with the same fit read and ready talking points. *(briefing)*

**M&A & Strategy**
- Build a buyer universe for a sell-side process. *(buyer-list)*
- Find bolt-on / add-on acquisition targets from a platform or portfolio. *(add-on-finder)*
- Find a company's peer group / direct competitors. *(syrto-comparables)*
- Size a market / sector perimeter on real activity, beyond ATECO. *(market-sizing)*
- Benchmark a company against its true peers. *(market-benchmark)*

**Reporting**
- Single-company report at a chosen depth — company only / + market / + peers / full — with a **taglio** dial: `analitico` (understand) or `commerciale` (qualify for sales: fit score, spend capacity, what to sell, go/no-go; livello 1 = quick commercial qualification). *(company-analysis)*
- Finanza agevolata — screen & qualify companies for measures, EU size on group perimeter, capienza / de minimis, dossiers. *(finanza-agevolata)*

### Relevance by profile
- **corporate_finance / M&A** → buyer list, add-on targets, peer group, market sizing/benchmark, company analysis.
- **consulting** → company analysis, market sizing, peer group, market benchmark (+ the Sales skills if they do business development).
- **finanza agevolata** (a consulting sub-domain) → finanza agevolata, market sizing, company analysis.
- **banking — credit / risk** → company analysis, peer group, market benchmark. **banking — commercial** → the Sales & Marketing skills.
- **insurance** → company analysis (with its group/risk lens); the Sales skills if the role is commercial.
- **corporate** → company analysis, peer group, market sizing.
- **law** → company analysis (ownership / governance lens).
- **any `sales` / `marketing` function** → prospect scouting, single-company qualification, account ranking, upsell, outreach writing, the fast-lane briefing (cross-sector — top of the list for these roles).

Everything not selected for the profile goes under **"Altri spunti"** — one short line each,
so the user sees the full range without losing focus on what matters to them.
