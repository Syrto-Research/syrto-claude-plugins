# Market Sizing — Calibrazione delle soglie, Checkpoint B, aggregati e overlap

Riferimento della skill `market-sizing`. Leggi questo file prima di calibrare le soglie (Step 3) e prima di aggregare/deduplicare (Step 4–5).

---

## Step 3: Cerca e Calibra le Soglie Ottimali (entrambe le modalità)

Questo è il cuore della skill, ed è il punto dove nasce la maggior parte della varianza tra run. L'obiettivo è trovare, per ogni search, la **soglia di match più bassa che produce ancora un perimetro pulito** (≥ 15/20 aziende al confine pertinenti). Soglia più bassa = perimetro più ampio = meno aziende rilevanti perse. La ripetibilità dipende quasi interamente da **quanto è consistente il giudizio di pertinenza al confine**: se il giudizio scivola, la soglia salta e lo stesso mercato passa da 30 a 1.000 aziende. Le regole qui sotto servono a rendere quel giudizio stabile.

In **Modalità A** calibri **una sola query**. In **Modalità B** calibri **una query per sotto-mercato**, la logica del singolo ciclo è identica. Calibra i sotto-mercati **in sequenza, uno alla volta** (non in parallelo): le query semantiche di Syrto sono pesanti lato server e le chiamate concorrenti aumentano i timeout. Passa al parallelo solo se l'API sta rispondendo veloce. **Annuncia il piano prima di partire e, per ogni sotto-mercato, l'inizio e l'esito** (soglia + numero di aziende) prima di passare al successivo — vedi «Comunicazione durante l'esecuzione».

### Robustezza alle chiamate Syrto (leggi se vedi lentezza o timeout)

Le chiamate con `semantic_search` possono essere lente (matching su embedding sull'intero DB) e a volte vanno in **timeout** o tornano **vuote** per motivi transitori del backend, non perché il mercato sia vuoto. Regole:

- Una chiamata andata in **timeout** o tornata **vuota/errore** **non è un dato**: non registrarla mai come "0 aziende" o "soglia non fitta". Corromperebbe la calibrazione.
- **Ritenta la stessa identica chiamata** (è idempotente: stessi filtri → stesso risultato). Aspetta qualche secondo e riprova, fino a ~3 volte.
- Se dopo i tentativi continua a fallire, **fermati e dillo all'utente** invece di proseguire con un buco nei dati.
- I progressi sono salvi: soglie già trovate e verdetti nel registro restano validi, quindi dopo un intoppo riprendi dal punto esatto, non da capo.

### Come funziona la search (leggi prima di calibrare)

Il `match_score` che Syrto assegna a un'azienda è una proprietà fissa della coppia (testo di ricerca, azienda): **non dipende dalla soglia**. La `match_cutoff` non ri-ordina nulla, filtra soltanto — tiene le aziende con score ≥ soglia. Due conseguenze operative che sfruttiamo:

- **Le aziende al confine si prendono ordinando per match_score crescente.** Con `sort_by = {"field": "match_score", "direction": "asc"}` e `match_cutoff = c`, la **prima pagina** di `syrto_search_companies` sono esattamente le aziende con lo score più basso ancora sopra `c` — cioè il confine. Ogni item porta già `short_description` e `match_score`: **non serve** né calcolare offset né chiamare l'anagraphic per leggere cosa fanno. Questo MCP pagina a cursore (25 per pagina, campo `after`) e **non ha** `offset`/`limit` — una pagina basta per prendere le 20 di confine. `semantic_search` e `match_cutoff` vanno dentro `filters.anagraphic` (vedi `syrto_get_search_filter_docs` se hai dubbi sui campi).
- **Il verdetto IN/OUT di un'azienda è fisso.** Dato che lo score non cambia con la soglia, se hai già classificato un'azienda a una soglia la sua pertinenza è la stessa a qualsiasi altra soglia. Tieni un **registro per id azienda** dei verdetti già dati e riusali: non ri-giudicare due volte la stessa azienda. È questo che impedisce alla stessa azienda di risultare IN a 0.80 e OUT a 0.82 per un cambio d'umore del giudizio — la fonte principale del 30-vs-1.000.

### Il test a una data soglia `c`

Durante la calibrazione ti serve **solo** il confine — non il conteggio totale. Il conteggio a ogni soglia sarebbe una chiamata sprecata: l'esito (fitta / non fitta) dipende unicamente dal rapporto IN/OUT delle 20 al confine. Il conteggio lo prendi **una volta sola**, sulla soglia finale scelta (vedi sotto).

1. **Confine**: `syrto_search_companies` con `filters.anagraphic.semantic_search` = testo EN, `filters.anagraphic.match_cutoff` = `c`, `sort_by` = `{"field": "match_score", "direction": "asc"}`, `year` = anno di riferimento. Prendi le **prime 20** aziende (la prima pagina ne ha 25 — te ne bastano 20). Sono le 20 al confine, con `short_description` e `match_score` già inclusi.
2. **Giudizio IN/OUT** su ciascuna delle 20, seguendo la rubrica sotto e **riusando il registro** per quelle già viste a soglie precedenti.
3. **Esito**: **≥ 15/20 IN** → la soglia **fitta**. **< 15/20** → **non fitta**. Se al confine ci sono **meno di 20 aziende** (mercato o sotto-mercato piccolo, tipico alle soglie alte), applica la stessa soglia **in percentuale**: fitta se **≥ 75%** delle aziende presenti sono IN (es. 3/3, 5/6, 8/10). Sotto il 75% non fitta.

### Rubrica IN/OUT (binaria — è qui che si vince la ripetibilità)

Per ogni azienda al confine decidi **IN o OUT**, mai "quasi". Il criterio è il **test dell'attività-core**: l'azienda è **IN** solo se la descrizione mostra che **svolge come business primario l'attività che definisce il (sotto)mercato**.

È **OUT** se:

- **fornisce alla filiera** invece di operare nel mercato (fornitore di materie prime/componenti/macchinari a chi fa quell'attività, quando il mercato non è quello dei fornitori);
- è **cliente** del mercato, non operatore;
- **rivende o distribuisce soltanto**, quando il mercato è definito come produzione (e viceversa);
- è **holding, immobiliare o generica** senza l'attività operativa;
- fa un'attività **adiacente ma diversa**.

**Prodotto vs servizio è una linea di taglio esplicita.** Se il mercato è definito come *produzione di un bene*, un'azienda che eroga il *servizio* collegato è OUT, e viceversa. Quando la `short_description` non basta a capire se l'azienda produce un bene o eroga un servizio, tira l'anagraphic (`syrto_get_company_anagraphic`) e **usa l'ATECO come discriminante**: la sezione NACE separa la manifattura (sez. C) dai servizi (es. sez. J, M, N). L'anagraphic dà in un colpo solo sia l'`activity_overview` (più ricca della short_description) sia l'ATECO — usala per i casi di confine davvero dubbi, non per le 20 di default.

**Tally obbligatorio.** Mentre giudichi, scrivi una riga per azienda: `nome → attività core → IN/OUT → motivo in ≤10 parole`. Rende il giudizio verificabile e ripetibile, e confluisce nel report del Checkpoint B.

### Algoritmo di calibrazione (griglia fissa, deterministico)

Parti da **0.80** e testa. Muoviti sulla griglia di **±0.02** finché l'esito cambia, poi fai **una sola verifica a −0.01** per recuperare il valore intermedio. La griglia fissa (…0.78 / 0.80 / 0.82…) e l'unico refinement a −0.01 servono a togliere gradi di libertà: due run che partono dallo stesso punto e seguono la stessa griglia atterrano sullo stesso valore.

**Caso A — 0.80 fitta (≥ 15/20):** scendi per allargare il perimetro.
- Testa **0.78**, poi **0.76**… di 0.02 in 0.02 finché una soglia **non fitta più** (< 15/20).
- Alla prima che non fitta, **verifica a −0.01** il valore intermedio tra l'ultima che fittava e la prima che non fitta (es. 0.78 fitta, 0.76 no → testa 0.77). Se fitta → è la soglia ottimale. Se no → l'ottimale è l'ultima che fittava (0.78).

**Caso B — 0.80 non fitta (< 15/20):** sali per togliere rumore.
- Testa **0.82**, poi **0.84**… finché una soglia **fitta**.
- Alla prima che fitta, **verifica a −0.01** (es. 0.84 fitta, 0.82 no → testa 0.83). Se fitta → ottimale. Se no → ottimale = 0.84.

Scegli sempre il **cutoff più basso che rispetta 15/20**: è il perimetro più ampio ancora pulito.

**Conteggio finale (una volta sola).** Individuata la soglia ottimale, fai **una** chiamata `syrto_aggregate_companies` con quei filtri (`semantic_search` + `match_cutoff` = soglia ottimale), `year` = anno di riferimento, `aggregate_metric_slugs: ["revenues_from_sales_and_services", "ebitda", "ebitda_margin", "revenue_cagr_3_years"]`: da qui prendi `company_count` (per il report del Checkpoint B) e tutte le medie, CAGR incluso. Questa è l'**unica aggregate per query**: la riusi allo Step 4 e nell'output, senza rifarla a ogni soglia testata né sull'anno−3.

**Limiti di sanità.** Se devi scendere sotto ~0.78 per far fittare, o salire sopra ~0.90 senza mai fittare, non è un problema di soglia: il testo di ricerca è troppo largo o troppo vago. Riscrivilo più preciso e riparti dallo Step 1 (Modalità A) o Step 2 (Modalità B), invece di forzare una soglia.

### Esempi concreti

**Esempio 1 — Caso A (la soglia di partenza fitta):**
Sotto-mercato: "development and manufacturing of medical devices and diagnostic equipment"
- 0.80 → 18/20 ✅ → scendo di 0.02
- 0.78 → 16/20 ✅ → scendo di 0.02
- 0.76 → 11/20 ❌ → verifica a −0.01
- 0.77 → 15/20 ✅ → **soglia ottimale = 0.77**

**Esempio 2 — Caso B (la soglia di partenza non fitta):**
Sotto-mercato: "production of disposable medical supplies and sterilization equipment"
- 0.80 → 10/20 ❌ → salgo di 0.02
- 0.82 → 13/20 ❌ → salgo di 0.02
- 0.84 → 16/20 ✅ → verifica a −0.01
- 0.83 → 15/20 ✅ → **soglia ottimale = 0.83**

---


## Checkpoint B: Approvazione del Report di Calibrazione (VINCOLANTE)

Dopo aver completato la calibrazione (di tutti i sotto-mercati in Modalità B, della singola query in Modalità A), **devi fermarti, presentare il report di calibrazione, e chiamare `ask_user_input_v0`** per ottenere l'approvazione esplicita prima di procedere con aggregazione e (in Modalità B) deduplicazione. Questo è un blocco operativo: senza tool call e risposta esplicita, **non puoi proseguire allo Step 4**.

### Cosa scrivere prima del tool call

Per ogni search calibrata (una in Modalità A, N in Modalità B), mostra:

- La soglia scelta
- Il numero di aziende trovate con quella soglia
- Le 20 aziende al confine che hanno determinato la scelta, con match score e verdetto IN/OUT (il tally della rubrica)

Usa questo formato:

```
### Risultati calibrazione

**1. [Nome search/sotto-mercato]** — Soglia: 0.XX — Aziende trovate: X.XXX

Le 20 aziende al confine (quelle che hanno determinato la soglia):

| # | Azienda | Match Score | IN/OUT | Motivo |
|:-:|:--------|:----------:|:------:|:-------|
| 1 | Nome Azienda Srl | 0.XXX | IN | ... |
| 2 | Altra Azienda SpA | 0.XXX | IN | ... |
| ... | ... | ... | ... | ... |
| 20 | Ultima Azienda Srl | 0.XXX | OUT | ... |

Fitting: XX/20 ✅
```

In Modalità B, ripeti il blocco per ciascun sotto-mercato.

### Tool call obbligatorio

Subito dopo il report completo, chiama `ask_user_input_v0` con questi parametri esatti:

```json
{
  "questions": [
    {
      "question": "Confermi le soglie calibrate? Procedo con aggregati e output finale?",
      "options": [
        "Procedi con gli aggregati",
        "Ricalibra una search",
        "Stop, non procedere"
      ],
      "type": "single_select"
    }
  ]
}
```

### Comportamento dopo la risposta

- **"Procedi con gli aggregati"** → vai allo Step 4
- **"Ricalibra una search"** → in Modalità B chiedi quale sotto-mercato; in Modalità A è ovvio. Ricalibra seguendo l'algoritmo dello Step 3, ripresenta il report aggiornato e **richiama questo tool**
- **"Stop, non procedere"** → fermati, non chiamare altri tool

**Mai procedere allo Step 4 senza un tool call eseguito e una risposta affermativa.**

---


## Step 4: Aggregati Finali

L'aggregate finale di ogni search è **già stata fatta allo Step 3** (conteggio finale sulla soglia ottimale, con `aggregate_metric_slugs: ["revenues_from_sales_and_services", "ebitda", "ebitda_margin", "revenue_cagr_3_years"]`). È **una sola aggregate per query**: riusa quei risultati, non rifare la chiamata.

Falla ora solo se non l'hai ancora fatta o se l'utente ha ricalibrato al Checkpoint B — sempre **una volta per search**, con:
- La soglia calibrata ottimale
- `aggregate_metric_slugs`: `["revenues_from_sales_and_services", "ebitda", "ebitda_margin", "revenue_cagr_3_years"]`
- `year`: anno di riferimento

**Non fare alcuna call sull'anno−3**: la dinamica storica è data dallo slug `revenue_cagr_3_years` (crescita media dei ricavi a 3 anni), che rende superflua una seconda aggregate.

I benchmark di settore (CAGR, EBITDA%, ricavi medi) sono la **`average`** restituita da Syrto, non la mediana.

---


## Step 5 — Solo Modalità B: Perimetro Unico (stima overlap a campione)

In **Modalità A** questo step **non si applica**: c'è una sola query, quindi il `company_count` è già il numero di aziende uniche. Dichiaralo **N/A** nel Compliance Block e vai all'output.

In **Modalità B** una stessa azienda può comparire in più sotto-mercati, quindi la somma dei conteggi (`S`) sovrastima il perimetro reale. Ma attenzione a cosa l'overlap sballa davvero: la **size di ogni singolo sotto-mercato resta esatta** (ognuna dal suo aggregate) e le **medie non sono distorte** — una stessa azienda ha un solo bilancio, quindi la media ponderata dei sotto-mercati è di fatto reale. L'overlap sballa **solo il totale unico** del perimetro. Lo stimiamo a campione, a costo fisso e basso, senza enumerare tutte le aziende.

### Metodo (default)

1. `S = Σ company_count` dei sotto-mercati (dalle aggregate già fatte — costo zero).
2. Da ogni sotto-mercato tira le **prime 50 aziende**: `syrto_search_companies` con quel `semantic_search` + `match_cutoff` calibrato, `sort_by` = `{"field": "match_score", "direction": "desc"}`, due pagine da 25 (`after`/`end_cursor`). Prendi `legal_name` + `tax_id` (arrivano già nel risultato, non servono le metriche). Costo: **2 chiamate × n sotto-mercati**.
3. Unisci i campioni e conta le P.IVA presenti in **≥ 2 sotto-mercati** → frazione di overlap `f = doppioni / (50 × n)`.
4. **Numero unico stimato**: `U ≈ round(S × (1 − f))`.
5. **Medie del perimetro complessivo**: media dei sotto-mercati **ponderata per conteggio** (`Σ(count_i × media_i) / S`). È insensibile all'overlap → riportala come **valore reale**, non come stima.
6. **Valore totale stimato** del perimetro = `U × fatturato medio ponderato` (equivalente al totale grezzo scalato per `U/S`).

Nel report etichetta **`U` e il valore totale come stima**, con la nota: *"stima overlap: f = X% campionato sulle prime 50 aziende per sotto-mercato"*. Size e medie **per sotto-mercato** restano esatte e vanno riportate come tali.

### Costo

~`2 × n` chiamate — con 5 sotto-mercati ≈ **10 chiamate** — e **fisso**: non cresce con la dimensione del mercato.

### Riporta le aziende del campione (non sprecarle)

Le `50 × n` aziende che hai estratto per stimare `f` sono aziende già estratte (nessuna chiamata aggiuntiva): non buttarle. **Riportale nell'output**, raggruppate per sotto-mercato, con **ragione sociale + partita IVA** (arrivano già nel risultato della search). Sono un campione delle aziende più centrali di ogni sotto-mercato e danno all'utente qualcosa di concreto in mano.

Se l'utente chiede **come** hai ottenuto le stime, spiegalo apertamente: campione di 50 per sotto-mercato, `f` misurato, e le formule `U ≈ S(1−f)` e valore `≈ U × media ponderata`.

**Mai inventare un fattore di overlap**: `f` deve venire da un campione realmente misurato. Se non puoi fare nemmeno il campione, dichiaralo nel Compliance Block e riporta il totale come **range** `[max sotto-mercato ≤ unico ≤ S]`, senza spacciare un punto.

---

