# Classification & Measures — finanza agevolata reference

Read before profiling or prospecting. Company figures must come from Syrto, from documents the
user supplied, or from declared arithmetic on them; the regulatory parameters below are dated and
are verified before being cited (see §5). These classes are **computed, never used as Syrto search
filters**.

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
- Total assets is a stored balance-sheet figure: read it (a specific metric read, or in the
  perimeter comparison) rather than deriving it from intangible intensity. It is needed for the
  €43M asset ceiling.

## 2. Perimeter of calculation - always apply

Dimensional parameters are **never** computed on the company alone: they are computed on the
perimeter defined by participation relationships (Allegato I Reg. UE 651/2014; the GBER's
validity was extended to 31 Dec 2026, so check the successor regulation from 2027). Most frequently
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
the same market. The ownership type (e.g. a family-owned group, an industrial group) is a strong
group hint; it is also a stored search filter, usable as a prospecting proxy.

## 3. Perimeter ULA procedure (P4) — always

1. Get the ownership structure of the target, on its own (a read of several companies at once
   shortens every list in it). If the structure says a list was cut, the perimeter is incomplete:
   say so in the box.
2. For each linked / controlling / associated company, resolve it to a Syrto company:
   subsidiaries and companies linked through the same parent come with a tax ID, so resolve them
   together in one tax-ID batch; shareholders that are companies come by name only, so resolve
   them by name and confirm each match (a wrong namesake corrupts the perimeter).
3. Classify each relationship (autonoma / associata / collegata).
4. Aggregate ULA (and, for full classification, turnover and total assets): 100% linked,
   pro-rata partner. Declare "proxy da headcount" and the year of each company.
   Read headcount, turnover and total assets for the whole perimeter with **one** many-company
   comparison per year instead of looping per company. The comparison gives each company's
   headcount for the year you pin; the company profile's headcount is always the latest filing,
   whatever year you ask, so use the profile only for entities or fields the comparison does not
   cover, and say which year each figure is. Check what the comparison reports as missing. It
   also says which statement basis each company is on: keep the perimeter on individual
   statements and flag any consolidated figure.
5. Apply thresholds and the two-consecutive-years rule (so read the last two filed years).
6. Show the dimensional box (individual data, category, aggregated-ULA note). If the structure
   can't be reconstructed, say so — never classify without the perimeter.

## 4. Sector & real activity

Search and perimeters are by **real activity (semantic search)**, not ATECO. ATECO is a
cross-check only (formal admissibility, narrowing, inconsistency flag). Max precision = semantic
perimeter + ATECO verification, making the funnel explicit. When a bando lists admissible ATECO
codes, check which ATECO version it uses (ATECO 2025 has applied since April 2025) before calling
a code mismatch.

## 5. Measures & data signals

> **Currency - verify before you cite.** This catalogue was written for the suite's September
> 2026 release and is not updated automatically. Incentive measures change with every budget law:
> whether a measure is still open, its time window, its rates, ceilings and eligible companies.
> Before proposing a measure to a client, check its current status on an official source if you
> can browse (Gazzetta Ufficiale, Agenzia delle Entrate, MIMIT, Invitalia, the EU Official
> Journal) and cite the source and date; if you cannot, present it as "da verificare sulla
> normativa vigente". The data signals stay useful when a measure is renamed or replaced: a new
> incentive on capital-goods investment is screened with the same signals.

### Patent Box (superdeduzione 110%)
*Verify window: that the regime is still in force and the uplift and tax rates are unchanged.*

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
  outlier. Read the B.I. lines through a specific metric read (or the comparison, for a list),
  after confirming each line's slug via metric-definition search; the balance-sheet assets
  statement shows the whole B.I. breakdown when the dossier needs it. **Always purge** goodwill
  (B.I.5) and concessions/licences/marks (B.I.4): a high total
  B.I. dominated by these is a **false positive**. Qualify with real activity, trend, employees,
  capienza. Estimate benefit in euro (costs × 110% × ~28%) as order of magnitude. Prioritise:
  pure IP (B.I.2+B.I.3) > capienza > no red flag > free plafond.

### Credito d'imposta R&S, innovazione, design
*Verify window: which of the three credits is still open for the year, its rate, and the current conditions for using it (certification, preventive communications, offsetting limits).*

Measure of choice for innovators even at a loss (compensable credit). Signals: R&D costs
(capitalised or, where visible, in P&L), R&D intensity, patents.

### Beni strumentali / Transizione 4.0–5.0 / Nuova Sabatini
*Verify window: which instrument covers the investment year (these incentives have been time-bounded and re-scoped by successive budget laws) and whether Sabatini funds are open.*

Investments in tangible/intangible instrumental assets; premia for interconnection and energy
saving. Signals: tangible fixed assets and their increase, manufacturing (esp. **energy-intensive**:
glass, ceramics, foundries, paper), size (Sabatini for PMI), recurring capex.

### ZES unica, contratti di sviluppo, bandi regionali
*Verify window: the current application window and the territories covered.*

Localisation + size + investment programme. Signals: registered/operating unit in the Mezzogiorno
or target areas, growth, investments underway.

### Garanzie pubbliche (Fondo di Garanzia PMI) e finanza a leva
*Verify window: the Fondo's current coverage rules and eligibility.*

PMI size + credit merit. Signals: financial structure, profitability, no prejudicial events.

## 6. Market sizing (agevolabile)
- Perimeter by real activity (semantic), not only ATECO.
- Aggregates: number of companies, revenues (mean/median/min/max), EBITDA, employees, by year.
- **Median** as the primary reference.
- Cross with the dimensional proxies (size band, headcount, turnover / assets, declared as
  proxies: the EU category itself is computed, not filtered) and territorial filters for the
  eligible platea.

## 7. RNA / de minimis / capienza
- RNA: aids count and amount (total and last 36 months) vs sector median. The company profile
  carries this aggregate state-aid summary, including the de minimis ceiling and residual; the
  company search can also screen on it (e.g. residual de minimis above zero).
- **Residual de minimis plafond**: general ceiling €300,000 over 3 years per impresa unica
  (Reg. UE 2023/2831); primary agriculture and fishing have their own, lower ceilings — always
  read the ceiling from the data. Syrto's residual is computed on the single company: for an
  impresa unica, recompute it across the linked companies in the same State.
- Distinguish users of notified / block-exemption aids from de minimis users.
- Verify capienza at impresa-unica level if linked.
- RNA history is aggregate; bando-by-bando detail via export from rna.gov.it, uploadable.
