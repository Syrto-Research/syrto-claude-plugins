---
name: market-sizing
description: >
  Market sizing / market perimeter for the Italian market using Syrto data. Two methods,
  chosen at the start: Syrto semantic search (companies by real business activity, beyond
  rigid Ateco codes) or Ateco/NACE codes. Also asks up front for sector documents to upload
  and whether to use the web (citing sources) or work Syrto-only.
  Trigger on: market sizing, market size, market overview, sector analysis, industry aggregates,
  "quante aziende ci sono nel mercato di [X]", especially cross-Ateco sectors (facility
  management, fintech, digital health, IoT). Also when another Syrto skill needs market context.
  Examples: "mercato del facility management", "mercato del baby food", "Medtech market in Italy".
  Do NOT trigger from a bare company name or to benchmark a company vs its sector
  (use market-benchmark), for a peer/competitor list (use comparables), or a single-company
  report. Start from a company only if the user explicitly wants the MARKET it operates in sized.
---

## PRECONDITION — user profile required (do this FIRST)
# Syrto Market Sizing

Questa skill fa **market sizing**: definisce il perimetro di un mercato e ne misura la dimensione. Il metodo di default è **semantico**, cioè definisce il perimetro — in base a cosa fanno davvero le aziende — anziché per codici Ateco/NACE. È particolarmente utile per settori che attraversano più codici Ateco (facility management, fintech, digital health, ecc.) dove nessun singolo codice cattura il mercato reale.

> 🗣️ **REGOLA DI COMUNICAZIONE — VINCOLANTE, PREVALE SULLO STILE DI DEFAULT.**
> Le chiamate a Syrto sono lente e l'utente vuole essere aggiornato passo passo. Perciò **prima di OGNI chiamata a un tool Syrto** — dalla primissima (ricerca azienda, anno di riferimento, filtri docs) fino all'ultima — scrivi **una riga di testo visibile** che dice *cosa stai per fare e perché serve*.
> So che di norma lo stile dell'ambiente dice di non annunciare i tool call: **qui quella regola NON si applica**, perché è una richiesta esplicita dell'utente e il task è lungo. Una sequenza di tool che parte senza una riga di contesto davanti è un **errore di esecuzione**, non uno stile più pulito.
> Formato: una frase breve, es. *"Calibro la soglia del mercato: prendo le 20 aziende al confine a 0.80 e le giudico IN/OUT."* Poi fai la/le chiamata/e. Dettagli e altri esempi nella sezione «Comunicazione durante l'esecuzione».

## Modalità di esecuzione

La skill esegue in una di due modalità, decise allo Step 1:

- **Modalità A — Singola Search**: per mercati atomici, dove tutte le aziende fanno fondamentalmente la stessa cosa. Una sola ricerca semantica, una soglia, niente decomposizione né deduplicazione.
- **Modalità B — Decomposizione**: per mercati ampi che attraversano dimensioni diverse (HW vs SW, prodotto vs servizio, ecc.). Più sotto-mercati calibrati in sequenza, calibrazione indipendente, stima dell'overlap a campione per il totale unico.

La scelta della modalità avviene allo Step 1 con conferma esplicita dell'utente.

## Obiettivo

Dato un mercato richiesto dall'utente, questa skill deve:

1. Decidere se il mercato è atomico (Modalità A) o ampio (Modalità B)
2. Definire uno o più testi di ricerca in inglese ottimizzati per la semantic search di Syrto
3. Per ciascuna ricerca, calibrare la soglia di match controllando i risultati al confine
4. Produrre in output la dimensione reale del mercato

Il flusso è semplice e lineare: **valuta atomicità → cerca → valida → aggiusta → aggrega**.

> ⚠️ **Compliance vincolante.** Questa skill ha due checkpoint che richiedono un tool call esplicito (`ask_user_input_v0`) per proseguire. In Modalità A i checkpoint sono Step 1 (conferma singola search) e Checkpoint B (conferma calibrazione). In Modalità B sono Checkpoint A (conferma decomposizione) e Checkpoint B (conferma calibrazione). Non sono suggerimenti, sono blocchi operativi. Inoltre l'output finale DEVE essere preceduto da un blocco di compliance che documenta quali step sono stati eseguiti. Saltare un checkpoint o omettere il compliance block significa **non aver eseguito la skill**.

---

## Comunicazione durante l'esecuzione (annuncia sempre i progressi)

Alcune chiamate Syrto sono lente: se lavori in silenzio la chat sembra ferma e l'utente non capisce se è partito. Quindi **annuncia sempre**, in una riga, prima di iniziare ogni attività — cosa stai per fare e il risultato che ti aspetti. In particolare:

- Fin dalle **prime chiamate di setup** — ricerca dell'azienda, anno di riferimento, lettura dei filtri (`syrto_get_search_filter_docs`) — annuncia **ognuna** con una riga. È esattamente lì che i tool tendono a partire muti: non farlo accadere.
- Prima della **prima calibrazione**, annuncia il **piano**: quanti sotto-mercati calibrerai e in che ordine, così l'utente sa cosa aspettarsi mentre le chiamate girano. Es.: *"Ho 3 sotto-mercati (formule, cereali/omogeneizzati, svezzamento/integratori). Calibro le soglie uno alla volta, cercando per ciascuno la più bassa che tiene ≥15/20 aziende pertinenti al confine. Parto dal primo."*
- All'inizio di **ogni attività** (anno di riferimento, calibrazione di un sotto-mercato, stima overlap) dì cosa stai facendo e cosa ti aspetti.
- Quando una **calibrazione va a buon fine**, dillo subito: **soglia trovata** e **quante aziende** ci sono in quel sotto-mercato. Poi annuncia che parti con il successivo. Es.: *"✅ Sotto-mercato 2 chiuso: soglia 0.83, 3 aziende. Passo al sotto-mercato 3."*
- Se una chiamata va in **timeout e la ripeti**, dillo in una riga (*"Syrto ha risposto lento, ripeto la chiamata"*), così l'attesa è comprensibile.

Non sono chiacchiere: su un'esecuzione lunga tengono l'utente informato e mostrano che il lavoro procede. Questo vale anche quando la skill è chiamata da un'altra skill.

---

## Inputs

Serve uno di questi:

1. **Un nome azienda o una partita IVA** — in questo caso parti dallo Step 0 (Identificazione Mercato)
2. **Una descrizione libera del mercato** — l'utente descrive il mercato direttamente (es. "facility management", "baby food", "Medtech") — in questo caso salta lo Step 0 e vai direttamente all'Anno di Riferimento

---

## Passo iniziale — Fonti dell'analisi (chiedi PRIMA di tutto)

Prima dello Step 0, chiedi all'utente due cose, perché cambiano come conduci l'analisi. Chiamale con un solo `ask_user_input_v0`:

```json
{
  "questions": [
    {
      "question": "Prima di partire: hai documenti sul settore da caricare, da incorporare nell'analisi?",
      "options": ["Sì, ti carico dei documenti", "No, nessun documento"],
      "type": "single_select"
    },
    {
      "question": "Da dove pesco i dati: solo Syrto (più i tuoi documenti), o anche dal web citando ogni fonte?",
      "options": ["Solo Syrto e miei documenti", "Anche web, citando ogni fonte"],
      "type": "single_select"
    }
  ]
}
```

Regole conseguenti:

- Il **perimetro quantitativo** (conteggi, medie, size) viene **sempre e solo da Syrto**: è la fonte dei dati aziendali. Documenti caricati e web servono a definire meglio il mercato, i sotto-mercati e il commento — **non** a sostituire o correggere i numeri Syrto.
- Se ci sono **documenti caricati**, leggili e sintetizzali *prima* di proporre la definizione di mercato (Step 0/1): possono suggerire i confini del settore, i segmenti e i termini giusti per i testi di ricerca.
- Se l'utente sceglie **"Solo Syrto e miei documenti"**, **non fare alcuna ricerca web**.
- Se sceglie **"Anche web"**, ogni affermazione presa dal web deve avere una **citazione con link inline**; non riportare mai un dato dal web senza fonte verificabile.

---

## Scelta del metodo — ATECO o Semantico (chiedi subito dopo le fonti)

Ci sono due modi per definire il perimetro. Chiedi con `ask_user_input_v0`:

```json
{
  "questions": [
    {
      "question": "Come vuoi definire il perimetro del mercato?",
      "options": [
        "Ricerca semantica Syrto (per vera attività aziendale)",
        "Codici ATECO"
      ],
      "type": "single_select"
    }
  ]
}
```

- **Semantico** → è il percorso completo di questa skill (dallo Step 0 in poi): definizione del mercato, atomicità, calibrazione della soglia, stima overlap. Trova le aziende per quello che *fanno davvero*, oltre i limiti degli ATECO.
- **ATECO** → vai al **Percorso ATECO** (in `references/perimeter.md`) e salta gli Step 0–5: atomicità, calibrazione e stima overlap non si applicano (l'ATECO è un filtro netto, senza soglia).

---

---

## Workflow ad alto livello

Sotto ci sono i nomi degli step e cosa fanno; il **dettaglio operativo completo** (criteri, esempi, formati dei tool call, layout di output) vive nei file `references/`, da leggere al momento indicato.

**Metodo ATECO (alternativa al semantico).** Se l'utente sceglie ATECO, non si applicano atomicità, calibrazione e overlap: leggi il **Percorso ATECO** in `references/perimeter.md` e seguilo, poi produci l'output col formato Modalità A (`references/output.md`).

**Percorso semantico:**

1. **Step 0 — Identificazione del Mercato** (solo se l'input è un'azienda): trova l'azienda su Syrto, leggi l'`activity_overview`, proponi un mercato e fatti confermare. Se l'input è già un mercato, salta all'Anno di Riferimento.
2. **Anno di Riferimento**: chiedi all'utente l'anno (Y-1 / Y-2…) via `ask_user_input_v0`, avvertendo che l'anno più recente può contare meno aziende per depositi parziali.
3. **Step 1 — Atomicità**: valuta se il mercato è atomico (Modalità A, singola search) o ampio (Modalità B, decomposizione), con il **test di copertura obbligatorio** (nomina 3-5 aziende reali). In Modalità A c'è un checkpoint `ask_user_input_v0` per confermare la singola search.
4. **Step 2 — Decomposizione** (solo Modalità B): scomponi in 3-6 sotto-mercati, ciascuno con un testo di ricerca in inglese, e fai il check di copertura.
5. **Checkpoint A** (solo Modalità B, VINCOLANTE): fai approvare la decomposizione via `ask_user_input_v0` prima di calibrare.

→ **Prima di eseguire Step 0–2 e Checkpoint A, leggi `references/perimeter.md`** (criteri di atomicità, regole per i testi di ricerca, esempi Medtech/Baby food, formati esatti dei tool call).

6. **Step 3 — Calibrazione delle soglie** (entrambe le modalità): per ogni search trova la soglia più bassa che tiene ≥ 15/20 aziende pertinenti al confine, con rubrica IN/OUT binaria e registro per id azienda. È il cuore della ripetibilità.
7. **Checkpoint B** (VINCOLANTE): presenta il report di calibrazione (soglie, conteggi, le 20 al confine con verdetti) e fai approvare via `ask_user_input_v0` prima di aggregare.
8. **Step 4 — Aggregati finali**: una sola aggregate per query (incl. `revenue_cagr_3_years`), nessuna call sull'anno−3.
9. **Step 5 — Perimetro unico** (solo Modalità B): stima l'overlap a campione (50 aziende per sotto-mercato) per il totale unico; le size e le medie per sotto-mercato restano esatte.

→ **Prima di calibrare (Step 3), leggi `references/calibration.md`** (come funziona la search, il test a soglia `c`, la rubrica IN/OUT, l'algoritmo a griglia deterministico, gli esempi, e la stima overlap dello Step 5 con il Checkpoint B).

10. **Compliance Block + Step 7 — Output finale**: stampa il **Compliance Block** (obbligatorio, sempre in cima), poi l'output nel formato della modalità eseguita.

→ **Prima di costruire l'output, leggi `references/output.md`** (formato del Compliance Block e regola di onestà, layout tabellare Modalità A e B, aziende campione, regole di formattazione).

## Note Importanti

- La **semantic search è il cuore** di questa skill. Trova aziende per quello che fanno realmente, bypassando i limiti degli Ateco. Questo è un differenziale chiave di Syrto.
- La **scelta della modalità** (atomica vs decomposta) è la prima decisione operativa. Sbagliare modalità significa o introdurre rumore artificiale (decomposizione di un mercato già stretto) o perdere granularità (singola search su un mercato cross-categoria). Il test di copertura allo Step 1 è il filtro principale.
- Il **ciclo di calibrazione** (trova la soglia minima che produce ≥15/20 fitting al confine, con verdetti IN/OUT binari e registro per id azienda) è il meccanismo che garantisce qualità, ampiezza e ripetibilità del perimetro. Non saltarlo mai, in nessuna modalità.
- I **due Checkpoint vincolanti per modalità** (Modalità A: Step 1 + Checkpoint B; Modalità B: Checkpoint A + Checkpoint B) richiedono tool call espliciti via `ask_user_input_v0`. Senza il tool call, lo step è da considerarsi non eseguito e va dichiarato ❌ nel Compliance Block.
- Il **Compliance Block prima dell'output** è il meccanismo di trasparenza: rende visibile al lettore quali step sono stati realmente eseguiti, prima ancora che legga i numeri.
- La **decomposizione in sotto-mercati** è ciò che rende questa skill efficace per mercati ampi. La qualità dei testi di ricerca determina direttamente la qualità del perimetro.
- Quando questa skill viene chiamata da un'altra skill (es. M&A teaser), restituisci la modalità eseguita, le soglie calibrate, i conteggi e gli aggregati — non ripresentare l'intero output.
- Includi sempre il campo `note` dell'API Syrto come disclaimer.

### Re-read trigger

Se in questa conversazione sono passati molti turni o hai svolto altri task (codice, layout, altre analisi) prima di arrivare a questa skill, **rileggi questa SKILL.md prima di chiamare `syrto_aggregate_companies` con `semantic_search`**. La memoria di un dettaglio operativo (algoritmo di calibrazione, formato dei tool call, modalità A vs B) decade rapidamente — meglio una rilettura di 30 secondi che un'esecuzione approssimativa.

---
_Fonte dati: Syrto Financial Intelligence_
