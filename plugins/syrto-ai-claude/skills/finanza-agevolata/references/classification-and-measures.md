# Classification & Measures — finanza agevolata reference

Read before profiling or prospecting. All figures must come from Syrto tools (or declared
arithmetic on them). These classes are **computed, never used as Syrto search filters**.

## 1. EU dimensional category (Rec. 2003/361/CE)

| Categoria | Effettivi (ULA) | Fatturato | oppure Totale attivo |
|---|---|---|---|
| Micro | < 10 | ≤ 2 M€ | ≤ 2 M€ |
| Piccola | < 50 | ≤ 10 M€ | ≤ 10 M€ |
| Media | < 250 | ≤ 50 M€ | ≤ 43 M€ |
| Grande | oltre soglie | — | — |

- The ULA (effettivi) criterion is always mandatory; for the financial criterion it is enough
  to meet **one** of turnover or total assets.
- Status is gained/lost only if thresholds are crossed for **two consecutive financial years**.
- If both financial parameters exceed the ceilings, the company is Grande even with ULA < 250.
- `total_assets` (from `syrto_get_company_metrics`) is a real datum — include it in the standard
  card call; needed for the €43M asset ceiling (do not derive it from intangible intensity).

## 2. Perimeter of calculation — CRITICAL, always apply

Dimensional parameters are **never** computed on the company alone: they are computed on the
perimeter defined by participation relationships (Allegato I Reg. UE 651/2014). Most frequently
mis-done check in finanza agevolata — do it for **every** company, not only for PMI measures.

| Relazione | Soglia | Aggregazione dati |
|---|---|---|
| **Autonoma** | < 25% voti o capitale | Solo dati propri |
| **Associata** | ≥ 25% e ≤ 50% | Aggregati **in proporzione alla quota** |
| **Collegata** | > 50% voti, o controllo di fatto | Aggregati **al 100%** a prescindere dalla quota |

Rules:
1. Perimeter checked **upstream and downstream**.
2. Chains propagate: a linked company's own linked companies count 100%, its partners pro-rata.
3. Linkage can pass through **natural persons** (or groups acting in concert) on contiguous
   markets — typical of family groups.
4. 25% exception: institutional investors, VC, business angels, universities/research centres
   (within limits) do not make the firm associata, unless control.
5. Public participation ≥ 25% → generally not PMI (except public investors of point 4).
6. De minimis perimeter ("impresa unica"): only linked (control) companies in the same State — a
   **different, narrower** perimeter than the dimensional one.

Signals in Syrto data: ownership structure and participations, presence of consolidated
accounts, legal-person shareholders ≥ 25%, same dominant shareholder across several companies in
the same market. `controlling_entity_category` (e.g. FAMILY_OWNED_GROUP) is a strong group hint.

## 3. Perimeter ULA procedure (P4) — always

1. Get the ownership structure (`syrto_get_company_structure`).
2. For each linked / controlling / associated company: resolve the valid ID (graph IDs are NOT
   directly queryable — they decode the codice fiscale; resolve with `syrto_find_company` /
   `syrto_lookup_companies_by_tax_id`) and read `employee_count` via anagraphic.
3. Classify each relationship (autonoma / associata / collegata).
4. Aggregate ULA (and, for full classification, turnover and total assets): 100% linked,
   pro-rata partner. Declare "proxy da headcount" and the year of each company.
   Where employees / turnover / assets are available as metrics, prefer **one**
   `syrto_compare_companies` (≤20 companies, ≤10 metrics) instead of looping per company;
   check `missing_company_ids` / `warning`. Use
   per-company `syrto_get_company_anagraphic` only for entities or fields not covered by compare.
5. Apply thresholds and the two-consecutive-years rule.
6. Show the dimensional box (individual data, category, aggregated-ULA note). If the structure
   can't be reconstructed, say so — never classify without the perimeter.

## 4. Sector & real activity

Search and perimeters are by **real activity (semantic search)**, not ATECO. ATECO is a
cross-check only (formal admissibility, narrowing, inconsistency flag). Max precision = semantic
perimeter + ATECO verification, making the funnel explicit.

## 5. Measures & data signals

### Patent Box (superdeduzione 110%)
110% uplift of R&D costs for eligible intangibles, deductible IRES/IRAP.
- **Eligible**: copyright-protected software, industrial patents (incl. utility models, plant
  varieties, semiconductor topographies), protected designs/models. **Excluded: trademarks and
  know-how.**
- **Nexus / internal development**: rewards costs borne directly (or via independent third
  parties); purchased IP or intra-group R&D reduce the benefit.
- **Base**: uplift applies to R&D costs on an accrual basis, regardless of capitalisation. B.I.2
  is a visibility proxy, not the base.
- **Recapture**: up to 8 tax periods on obtaining the IP right.
- **Group**: intra-group R&D excluded from nexus; IP title in the candidate company (open point
  to declare).
- **Screening (outlier logic)**: significant capitalised intangibles / R&D + comparison to the
  market median; if the market is NOT IP-intensive and the company is above → high-potential
  outlier. **Always purge** goodwill (B.I.5) and concessions/licences/marks (B.I.4): a high total
  B.I. dominated by these is a **false positive**. Qualify with real activity, trend, employees,
  capienza. Estimate benefit in euro (costs × 110% × ~28%) as order of magnitude. Prioritise:
  pure IP (B.I.2+B.I.3) > capienza > no red flag > free plafond.

### Credito d'imposta R&S, innovazione, design
Measure of choice for innovators even at a loss (compensable credit). Signals: R&D costs
(capitalised or, where visible, in P&L), R&D intensity, patents.

### Beni strumentali / Transizione 4.0–5.0 / Nuova Sabatini
Investments in tangible/intangible instrumental assets; premia for interconnection and energy
saving. Signals: tangible fixed assets and their increase, manufacturing (esp. **energy-intensive**:
glass, ceramics, foundries, paper), size (Sabatini for PMI), recurring capex.

### ZES unica, contratti di sviluppo, bandi regionali
Localisation + size + investment programme. Signals: registered/operating unit in the Mezzogiorno
or target areas, growth, investments underway.

### Garanzie pubbliche (Fondo di Garanzia PMI) e finanza a leva
PMI size + credit merit. Signals: financial structure, profitability, no prejudicial events.

## 6. Market sizing (agevolabile)
- Perimeter by real activity (semantic), not only ATECO.
- Aggregates: number of companies, revenues (mean/median/min/max), EBITDA, employees, by year.
- **Median** as the primary reference.
- Cross with dimensional and territorial filters for the eligible platea.

## 7. RNA / de minimis / capienza
- RNA: aids count and amount (total and last 36 months) vs sector median.
- **Residual de minimis plafond**: general ceiling €300,000 over 3 years per impresa unica
  (Reg. UE 2023/2831); primary agriculture and fishing have their own, lower ceilings — always
  read the ceiling from the data.
- Distinguish users of notified / block-exemption aids from de minimis users.
- Verify capienza at impresa-unica level if linked.
- RNA history is aggregate; bando-by-bando detail via export from rna.gov.it, uploadable.
