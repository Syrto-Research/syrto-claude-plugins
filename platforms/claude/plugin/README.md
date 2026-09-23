# Syrto AI Claude

A financial-intelligence assistant for Italian companies, built on Syrto. Groups Syrto's
capabilities into three verticals over one shared core.

## How it works

Skills trigger on intent. Each one reads a single shared core plus a capability map, then does
the work. Context about the user (their company, how they want deliverables to look, what they
sell and to whom) is saved where the host allows and read when a task needs it, not re-asked.

Thin context is not a blocker: a skill proceeds with sensible defaults and names the assumption.
`syrto-onboarding` runs when the user asks to be set up.

## Components

**Shared core** (`shared/`)

- `core.md` — who you are, Syrto-first sourcing, where memory lives, the Fit Score, chat-vs-file
  output policy, efficiency rules, guardrails, the SYRTO-HANDOFF format, and routing between the
  two single-company skills.
- `syrto-reference.md`: the capability map. Which Syrto tool serves each capability the skills
  name, the suite's policy on top (credits, usage, benchmark wording), metric concepts and slugs,
  Italian labels and the source line. How to call each tool is left to the tool's own description.

**Onboarding** — `syrto-onboarding`: profile, calibration and business context, on request.

**Sales & Marketing** — `prospects-scout`, `priority-ranker`, `upsell-potential-scout`,
`outreach-writer`, `briefing` (fast lane), plus `briefing-now` and `setup-briefing`.

**M&A & Strategy** — `buyer-list`, `add-on-finder`, `syrto-comparables`, `market-sizing`,
`market-benchmark`.

**Reporting** — `company-analysis` (livello 1–4 × taglio normale/commerciale),
`finanza-agevolata`.

**Hook**: one SessionStart hook that points to the shared core and to where context lives. No
per-message hook.

## Context

Skills keep three records: profile, preferences and commercial context. Where they live depends on
the host (see `shared/core.md` §3):

| Host | Where |
|---|---|
| Claude app / Cowork, with memory on | `/profile.md`, `/preferences.md`, `/areas/syrto-commercial-context.md` |
| Claude Code, or no memory | `.syrto/profile.md`, `.syrto/preferences.md`, `.syrto/commercial-context.md` in the project |
| Neither | The current conversation only; the skill says so |

Profile holds company, role and department; preferences hold deliverable format, register and depth,
and the default report livello and taglio; commercial context holds ICP, spend hook, exclusions,
portfolio and brand canon.

## Setup

- **Syrto** - included. The plugin adds the Syrto MCP server (`https://mcp.syrto.ai/mcp`);
  sign in with your Syrto account (in Claude Code: run `/mcp`, select the Syrto server and
  authenticate). If you have already added Syrto as a connector (Settings → Connectors), remove one
  of the two so the tools are not listed twice.
- A calendar connector is needed for the calendar mode of `briefing`; without one, `briefing`
  works by company name.
- A CRM (e.g. HubSpot) or an Excel/CSV export is optional but improves the Sales & Marketing
  results (dedup, deal sizes, wallet share).

## Credits and usage

The suite never buys person contacts or official documents inside a flow. They are bought only when
you ask explicitly, after you are told the item and its credit cost and you agree. Reading contacts
your organization already bought spends no credits.

Every data call counts toward your Syrto usage, so the skills skip calls the deliverable will not
use. Ask "quanto ho consumato?" to see your own consumption; the organization's plan and allowance
are in the dashboard (https://dashboard.syrto.ai).

## Usage

Describe the task. Examples: "trova prospect come i miei tre migliori clienti", "buyer list per
[azienda]", "analisi azienda [azienda] livello 3", "prospecting per Patent Box",
"briefing di oggi".
