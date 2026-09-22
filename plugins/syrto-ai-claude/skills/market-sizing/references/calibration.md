# Market Sizing — Calibrazione delle soglie, Checkpoint 2, aggregati e perimetro unico

Riferimento della skill `market-sizing`. Leggi questo file prima di calibrare le soglie (Step 3) e prima di aggregare/deduplicare (Step 4–5). Le capacità Syrto citate qui (ricerca semantica, soglia di pertinenza, ordinamento per pertinenza, conteggio aggregato) sono mappate agli strumenti nella capability map (`${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md`).

---

## Step 3: Cerca e Calibra le Soglie Ottimali (entrambe le modalità)

Questo è il cuore della skill, ed è il punto dove nasce la maggior parte della varianza tra run. L'obiettivo è trovare, per ogni search, la **soglia di match più bassa che produce ancora un perimetro pulito** (≥ 15/20 aziende al confine pertinenti). Soglia più bassa = perimetro più ampio = meno aziende rilevanti perse. La ripetibilità dipende quasi interamente da **quanto è consistente il giudizio di pertinenza al confine**: se il giudizio scivola, la soglia salta e lo stesso mercato passa da 30 a 1.000 aziende. Le regole qui sotto servono a rendere quel giudizio stabile.

In **Modalità A** calibri **una sola query**. In **Modalità B** calibri **una query per sotto-mercato**, la logica del singolo ciclo è identica. Calibra i sotto-mercati **in sequenza, uno alla volta** (non in parallelo, vedi core §6): in parallelo alcuni client vanno in timeout o confondono i risultati. **Annuncia il piano prima di partire e, per ogni sotto-mercato, l'inizio e l'esito** (soglia + numero di aziende) prima di passare al successivo — vedi «Comunicazione durante l'esecuzione».

### Robustezza alle chiamate Syrto (leggi se vedi lentezza o timeout)

Le ricerche semantiche possono essere lente e a volte vanno in timeout o in errore. Distingui due casi:

- Un **errore o un timeout non è un dato**: non registrarlo mai come "0 aziende" o "soglia non fitta", perché corromperebbe la calibrazione. Ripeti la stessa identica chiamata una o due volte (stessi filtri, stesso risultato). Se continua a fallire, **fermati e dillo all'utente** invece di proseguire con un buco nei dati.
- Una **risposta vuota senza errore è un dato**: a quella soglia nessuna azienda raggiunge il punteggio, e Syrto lo dice esplicitamente. Non ripeterla (vedi il test a soglia `c` qui sotto).

I progressi sono salvi: soglie già trovate e verdetti nel registro restano validi, quindi dopo un intoppo riprendi dal punto esatto, non da capo.

### Come funziona la ricerca semantica (leggi prima di calibrare)

La ricerca semantica dà a ogni azienda un punteggio di pertinenza rispetto al testo di ricerca. Il punteggio è una proprietà fissa della coppia (testo di ricerca, azienda): **non dipende dalla soglia**. La soglia minima di pertinenza non riordina nulla, filtra soltanto: tiene le aziende con punteggio ≥ soglia. Due conseguenze operative che sfruttiamo:

- **Le aziende al confine si prendono ordinando per pertinenza crescente.** Chiedi la ricerca semantica con soglia minima `c`, ordinata per pertinenza **crescente**, sull'anno di riferimento: in testa arrivano le aziende con il punteggio più basso ancora sopra `c`, cioè il confine. La breve descrizione dell'attività e il punteggio che la ricerca restituisce bastano per giudicarle: **non serve** leggere il profilo di ciascuna. Usa lo stesso anno del conteggio finale, così le aziende che giudichi sono la stessa popolazione che poi conti.
- **Il verdetto IN/OUT di un'azienda è fisso.** Dato che lo score non cambia con la soglia, se hai già classificato un'azienda a una soglia la sua pertinenza è la stessa a qualsiasi altra soglia. Tieni un **registro per azienda** dei verdetti già dati e riusali quando la stessa azienda ricompare a un'altra soglia (capita soprattutto nei mercati piccoli, dove due soglie vicine condividono parte del confine): non ri-giudicare due volte la stessa azienda. Così un'azienda non risulta IN a 0.80 e OUT a 0.82 per un cambio d'umore del giudizio.

### Il test a una data soglia `c`

Durante la calibrazione ti serve **solo** il confine — non il conteggio totale. Il conteggio a ogni soglia sarebbe una chiamata sprecata: l'esito (fitta / non fitta) dipende unicamente dal rapporto IN/OUT delle 20 al confine. Il conteggio lo prendi **una volta sola**, sulla soglia finale scelta (vedi sotto).

1. **Confine**: ricerca semantica con il testo EN, soglia minima `c`, ordinata per pertinenza crescente, sull'anno di riferimento. Prendi le **prime 20** aziende (se una pagina ne porta meno, continua con la successiva). Sono le 20 al confine.
2. **Giudizio IN/OUT** su ciascuna delle 20, seguendo la rubrica sotto e **riusando il registro** per quelle già viste a soglie precedenti.
3. **Esito**: **≥ 15/20 IN** → la soglia **fitta**. **< 15/20** → **non fitta**. Se al confine ci sono **meno di 20 aziende** (mercato o sotto-mercato piccolo, tipico alle soglie alte), applica la stessa soglia **in percentuale**: fitta se **≥ 75%** delle aziende presenti sono IN (es. 3/3, 5/6, 8/10). Sotto il 75% non fitta. Se al confine **non c'è nessuna azienda**, la soglia è sopra tutto il mercato: conta come non fitta e, se succede già vicino alla soglia di partenza, il testo è troppo stretto (vedi «Limiti di sanità»).

### Rubrica IN/OUT (binaria — è qui che si vince la ripetibilità)

Per ogni azienda al confine decidi **IN o OUT**, mai "quasi". Il criterio è il **test dell'attività-core**: l'azienda è **IN** solo se la descrizione mostra che **svolge come business primario l'attività che definisce il (sotto)mercato**.

È **OUT** se:

- **fornisce alla filiera** invece di operare nel mercato (fornitore di materie prime/componenti/macchinari a chi fa quell'attività, quando il mercato non è quello dei fornitori);
- è **cliente** del mercato, non operatore;
- **rivende o distribuisce soltanto**, quando il mercato è definito come produzione (e viceversa);
- è **holding, immobiliare o generica** senza l'attività operativa;
- fa un'attività **adiacente ma diversa**.

**Prodotto vs servizio è una linea di taglio esplicita.** Se il mercato è definito come *produzione di un bene*, un'azienda che eroga il *servizio* collegato è OUT, e viceversa. Quando la breve descrizione non basta a capire se l'azienda produce un bene o eroga un servizio, leggi il profilo anagrafico e **usa l'ATECO come discriminante**: la sezione NACE separa la manifattura (sez. C) dai servizi (es. sez. J, M, N). Il profilo dà in un colpo solo la descrizione estesa dell'attività e l'ATECO. Usalo per i casi di confine davvero dubbi, non per le 20 di default, e leggi i profili dei casi dubbi tutti insieme in una sola lettura.

**Tally.** Mentre giudichi, scrivi una riga per azienda: `nome → attività core → IN/OUT → motivo in ≤10 parole`. Rende il giudizio verificabile e ripetibile, e confluisce nel report del Checkpoint 2. In chat, per le soglie intermedie basta l'esito (es. *"0.78 → 16/20"*); il tally completo lo mostri per il confine della soglia scelta, nel report del Checkpoint 2.

### Algoritmo di calibrazione (griglia fissa, deterministico)

Parti da **0.80** e testa. Muoviti sulla griglia di **±0.02** finché l'esito cambia, poi fai **una sola verifica a −0.01** per recuperare il valore intermedio. La griglia fissa (…0.78 / 0.80 / 0.82…) e l'unico refinement a −0.01 servono a togliere gradi di libertà: due run che partono dallo stesso punto e seguono la stessa griglia atterrano sullo stesso valore.

**Caso A — 0.80 fitta (≥ 15/20):** scendi per allargare il perimetro.
- Testa **0.78**, poi **0.76**… di 0.02 in 0.02 finché una soglia **non fitta più** (< 15/20).
- Alla prima che non fitta, **verifica a −0.01** il valore intermedio tra l'ultima che fittava e la prima che non fitta (es. 0.78 fitta, 0.76 no → testa 0.77). Se fitta → è la soglia ottimale. Se no → l'ottimale è l'ultima che fittava (0.78).

**Caso B — 0.80 non fitta (< 15/20):** sali per togliere rumore.
- Testa **0.82**, poi **0.84**… finché una soglia **fitta**.
- Alla prima che fitta, **verifica a −0.01** (es. 0.84 fitta, 0.82 no → testa 0.83). Se fitta → ottimale. Se no → ottimale = 0.84.

Scegli sempre il **cutoff più basso che rispetta 15/20**: è il perimetro più ampio ancora pulito.

**Conteggio finale (una volta sola).** Individuata la soglia ottimale, **aggrega una volta** la popolazione con gli stessi filtri (testo di ricerca e soglia ottimale) sull'anno di riferimento, con le metriche fatturato, EBITDA, EBITDA margin e crescita dei ricavi a 3 anni (gli slug sono nella capability map) e con i percentili, che servono per i range dell'output. Da qui prendi il numero di aziende (per il report del Checkpoint 2) e tutte le statistiche. Questa è l'**unica aggregate per query**: la riusi allo Step 4 e nell'output, senza rifarla a ogni soglia testata né sull'anno−3.

**Limiti di sanità.** Se scendendo la soglia continua a fittare sotto ~0.75, o salendo non fitta nemmeno sopra ~0.90, non è un problema di soglia: il testo di ricerca è troppo largo o troppo vago. Riscrivilo più preciso e riparti dallo Step 1 (Modalità A) o Step 2 (Modalità B), invece di forzare una soglia.

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


## Checkpoint 2: Approvazione del Report di Calibrazione

Dopo aver calibrato e contato tutte le ricerche (tutti i sotto-mercati in Modalità B, la singola query in Modalità A), fermati, presenta il report di calibrazione e aspetta la risposta dell'utente prima dell'output e (in Modalità B) del perimetro unico. Il motivo: il giudizio al confine è l'unico passo soggettivo della skill e decide se il mercato conta 30 o 1.000 aziende, quindi l'utente deve poterlo vedere e correggere prima che diventi un numero nel report.

### Cosa scrivere prima della domanda

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

### La domanda

Subito dopo il report completo, chiedi (scelta strutturata se il client la offre, altrimenti opzioni numerate): *"Confermi le soglie calibrate? Procedo con il report finale?"* → `Procedi con il report` · `Ricalibra una search` · `Stop, non procedere`

### Comportamento dopo la risposta

- **"Procedi con il report"** → vai allo Step 4
- **"Ricalibra una search"** → in Modalità B chiedi quale sotto-mercato; in Modalità A è ovvio. Chiedi anche cosa cambia: un verdetto al confine che l'utente giudica diversamente (aggiorna il registro) oppure il testo di ricerca. Poi ricalibra quella search seguendo l'algoritmo dello Step 3, ricontala e ripresenta il report aggiornato con la stessa domanda. Senza un cambiamento l'algoritmo, che è deterministico, darebbe la stessa soglia.
- **"Stop, non procedere"** → fermati, non chiamare altri tool

---


## Step 4: Aggregati Finali

L'aggregate finale di ogni search è **già stata fatta allo Step 3** (conteggio finale sulla soglia ottimale, con le metriche e i percentili indicati lì). È **una sola aggregate per query**: riusa quei risultati, non rifare la chiamata.

Falla ora solo se non l'hai ancora fatta o se l'utente ha ricalibrato al Checkpoint 2, sempre **una volta per search**, con la soglia calibrata ottimale, le stesse metriche e l'anno di riferimento.

**Non fare alcuna call sull'anno−3**: la dinamica storica è data dalla crescita dei ricavi a 3 anni, che rende superflua una seconda aggregate.

Quale statistica riportare:

- **Importi** (fatturato, EBITDA): la **media** restituita da Syrto.
- **Rapporti** (EBITDA margin, crescita dei ricavi a 3 anni): la **mediana**. La media di un rapporto la decidono poche aziende con ricavi quasi nulli, che producono margini o crescite di migliaia di punti percentuali; la mediana descrive l'azienda tipica del perimetro.

---


## Step 5 — Solo Modalità B: Perimetro Unico

In **Modalità A** questo step **non si applica**: c'è una sola query, quindi il numero di aziende è già il numero di aziende uniche. Vai all'output.

In **Modalità B** una stessa azienda può comparire in più sotto-mercati, quindi la somma dei conteggi (`S`) sovrastima il perimetro reale. La **size di ogni singolo sotto-mercato resta esatta** (ognuna dal suo aggregate), e così le sue statistiche. L'overlap sballa invece il **numero unico** e le **statistiche del perimetro complessivo**: un'azienda presente in due sotto-mercati peserebbe due volte in una media ponderata dei sotto-mercati.

`S = Σ` dei conteggi dei sotto-mercati (dalle aggregate già fatte, costo zero). Poi il metodo dipende da quanti sotto-mercati hai.

### Se i sotto-mercati rientrano nel limite dell'unione: conteggio esatto

La ricerca semantica può contare l'**unione** di più testi di ricerca in un solo aggregato (un'azienda è dentro se supera la soglia su almeno uno dei testi), fino al numero massimo di testi indicato nella capability map. L'unione usa **una sola soglia** per tutti i testi.

- **Soglie calibrate tutte uguali**: aggrega una volta l'unione dei testi dei sotto-mercati a quella soglia, con le stesse metriche e percentili dello Step 3. Il numero di aziende è il numero **esatto** di aziende uniche `U`, e medie e mediane sono quelle **esatte** del perimetro unico. **Valore totale** = `U × fatturato medio` dell'unione. Riporta tutto come esatto.
- **Soglie diverse**: l'unione a una sola soglia non riproduce le soglie dei singoli sotto-mercati, quindi:
  - **Intervallo certo**: `U` sta tra il conteggio dell'unione alla soglia calibrata più alta e il minore tra `S` e il conteggio dell'unione alla soglia più bassa.
  - **Stima puntuale**: scegli come soglia comune `c*` la più frequente tra quelle calibrate (a parità, la mediana). Conta ogni sotto-mercato e l'unione a `c*` (riusa i conteggi già fatti a quella soglia): `f = 1 − unione(c*) / Σ conteggi(c*)`, poi `U ≈ round(S × (1 − f))`.
  - **Statistiche del perimetro**: quelle dell'unione a `c*`; **valore totale stimato** = `U × fatturato medio` dell'unione a `c*`. Etichetta `U`, valore totale e statistiche come stime, con l'intervallo certo accanto.

Costo: al più `n + 3` aggregate, fisso rispetto alla dimensione del mercato.

### Se i sotto-mercati sono più del limite: stima a campione (approssimata)

1. Da ogni sotto-mercato tira le **prime 50 aziende** con la ricerca semantica a soglia calibrata, ordinata per pertinenza **decrescente** (sfoglia le pagine finché ne hai 50). Ti servono ragione sociale e partita IVA, non le metriche.
2. Unisci i campioni e conta le P.IVA presenti in **≥ 2 sotto-mercati** → frazione di overlap `f = doppioni / (50 × n)`.
3. **Numero unico stimato**: `U ≈ round(S × (1 − f))`.
4. **Statistiche del perimetro complessivo**: statistiche dei sotto-mercati **ponderate per conteggio** (`Σ(count_i × valore_i) / S`). Le aziende presenti in più sotto-mercati pesano due volte, quindi è un'approssimazione.
5. **Valore totale stimato** del perimetro = `U × fatturato medio ponderato` (equivalente al totale grezzo scalato per `U/S`).

Nel report etichetta **`U`, il valore totale e le statistiche del perimetro come approssimati**, con la nota: *"stima overlap: f = X% campionato sulle prime 50 aziende per sotto-mercato"*. Il campione confronta solo le aziende più centrali di ogni sotto-mercato, quindi tende a sottostimare le sovrapposizioni. Size e statistiche **per sotto-mercato** restano esatte e vanno riportate come tali.

### Riporta le aziende del campione

**Riporta nell'output** ~50 aziende per sotto-mercato, raggruppate per sotto-mercato, con **ragione sociale + partita IVA**. Se hai fatto la stima a campione, sono quelle già estratte (nessuna chiamata aggiuntiva); altrimenti tirale ora con la ricerca semantica a soglia calibrata, ordinata per pertinenza decrescente. Sono un campione delle aziende più centrali di ogni sotto-mercato e danno all'utente qualcosa di concreto in mano.

Se l'utente chiede **come** hai ottenuto i numeri, spiegalo apertamente: conteggio dell'unione (e a quale soglia), oppure campione di 50 per sotto-mercato con `f` misurato, e le formule `U ≈ S(1−f)` e valore `≈ U × fatturato medio`.

**Mai inventare un fattore di overlap**: `f` deve venire da un conteggio o da un campione realmente misurato. Se non puoi fare né l'uno né l'altro, scrivilo nella nota Metodo e riporta il totale come **range** `[max sotto-mercato ≤ unico ≤ S]`, senza spacciare un punto.

---

