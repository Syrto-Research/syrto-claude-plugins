---
name: market-benchmark
description: >
  Benchmark a single Italian company against the aggregate of its true peers, using Syrto.
  Input = a company (name or P.IVA). Derives one semantic search from the company's real
  business activity (beyond Ateco), calibrates a clean peer perimeter with the same boundary
  logic as market sizing, restricts peers to the company's size class, and shows the company's
  key metrics vs the peer averages (above/below), plus the number of peers and the aggregate
  value of the perimeter.
  Trigger on: "benchmark [azienda]", "come si posiziona [azienda]", "[azienda] vs settore",
  "[azienda] vs competitor", "[azienda] vs mercato", "benchmarking competitivo di [azienda]",
  "confronta [azienda] con il suo settore", or a bare company name given with comparative intent.
  Do NOT trigger for: sizing a market/sector (use market-sizing), a named list of competitors
  (use syrto-comparables / "get comparables"), or a single-company financial report/analysis.
---

## PRECONDITION — user profile required (do this FIRST)
# Market Benchmark

Questa skill posiziona **una singola azienda** contro l'**aggregato dei suoi veri peer** — le aziende che fanno davvero la stessa cosa, trovate per attività reale via ricerca semantica Syrto, non per codice ATECO. Restituisce le metriche dell'azienda affiancate alla **media dei peer** (sopra/sotto), il **numero di aziende** del perimetro e il **valore aggregato** del settore.

Si differenzia da:

- **market-sizing**: quella dimensiona un mercato; questa confronta un'azienda con il suo.
- **comparables**: quella dà una *lista* di competitor nominati con confronto 1-a-1; questa dà l'**aggregato** (medie). L'upstream — definizione della verticale via semantica + calibrazione — è lo stesso; se servono i peer nominati è un passo extra o si usa comparables.

> 🗣️ **REGOLA DI COMUNICAZIONE — VINCOLANTE, PREVALE SULLO STILE DI DEFAULT.**
> Le chiamate a Syrto sono lente e l'utente vuole essere aggiornato passo passo. **Prima di OGNI chiamata a un tool Syrto** — dalla ricerca dell'azienda fino all'aggregato finale — scrivi **una riga di testo visibile** che dice cosa stai per fare e perché. So che di norma lo stile dell'ambiente dice di non annunciare i tool call: **qui quella regola NON si applica**. Una sequenza di tool che parte senza una riga di contesto davanti è un **errore di esecuzione**.

## Nota sul "find similar"

Syrto **non** ha un tool "trova simili a questa azienda" con punteggi calibrabili. Il meccanismo corretto di "similarità" è la **ricerca semantica** a partire dalla descrizione dell'attività dell'azienda (lo stesso che usa comparables). Quindi **derivo automaticamente** il testo di ricerca dall'`activity_overview` e calibro — **senza fermarmi a farlo confermare** all'utente. (Il tool Lusha `recommendations_companies` è un'altra cosa: lead ICP, non peer finanziari — non usarlo qui.)

---

## Input

Un'azienda: **nome** o **partita IVA**. Se l'utente non ha indicato un'azienda, chiedila prima di procedere.

Come nelle altre skill Syrto, all'inizio conviene chiedere se l'utente vuole che si peschi anche dal **web citando le fonti** (per il commento/contesto) o si lavori **solo su Syrto**. I numeri del benchmark vengono comunque sempre e solo da Syrto.

---

## Step 1 — Identifica l'azienda

Annuncia, poi:

1. `syrto_find_company` (o `syrto_lookup_companies_by_tax_id` se è una P.IVA) → `company_id`.
2. `syrto_get_company_anagraphic` → leggi **`activity_overview`** e **`size_classification`**.
3. `syrto_get_company_analysis` sull'azienda → tieni da parte le sue metriche (ti servono nel confronto allo Step 4) e leggi **l'ultimo anno di bilancio presente**. Quell'anno è l'**anno di riferimento** dell'intera skill (vedi la sezione sotto). L'analisi la scarichi comunque per il confronto: leggendone qui l'ultimo anno eviti una detection separata e una coppia di chiamate.

Mappa la classe dimensionale per il filtro peer: **MICRO→XS, SMALL→S, MEDIUM→M, LARGE→L**.

Se l'`activity_overview` **manca** (capita con aziende piccole): se il web è abilitato, cerca il sito dell'azienda (nome + città/provincia dai dati Syrto), fallo confermare all'utente e leggilo per capire l'attività; altrimenti chiedi all'utente una breve descrizione dell'attività. Non proseguire senza sapere cosa fa l'azienda.

---

## Anno di Riferimento

Nessuna detection, nessuna chiamata di conteggio. L'**anno di riferimento** è semplicemente **l'ultimo anno di bilancio presente nell'`analysis`/anagraphic dell'azienda target** — quella che scarichi comunque allo Step 1. I bilanci su Syrto arrivano in ritardo e non tutte le aziende depositano nello stesso momento, ma l'ultimo anno del target è il riferimento naturale: è l'anno più recente per cui abbiamo il suo dato, quindi quello su cui ha senso confrontarla coi peer.

> Annuncia, es.: *"Uso come anno di riferimento il {Y}, l'ultimo bilancio disponibile per l'azienda target."*

La crescita nel tempo non richiede un anno storico separato: la leggi dalla metrica `revenue_cagr_3_years` (già nel set di default), sia per l'azienda sia per l'aggregato peer. Nota: il filtro `size` allo Step 3/4 richiede `year`, e quel `year` è questo anno di riferimento.

---

## Step 2 — Deriva la query semantica (senza conferma)

Dall'`activity_overview`, scrivi **UN** testo di ricerca in inglese che descrive **cosa fa** l'azienda: attività, processi, prodotti/servizi, tecnologie, materiali. **10–25 parole**, in inglese, solo attività operative — **niente** clienti target ("for hospitals"), niente qualità/claim ("leading", "innovative"), niente etichette di categoria. Non fermarti a farlo confermare: procedi alla calibrazione. (Il testo va comunque mostrato nell'output finale, per trasparenza e riproducibilità.)

---

## Step 3 — Calibra il perimetro dei peer (filtro taglia A MONTE)

Stesso motore di calibrazione di market-sizing, **una sola query**, ma con il filtro di **classe dimensionale applicato a monte**, nello stesso oggetto `filters`: così calibri e aggreghi direttamente sui peer di pari taglia — meno aziende, size del settore più vera.

> Annuncia, es.: *"Calibro la soglia sui peer di classe {M}: cerco la più bassa che tiene ≥15/20 aziende pertinenti al confine."*

**Filtri per ogni chiamata** (search e aggregate):
`filters.anagraphic.semantic_search` = testo EN, `filters.anagraphic.match_cutoff` = `c`, `filters.financial.size` = `[classe dell'azienda]` (XS/S/M/L), `year` = anno di riferimento (obbligatorio col filtro `size`).

### Come funziona la search
Il `match_score` è una proprietà fissa della coppia (testo, azienda): non dipende dalla soglia; `match_cutoff` filtra soltanto. Quindi:

- **Confine per match crescente**: con `sort_by = {"field": "match_score", "direction": "asc"}` e `match_cutoff = c`, la prima pagina di `syrto_search_companies` sono le aziende con score più basso ancora sopra `c` — il confine — con `short_description` e `match_score` già inclusi. (Paginazione a cursore, 25/pagina; niente offset/limit.)
- **Registro per id**: lo score è fisso, quindi il verdetto IN/OUT di un'azienda è fisso. Tieni un registro e non ri-giudicare due volte la stessa azienda.

### Il test a una soglia `c`
1. **Confine**: `syrto_search_companies` con i filtri sopra + `sort asc`. Prendi le prime **20** aziende (o quante ce ne sono, se meno).
2. **Giudizio IN/OUT** su ciascuna con la rubrica sotto, riusando il registro.
3. **Esito**: **≥ 15/20 IN** → fitta; **< 15/20** → non fitta. Se al confine ci sono **meno di 20** aziende, applica la stessa soglia **in percentuale**: fitta se **≥ 75%** sono IN.

### Rubrica IN/OUT (binaria)
Un'azienda è **IN** solo se svolge come business primario **l'attività che definisce la verticale dell'azienda target**. È **OUT** se: fornisce alla filiera (fornitore, non operatore), è cliente, rivende/distribuisce soltanto (quando la verticale è produzione, e viceversa), è holding/immobiliare/generica, o fa un'attività adiacente ma diversa. **Prodotto vs servizio è una linea di taglio esplicita**: se la verticale è produzione di un bene, chi eroga il servizio collegato è OUT (e viceversa); nei casi dubbi tira `syrto_get_company_anagraphic` e usa l'ATECO (sez. C manifattura vs sez. servizi) come discriminante. Tieni un tally `nome → attività core → IN/OUT → motivo`.

### Algoritmo (griglia fissa, deterministico)
Parti da **0.80**; muoviti di **±0.02** finché l'esito cambia, poi **una** verifica a **−0.01**. Scegli il **cutoff più basso che rispetta 15/20** (o ≥75% su set piccoli).

- **0.80 fitta** → scendi 0.78, 0.76… finché non fitta più; poi verifica −0.01 tra l'ultima che fittava e la prima che no.
- **0.80 non fitta** → sali 0.82, 0.84… finché fitta; poi verifica −0.01.

**Limiti di sanità**: se devi scendere sotto ~0.78 o salire sopra ~0.90 senza mai fittare, la query è troppo larga o vaga → ricavane una più precisa dall'attività e riparti.

> Nota: l'azienda target comparirà tra i risultati — per la calibrazione è un peer come gli altri, ma quando leggi "azienda vs media" tienila mentalmente fuori dalla media (su perimetri ampi non sposta nulla; su perimetri piccoli tienilo a mente).

---

## Fallback — pochi peer (solo se < 10)

Se, con la soglia ottimale e il filtro di classe dimensionale, i peer sono **meno di 10**, **non allargare da solo**. Fermati e chiama `ask_user_input_v0`:

1. Di' all'utente che il perimetro è sottile e **per cosa hai cercato**: il testo semantico usato **e** la classe dimensionale del filtro.
2. Chiedi come procedere. Opzioni: **"Estendi"** (togliere o allargare il filtro taglia, es. includere le classi adiacenti, o allentare la soglia), **"Ti do un altro testo di ricerca"** (l'utente fornisce una descrizione alternativa), **"Usa ATECO"** (proponi tu i codici NACE più pertinenti e falli confermare), **"Va bene così"** (procedi coi pochi peer, segnalando la scarsa robustezza).

Applica questo controllo **solo** sotto le 10 aziende.

---

## Step 4 — Aggrega i peer e affianca l'azienda

> Annuncia la chiamata.

1. **Peer**: **una sola** `syrto_aggregate_companies` con i filtri calibrati (semantic + `match_cutoff` ottimale + `financial.size`), per il **solo anno di riferimento**, con le metriche di default (sotto). La crescita è già coperta da `revenue_cagr_3_years` dentro il set: **non** fare una seconda aggregazione sull'anno − 3. Ottieni `company_count`, e per ogni metrica `average`, `median`, `min`, `max`. Il **valore aggregato** del perimetro si ricava dai conteggi e dalle medie (es. fatturato totale ≈ `company_count × average` del fatturato; idem EBITDA).
2. **Azienda**: le sue metriche le hai già dall'`syrto_get_company_analysis` dello Step 1 (stesso anno di riferimento) — riusale, non rifare la chiamata. Se ti serve uno slug non presente nell'analisi, integralo con `syrto_get_company_metrics`.

### Metriche di default (adattabili su richiesta)
- Fatturato — `revenues_from_sales_and_services`
- Crescita ricavi 3y — `revenue_cagr_3_years`
- EBITDA — `ebitda`
- EBITDA margin — `ebitda_margin`
- ROE — `roe`
- Solidità (Debt/EBITDA o PFN/EBITDA) — risolvi lo slug esatto con `syrto_search_metric_definitions` (cerca "debt", "net financial position")

Se l'utente vuole tagliare o estendere il set, assecondalo.

---

## Step 5 — Output

I blocchi qui sotto sono il **contenuto** del deliverable. Il rendering — formato, canone estetico, offerta del PDF, digest in chat — segue `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (leggi `/preferences.md` dalla memoria, sovrascrivibile da un template dell'utente). Non costruire un HTML con stile proprio.

Apri con una riga di contesto: azienda, testo semantico usato, soglia calibrata, classe dimensionale, anno di riferimento.

**Perimetro peer**
- **N. aziende** del perimetro.
- **Valore aggregato** (fatturato totale ed EBITDA totale del perimetro).

**Benchmark azienda vs peer** — tabella:

| Metrica | Azienda | Media peer | Mediana peer | Posizione |
|:--------|-------:|-----------:|-------------:|:----------|
| Fatturato | … | … | … | sopra/sotto media; dove nel range min–max |
| CAGR ricavi 3y | … | … | … | … |
| EBITDA | … | … | … | … |
| EBITDA margin | … | … | … | … |
| ROE | … | … | … | … |
| Debt/EBITDA | … | … | … | … |

La **posizione** è qualitativa: sopra/sotto la media, sopra/sotto la mediana, e dove cade nell'intervallo min–max. **Niente percentili/quantili.**

Chiudi con un **verdetto di 1–2 righe** (dove l'azienda è forte/debole rispetto ai pari) e, se il web è abilitato, eventuale contesto con **fonti citate inline**.

**Peer nominati**: non fanno parte dell'output di default. Se l'utente li chiede, o fai un `syrto_search_companies` dei top match nel perimetro calibrato (stessi filtri, `sort match_score desc`), oppure indirizza alla skill **comparables** (che è pensata per quello, con confronto 1-a-1).

### Formattazione
- ≥ 1B: "X,XB €"; ≥ 1M: "XX,XM €" (un decimale sotto 10M); ≥ 1k: "XXXk €"
- Percentuali in formato italiano con virgola ("12,3%"); le metriche % di Syrto arrivano come rapporti (0.12 = 12%) → moltiplica per 100
- Mancante: "N/D"

---

## Compliance Block (prima dell'output)

Stampa un blocco onesto degli step eseguiti (✅/❌/N/A con note):

```markdown
## ✓ Skill compliance — Market Benchmark

| # | Step | Eseguito | Note |
|:-:|:-----|:--------:|:-----|
| ★ | Fonti (web sì/no) confermate | ✅/❌ | web: sì/no |
| 1 | Azienda identificata (attività + classe dim.) | ✅/❌ | classe: XS/S/M/L |
| 2 | Anno di riferimento = ultimo bilancio target (no detection) | ✅/❌ | anno: … |
| 3 | Query semantica derivata (auto, no conferma) | ✅/❌ | "…" |
| 4 | Calibrazione boundary 15/20 con filtro taglia a monte | ✅/❌ | soglia: 0.XX; peer: N |
| F | Fallback pochi peer (<10) | ✅/N/A | attivato? come proseguito |
| 5 | Aggregato peer (1 call, solo anno rif) + metriche azienda | ✅/❌ | |
| 6 | Output: N aziende + valore aggregato + benchmark | ✅/❌ | |
```

Non mentire mai: se uno step è saltato scrivi ❌ e il perché.

---

## Comunicazione e robustezza (vale per tutta l'esecuzione)

- **Annuncia** ogni attività prima di iniziarla (vedi la regola vincolante in cima): identificazione, anno di riferimento, calibrazione, aggregati. All'inizio dichiara il **piano** in una riga.
- Le query `semantic_search` possono essere **lente** o andare in **timeout/vuoto** per motivi transitori del backend, **non** perché il perimetro sia vuoto. Un timeout o una risposta vuota **non è un dato**: non registrarlo mai come "0 aziende" o "non fitta". **Ritenta la stessa chiamata** (idempotente), fino a ~3 volte; se persiste, fermati e dillo all'utente. Segnala in una riga quando ripeti una chiamata andata lenta.
- Chiamate **in sequenza**, non in parallelo: le query semantiche concorrenti aumentano i timeout.
- Includi sempre il campo `note` dell'API Syrto come disclaimer.

---
_Fonte dati: Syrto Financial Intelligence_

## Radar positioning (optional)

If the question is really about *where this company sits* rather than which numbers it posts,
`syrto_radar_map` places it on size × efficiency scored across Syrto's whole database — so
companies from different sectors compare directly, and it is the only tool that returns
labelled forecast points. `peer_filters` / `aggregates` take the same `filters` object as
`syrto_search_companies` and resolve inside the call, so a company-vs-sector view needs no
prior search. For a file, `syrto_radar_chart` returns the same chart as an embeddable SVG.
Optional — reach for it when positioning is the point, not as a routine step.
