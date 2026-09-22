---
name: upsell-potential-scout
description: >
  Find upsell and cross-sell headroom in existing clients by comparing what they spend
  with you against their financial capacity. Use whenever the user says "upsell",
  "wallet share", "quanto potrebbe spendere ancora [cliente]", "dove ho margine",
  "espansione", "upsell potential [client]", "how much more could [client] spend",
  "where's the headroom in my book", "expansion opportunities", "grow my accounts", or
  asks which current clients are under-penetrated. Outputs a wallet-share ranking with
  expansion rationale.
metadata:
  version: "1.0.0"
---

## PRECONDITION — user profile required (do this FIRST)
# Upsell Potential Scout

## Suite integration (read first)
Follow `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (method, memory, output, efficiency, handoff) and `${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md` (tools + metrics). Reuse any upstream `SYRTO-HANDOFF` before calling Syrto; emit one when you feed another skill.

Quantify how much room each existing client has to spend more with you. Prerequisite: the Syrto connector is connected.

## Read your context first
Read the commercial profile from memory (`/areas/syrto-commercial-context.md`): spend hook + capture rate, and the current deal value per client. Current deal values come from the memory portfolio, a connected CRM, or an uploaded Excel/CSV. If no deal values are available anywhere, say so once and offer to run capacity-only sizing (spend capacity without wallet share). If a needed field is missing, ask once and offer to save it to memory.

## Steps
For each client (or the one named):
1. **Current spend with you** — from the portfolio / CRM / uploaded file.
2. **Financial capacity** — `syrto_find_company` → `syrto_get_company_metrics`. Read the spend-hook metric and overall health (growth, liquidity, profit). For several clients at once, batch with `syrto_compare_companies`.
3. **Wallet share** = current deal value ÷ spend-hook metric. Low share + healthy finances = headroom. High share = near saturation (defend, don't push).
4. **Headroom (€)** = (spend-hook metric × capture rate) − current deal value.
5. **Compatible lines not yet sold** — compare what similar portfolio clients buy vs what this client buys; surface the gap as a concrete upsell suggestion.
6. **Health check** — flag any client whose finances are deteriorating (renewal/credit risk), even if wallet share looks low.

## Output
A visual widget ranking clients by upsell potential (headroom €, descending) with columns: client, current deal value, spend-hook line, wallet share %, estimated headroom, suggested next line, and a one-line rationale. Above it: total identified headroom across the book and the top 3 expansion targets. Flag at-risk accounts in a separate note. Offer to export to Excel (`xlsx`).

## Guardrails
Wallet share without a health read is misleading — always pair headroom with the client's financial trajectory. Never recommend pushing a client showing distress signals; flag for retention instead. Rationale mandatory on every row.
