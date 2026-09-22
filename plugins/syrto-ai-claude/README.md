# Syrto AI Claude

A financial-intelligence assistant for Italian companies, built on Syrto. Groups Syrto's
capabilities into three verticals over one shared core.

## How it works

Skills trigger on intent. Each one reads a single shared core plus a tool reference, then does
the work. Context about the user — their company, how they want deliverables to look, what they
sell and to whom — lives in memory and is read when a task needs it, not re-asked.

Thin context is not a blocker: a skill proceeds with sensible defaults and names the assumption.
`syrto-onboarding` runs when the user asks to be set up.

## Components

**Shared core** (`shared/`)

- `core.md` — who you are, Syrto-first sourcing, where memory lives, the Fit Score, chat-vs-file
  output policy, efficiency rules, guardrails, the SYRTO-HANDOFF format, and routing between the
  two single-company skills.
- `syrto-reference.md` — Syrto tools, metric slugs, search parameters, radar, people, official
  documents, data hygiene.

**Onboarding** — `syrto-onboarding`: profile, calibration and business context, on request.

**Sales & Marketing** — `prospects-scout`, `priority-ranker`, `upsell-potential-scout`,
`outreach-writer`, `briefing` (fast lane), plus `briefing-now` and `setup-briefing`.

**M&A & Strategy** — `buyer-list`, `add-on-finder`, `syrto-comparables`, `market-sizing`,
`market-benchmark`.

**Reporting** — `company-analysis` (livello 1–4 × taglio normale/commerciale),
`finanza-agevolata`.

**Hook** — one SessionStart hook that names where context lives. No per-message hook.

## Memory

Three paths, all read back by the memory system:

| Path | Holds |
|---|---|
| `/profile.md` | Company, role, department |
| `/preferences.md` | Deliverable format, register/depth, default report livello + taglio |
| `/areas/syrto-commercial-context.md` | ICP, spend hook, exclusions, portfolio, brand canon |

## Setup

- **Syrto** - included. The plugin adds the Syrto MCP server (`https://mcp.syrto.ai/mcp`);
  sign in with your Syrto account the first time a tool runs. If you have already added Syrto
  as a connector (Personalizza → Connettori), remove one of the two so the tools are not listed
  twice.
- A calendar connector is needed for the calendar mode of `briefing`.
- A CRM (e.g. HubSpot) or an Excel/CSV export is optional but improves the Sales & Marketing
  results (dedup, deal sizes, wallet share).

## Credits

The suite does not spend Syrto credits on its own. Contact purchases
(`syrto_request_person_contacts`) and official documents (`syrto_request_official_document`) are
explicitly out of scope for every skill flow — they run only when the user asks, after being
told the cost. `syrto_find_person` and `syrto_list_official_documents` are free to call.

## Usage

Describe the task. Examples: "trova prospect come i miei tre migliori clienti", "buyer list per
[azienda]", "analisi azienda [azienda] livello 3", "prospecting per Patent Box",
"briefing di oggi".
