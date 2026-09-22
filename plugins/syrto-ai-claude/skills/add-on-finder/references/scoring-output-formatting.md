# Add-on Finder — Fit Score rubric, output specs & formatting

Reference for the `add-on-finder` skill. Read this before computing the Fit Score (Step 4) and before building the output (Step 6). All deliverables are in Italian.

---

## Fit Score (0–100) — default weights (tunable)

Explain the weighting to the user, don't present it as a black box. What each weight captures:

- **Similarità di business (40)** — semantic match score + activity/target-market overlap vs. the starting company (compare `activity_overview` + `target_markets_description`, as in `syrto-comparables`).
- **Dimensione (20)** — how well the target sits in the ideal bolt-on band (small enough to absorb, big enough to matter).
- **Segnale di successione (20)** — family-owned + average owner age (older ⇒ higher), no obvious internal successor ⇒ higher.
- **Prossimità geografica (10)** — same region > same macro-area > elsewhere.
- **Salute finanziaria (10)** — healthy scores full; a company in serious distress scores 0 here **and** is moved to "Da valutare con cautela".

---

### Step 6 — Output (only after confirmation)

**Default deliverables: produce BOTH an Excel and a readable report — always, without asking.** The Excel is the data/scanning tool; the readable report is the presentable version of the same analysis. Build the Excel first, then the readable report from the same data so the two never diverge; its rendering (canone, offerta del PDF, digest in chat) is handled by `core.md`, not hand-built.

**1) Excel (Italian) — build with the `xlsx` skill.**

**Tab "Add-on Target"** — one row per in-target company, sorted by Fit Score desc:
`Azienda | P.IVA | Attività (sintesi) | Settore/NACE | Regione/Sede | Proprietà | Titolare effettivo (età media) | Potenziale successore (Sì/No) | Anno bilancio | Fatturato | Fatturato vs azienda di partenza | EBITDA | Margine EBITDA % | Crescita/CAGR | PFN / Leva | Match semantico | Fit Score | Razionale (1 riga)`

- For **portfolio** input, add a column **"Add-on per (azienda di partenza)"** mapping each target to the portfolio company it best bolts onto.
- Highlight the top-tier rows (e.g. Fit Score ≥ 70). Display nulls as "N/D". Never show internal identifiers (slug, syrto_code) — use the human-readable name.

**Tab "Da valutare con cautela"** — companies that fit but show distress signals, with the specific reason.

**Tab "Da verificare"** — companies excluded only because ownership/age couldn't be resolved, with the reason (manual review, not rejects).

**Tab "Riepilogo"** — starting company(ies), search parameters (query, match_cutoff, banda dimensione, geo, soglia età, proprietà, anno), counts per list, and the Fit Score weighting used.

**2) Report leggibile (italiano) — sempre prodotto insieme all'Excel.** Il report leggibile è reso come deliverable formalizzato secondo `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (canone da `/preferences.md`, HTML con offerta del PDF, digest in chat) — mantieni gli stessi contenuti/colonne (intro con azienda/e di partenza e parametri, tabella dei target ordinata per Fit Score con le righe top-tier evidenziate, razionale strategico per i top target) e le sezioni "Da valutare con cautela" / "Da verificare". È la versione pensata per essere letta/condivisa, mentre l'Excel resta il file dati di lavoro.

## Formatting rules (Excel & chat)

- Values ≥ 1B: "X,XB €"; ≥ 1M: "XX,XM €" (one decimal under 10M); ≥ 1k: "XXXk €".
- Percentages: Italian format with comma ("12,3%"). Syrto percentage metrics come as ratios (0.12 = 12%) — multiply by 100.
- Ratios: two decimals, comma separator ("2,34"). Null/missing: "N/D".

## Ownership type translation

FAMILY → "Familiare" · INDUSTRIAL_GROUP → "Gruppo industriale" · FINANCIALLY_OWNED_GROUP → "Proprietà finanziaria (PE/VC)" · PUBLIC → "Pubblico" · Unknown/null → "N/D".

## Efficiency & robustness checklist

- **Semantic search always on, `match_cutoff` 0.8 default; searches sequential** (parallel = timeout). Widen by reformulating the query, not by lowering the cutoff.
- **Depth ladder:** cheap size screen (Step 2) → ownership enrichment (Step 3) → financial deep-dive (Step 4) only on survivors, so effort isn't spent on non-matches.
- **Metrics via `syrto_compare_companies`, not per-company loops.** Both the size screen (Step 2) and the deep-dive KPIs (Step 4) pull metrics for the whole survivor pool with `syrto_compare_companies` (≤20 IDs per call, sequential) — one call per batch instead of one per company. Discovery (Step 1) is unchanged. `syrto_compare_companies` needs a single shared `year`; use `syrto_get_company_metrics` only as a fallback for companies it returns as missing.
- **Structure in small sequential batches** (`syrto_get_company_structure`, Step 3); pace them. Anagraphic reads stay per-company but batched.
- **Null-safe throughout:** null share %, null age, holding-company owners, >10-owner caps → "Da verificare" rather than corrupting the result.
- **Always exclude the starting company / portfolio companies from results.**
- **Everything in Italian.**

