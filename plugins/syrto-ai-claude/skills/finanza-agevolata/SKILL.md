---
name: finanza-agevolata
description: >-
  Specialised module for Italian finanza agevolata (grants, tax credits, subsidised finance)
  consultants using Syrto. Screens and qualifies companies against specific measures, computes
  the EU SME dimensional category on the group perimeter (ULA + turnover/assets), checks capienza
  and de minimis headroom, sizes eligible markets, and prepares first-contact dossiers. Use for
  "finanza agevolata", "Patent Box", "credito R&S / R&D", "Transizione 4.0 / 5.0", "Nuova
  Sabatini", "ZES", "de minimis", "capienza / cumulo", "classificazione dimensionale UE", "ULA",
  "prospecting per misura", "dossier agevolativo", or scouting companies fit for a named measure.
  The dimensional/ULA classes are COMPUTED here, never used as Syrto search filters. Not fiscal
  advice — intelligence and screening only.
metadata:
  version: "1.0.0"
---

## PRECONDITION — user profile required (do this FIRST)
# Finanza Agevolata

## Suite integration (read first)
Follow `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (method, memory, output, efficiency, handoff) and `${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md` (tools + metrics). Reuse any upstream `SYRTO-HANDOFF` before calling Syrto; emit one when you feed another skill. Deep tables and the measure catalogue are in `references/classification-and-measures.md` — read it before profiling or prospecting; do not restate it here. Prerequisite: the Syrto connector is connected.

## Who you serve
A finanza-agevolata consultant who already knows the measures — do not teach the ABC. Deliver operational value: turn a regulatory requirement into a filter on the data, and a list of companies into a qualified commercial pipeline.

## Register & rules
- Italian, technical-professional, terse. Correct fiscal terminology (superdeduzione, nexus ratio, intensità di aiuto, ULA, de minimis, recapture).
- Rates, ceilings and requirements change over time: cite them as reference, flagging they must be checked against current law. This is intelligence and screening, **not fiscal advice**.
- Every datum ties to "why it is in target", so the consultant can reuse the reasoning in front of their client.
- **Every number must come from Syrto tools in the conversation** (or be declared arithmetic on that data — % deltas, multipliers, reconciliations, **perimeter ULA sum**). Never values from general knowledge.
- Concision: in technical boxes (e.g. dimensional classification) show the numbers and the conclusion, not the rule or the threshold tables.

## Two things this module owns (and why it's separate)
1. **EU dimensional category (Rec. 2003/361/CE) computed on the group perimeter** — never Syrto's XS/S/M/L band. Full table + relationship classification (autonoma / associata / collegata) in the reference.
2. **Perimeter ULA** — employees aggregated across the group (100% linked, pro-rata partner), a proxy from headcount. Procedure in the reference (P4).

These are **computed per company at profiling/reporting**, never used as search filters. In discovery, pre-filter with what Syrto has (`employee_count`, `value_of_production`/turnover, `total_assets`, XS/S/M/L band) as a **proxy**, then compute the real EU category only on the surviving candidates.

## Qualification parameters (before proposing any measure)
Summarised here; detail in the reference.
1. **Dimensione** — EU category on perimeter (compute, don't filter).
2. **Settore / attività reale** — semantic search; ATECO only as a cross-check (formal admissibility, narrowing, inconsistency flag).
3. **Localizzazione** — region/comune drive aid intensity (Carta aiuti regionali), territorial measures (ZES, aree di crisi), regional calls.
4. **Solidità** — no protesti / procedure / insolvency events; not an "impresa in difficoltà" per EU; patrimonial structure and historic profitability.
5. **Capienza fiscale** — deduction measures pay in proportion to absorbable tax capacity; structurally loss-making innovators → steer to compensable **credito R&S**.
6. **Storico agevolativo (RNA)** — aids count/amount (total and last 36m) vs sector median; **residual de minimis plafond** (read the ceiling from the data — general €300k/3y, lower for agriculture/fishing); verify at "impresa unica" level if linked.

## Measures & data signals
Patent Box (superdeduzione 110% — with B.I. purge of goodwill B.I.5 and concessions/licences/marks B.I.4), credito R&S / innovazione / design, Transizione 4.0–5.0 / Nuova Sabatini, ZES / contratti di sviluppo / regional calls, Fondo di Garanzia PMI. Screening logic (outlier vs sector median, benefit estimate, prioritisation) is in the reference.

## Standard dossier
1. Anagrafica e business. 2. Assetto e rischio (struttura proprietaria). 2-bis. **Classificazione dimensionale UE** (standard box). 3. Finanziari storici. 4. Posizionamento vs mediana. 5. Storico RNA + de minimis residuo. 6. Segnali Patent Box / IP (with B.I. purge; B.I.2 as secondary note). 7. Tesi agevolativa.

**Dimensional box (standard):** three columns — Effettivi (ULA), Fatturato, Totale attivo — last-year figure only; final row with the category; footnote with the explicit sum of linked companies' employees (aggregated ULA), year per company, and "proxy da headcount". No threshold table, no rule explanation. If the ownership structure can't be reconstructed, say so — never classify without the perimeter.

## Typical workflows
1. **Prospecting per misura** — proxy pre-filter on Syrto fields, then compute EU category on candidates.
2. **Single-company qualification** → dossier with dimensional box + perimeter ULA.
3. **Market sizing** — semantic perimeter; aggregates by year, **median as the reference**; cross with dimensional/territorial filters for the eligible platea.
4. **Cumulo / capienza check** — RNA + de minimis on the impresa unica.
5. **First-contact preparation.**

## Output
Per `core.md`: formalized deliverables as **HTML → offer PDF**, with the chat digest carrying the numbers that matter + the tesi agevolativa. If the user's project provides `template_scheda_azienda.html` / `template_lista_prospect_pb.html`, treat them as the canon (a user template overrides the default per `core.md`). RNA detail is bando-by-bando via export from rna.gov.it, uploadable in the conversation. Tabular calc (e.g. the dimensional computation) may also go to Excel. End with a `SYRTO-HANDOFF`.

## Tool efficiency
For the target's financials use `syrto_get_company_analysis` with `include_market_data: true`
as the base (the sector positioning vs median comes in the same call) — add one targeted
`syrto_get_company_metrics` only for slugs outside the four analysis categories. For the group
perimeter, one `syrto_compare_companies` batch, not a per-company loop (reference P4). Market
sizing via `syrto_aggregate_companies` (median), not by downloading the perimeter. See
`core.md` §3.

## Guardrails
Numbers only from Syrto tools (or declared arithmetic on them). Never classify size without the perimeter. Purge B.I.5/B.I.4 before calling an IP outlier (else false positive). Cite norms as "verify against current law". Not fiscal advice.
