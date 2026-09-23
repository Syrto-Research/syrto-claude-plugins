# Add-on Finder - Add-on Score rubric, output specs & formatting

Reference for the `add-on-finder` skill. Read this before computing the Add-on Score (Step 4) and before building the output (Step 6). All deliverables are in Italian.

---

## Add-on Score (0-100) - default weights (tunable)

This is add-on-finder's own acquisition score, distinct from the commercial Fit Score in `core.md` §4. Explain the weighting to the user, don't present it as a black box. What each weight captures:

- **Similarità di business (40)**: semantic match score + activity/target-market overlap vs. the starting company (compare their activity and target-market descriptions, as in `syrto-comparables`).
- **Dimensione (20)** — how well the target sits in the ideal bolt-on band (small enough to absorb, big enough to matter).
- **Segnale di successione (20)** — family-owned + average owner age (older ⇒ higher), no obvious internal successor ⇒ higher.
- **Prossimità geografica (10)** — same region > same macro-area > elsewhere.
- **Salute finanziaria (10)** — healthy scores full; a company in serious distress scores 0 here **and** is moved to "Da valutare con cautela".

---

## Output specs (Step 6)

Rendering of the readable report (canone, offerta del PDF, digest in chat) is handled by `core.md` §5, not hand-built.

**1) Excel (Italian): build it with your client's spreadsheet capability.**

**Tab "Add-on Target"** — one row per in-target company, sorted by Add-on Score desc:
`Azienda | P.IVA | Attività (sintesi) | Settore/NACE | Regione/Sede | Proprietà | Titolare effettivo (età media) | Potenziale successore (Sì/No) | Anno bilancio | Fatturato | Fatturato vs azienda di partenza | EBITDA | Margine EBITDA % | Crescita/CAGR | PFN / Leva | Match semantico | Add-on Score | Razionale (1 riga)`

- For **portfolio** input, add a column **"Add-on per (azienda di partenza)"** mapping each target to the portfolio company it best bolts onto.
- Highlight the top-tier rows (e.g. Add-on Score ≥ 70). Display nulls as "N/D".
- "Titolare effettivo (età media)" is the current year minus the beneficial owners' average birth year that discovery returned, so two runs compute it the same way.

**Tab "Da valutare con cautela"** — companies that fit but show distress signals, with the specific reason.

**Tab "Da verificare"**: companies whose ownership could not be resolved from the ownership read (a holding on top, undisclosed shares or ages), with the reason (manual review, not rejects).

**Tab "Riepilogo"**: starting company(ies), search parameters (query, soglia di pertinenza, banda dimensione, geo, soglia età, proprietà, anno, base di bilancio), counts per list, the Add-on Score weighting used, and one line noting that companies with no data on ownership type or owner age were not included by the discovery filters.

**2) Report leggibile (italiano) — sempre prodotto insieme all'Excel.** Il report leggibile è reso come deliverable formalizzato secondo `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (canone da `/preferences.md`, HTML con offerta del PDF, digest in chat) — mantieni gli stessi contenuti/colonne (intro con azienda/e di partenza e parametri, tabella dei target ordinata per Add-on Score con le righe top-tier evidenziate, razionale strategico per i top target) e le sezioni "Da valutare con cautela" / "Da verificare". È la versione pensata per essere letta/condivisa, mentre l'Excel resta il file dati di lavoro.

## Formatting (Excel & chat)

Numbers (amounts, percentages, ratios) follow the house style in `core.md` §5. Missing values show as "N/D".

## Ownership labels

Show ownership type in plain Italian using the ownership-type labels in the capability map (`${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md`), never the raw code. Unknown or missing: "N/D".

## Efficiency & robustness checklist

- **Semantic search always on, default relevance cutoff 0.8; searches one at a time** (core §6). Widen by reformulating the query, not by lowering the cutoff.
- **Depth ladder:** discovery (the filters do the gating, and the size check reuses its revenue) → ownership enrichment (Step 3) → financial deep-dive (Step 4) only on survivors, so effort isn't spent on non-matches. Each step reuses what the one before returned.
- **Multi-company calls, not per-company loops,** for the KPI comparison, the company profiles and the ownership reads.
- **A list cut short in a multi-company ownership read is not unresolved data:** read that company alone before sending it to "Da verificare".
- **Null-safe throughout:** null share %, null age, holding-company owners → "Da verificare" rather than corrupting the result.
- **Always exclude the starting company / portfolio companies from results.**
- **Deliverables in Italian.**
