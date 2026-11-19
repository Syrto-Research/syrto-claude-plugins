# Market Sizing — Perimetro: metodo ATECO, identificazione mercato, atomicità e decomposizione

Riferimento della skill `market-sizing`. Leggi questo file prima delle domande iniziali, prima di eseguire il metodo ATECO oppure gli Step 0–2 e il Checkpoint 1 del percorso semantico. Le capacità Syrto citate qui sono mappate agli strumenti nella capability map (`${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md`).

---

## Percorso ATECO (solo se l'utente sceglie ATECO)

1. Chiedi all'utente **cosa vuole cercare** (il settore/attività a parole sue), se non l'ha già indicato.
2. **Proponi tu i codici ATECO/NACE più pertinenti** (sezione lettera A–U, divisione, gruppo o classe; i livelli accettati sono nella documentazione dei filtri di ricerca). Presenta ogni codice con la sua descrizione e una riga sul perché lo includi. Se l'utente cita un codice ATECO a 6 cifre, riconducilo alla sua classe e diglielo. Evita codici annidati (una classe dentro una divisione già inclusa). Se hai documenti caricati o (se abilitato) il web, usali per centrare meglio i codici.
3. **Checkpoint 1 (i codici)**: fermati e chiedi di confermare o correggere la lista prima di contare, perché è la lista a definire il perimetro. Opzioni: `Procedi con questi ATECO` · `Voglio modificare i codici` · `Stop`. Non aggregare finché non conferma.
4. Alla conferma, **aggrega una volta** la popolazione filtrata per quei codici sull'anno di riferimento, con le stesse metriche e i percentili del percorso semantico (fatturato, EBITDA, EBITDA margin, crescita dei ricavi a 3 anni). Se la lista mescola livelli diversi (per esempio una divisione e una classe) e il filtro per codice non li accetta insieme, conta ogni livello a parte e somma i conteggi: codici non annidati non si sovrappongono. In quel caso le medie si combinano ponderate per numero di aziende e le mediane dei rapporti diventano approssimate (dillo nella nota Metodo). La crescita a 3 anni è già catturata dalla sua metrica: **non fare una seconda call sull'anno−3**.
5. **Output**: usa il formato dello Step 7 (Modalità A), indicando come perimetro i **codici ATECO** usati al posto del testo semantico. Nessuna stima overlap: l'insieme filtrato per codice è già unico. Nella nota Metodo indica **Metodo = ATECO** con i codici usati.

> L'ATECO è più veloce ma più grezzo: cattura le aziende per classificazione formale, non per attività reale. Per settori cross-ATECO (facility management, fintech, digital health…) il semantico resta più preciso. Se l'utente è incerto, diglielo prima di procedere.

---


## Step 0: Identificazione del Mercato (solo se l'input è un'azienda)

> Gli Step 0–7 sono il **percorso semantico**. Se l'utente ha scelto ATECO, sei già nel Percorso ATECO qui sopra e questi step non si applicano.
>
> Nota: parti da un'azienda **solo** se l'utente vuole esplicitamente la dimensione del **mercato** in cui opera. Se ha dato un'azienda per **confrontarla** con il suo settore (benchmark), quella è la skill **market-benchmark**, non questa.

Se l'utente fornisce un nome azienda o una partita IVA (e non direttamente un mercato):

1. Risolvi l'azienda su Syrto per nome o per P.IVA / codice fiscale (se il nome è ambiguo, conferma l'entità giusta)
2. Leggi il suo profilo anagrafico: la descrizione dell'attività e il codice ATECO

### Caso A — L'azienda ha una descrizione dell'attività su Syrto

3. Sulla base della descrizione delle attività, proponi all'utente **un mercato** in cui l'azienda opera. Sii specifico ma non troppo stretto — il mercato deve essere un settore concreto, non la nicchia esatta dell'azienda.

Presenta la proposta così:

```
L'azienda [Nome Azienda] si occupa di: "[descrizione dell'attività riassunta]"

Propongo di analizzare il mercato: **[Nome mercato proposto]**

Vuoi procedere con questo mercato, oppure preferisci un'altra definizione?
```

### Caso B — L'azienda NON ha una descrizione dell'attività su Syrto

Questo succede spesso con aziende piccole. Se l'utente ha scelto **"Solo Syrto e miei documenti"**, non cercare sul web: proponi un mercato a partire dal codice ATECO del profilo, oppure chiedi all'utente di descrivere l'attività o direttamente il mercato. Se il web è autorizzato:

3. Cerca l'azienda online (usa il nome azienda e la città/provincia dai dati anagrafici Syrto per affinare la ricerca) e trova il suo sito web.
4. Presenta il sito all'utente per conferma:

```
L'azienda [Nome Azienda] non ha una descrizione delle attività su Syrto.

Ho trovato questo sito web: [URL del sito]

È l'azienda giusta?
```

5. Se l'utente conferma, leggi il sito per capire cosa fa l'azienda e proponi un mercato come nel Caso A.
6. Se non è il sito giusto, chiedi all'utente di indicarti il sito corretto o di descrivere lui il mercato.

### In entrambi i casi

**Non procedere finché l'utente non conferma il mercato.** Se l'utente non è d'accordo, discuti finché non concordate su una definizione di mercato. Una volta concordato, usa quel mercato come se fosse l'input originale e prosegui con lo Step 1.

---


## Anno di Riferimento

I bilanci su Syrto arrivano in ritardo: nell'anno corrente e spesso in quello precedente molti bilanci non sono ancora depositati. Se calcoli la size di un mercato su un anno con depositi parziali, conti un sottoinsieme e le medie sono distorte. Serve l'ultimo anno **pieno**.

**Chiedi all'utente quale anno usare** come anno di riferimento, insieme alle altre domande iniziali (se la skill è chiamata da un'altra e la catena ha già fissato un anno, usa quello). Non rilevarlo con chiamate di conteggio (niente aggregate di detection). Presenta come opzioni `Y = anno corrente − 1`, `Y−1` e `Y−2` (sostituiti con gli anni concreti) e **avverti esplicitamente** che scegliere l'anno più recente può restituire **meno aziende**: i bilanci vengono depositati progressivamente e, soprattutto nella finestra **giugno–settembre**, gran parte non è ancora su Syrto, quindi il perimetro risulta sottostimato. L'anno precedente è di norma più "pieno" e stabile.

Testo della domanda (rimpiazza gli anni con quelli concreti): *"Quale anno vuoi usare come anno di riferimento per gli aggregati? Se scegli l'anno più recente ({Y}) e siamo nella finestra giugno-settembre, rischi di contare meno aziende: i bilanci vengono depositati progressivamente e molti non sono ancora su Syrto. L'anno precedente ({Y−1}) è di solito più completo."* → `{Y}` · `{Y−1}` · `{Y−2}`

Usa l'anno scelto dall'utente come anno di riferimento in tutte le ricerche e gli aggregati successivi. La dinamica storica non richiede una call sull'anno−3: arriva dalla metrica di crescita dei ricavi a 3 anni (una sola aggregate per query, vedi Step 3/Step 4).

---


## Step 1: Valutazione di Atomicità del Mercato (decide la modalità)

Prima di decidere se decomporre, valuta se il mercato è abbastanza atomico per essere coperto da una singola ricerca semantica.

### Criteri di atomicità

Un mercato è **atomico** (→ Modalità A) se soddisfa **tutti** questi criteri:

1. **Singola attività coerente**: si può descrivere in 10-25 parole in inglese senza dover tagliare via parti del mercato.
2. **Le aziende fanno la stessa cosa**: i player del mercato hanno attività operative simili tra loro.
3. **Non attraversa dimensioni di business model**:
   - Prodotto vs Servizio
   - Hardware vs Software/Digitale
   - A monte (componenti/materie prime) vs A valle (prodotti finiti)
   - High-tech vs Commodity
   - B2B vs B2C

Se anche una sola dimensione è attraversata in modo significativo, il mercato è **ampio** (→ Modalità B).

**Esempi atomici (Modalità A):**

- "Produttori italiani di latti formulati per neonati" — un prodotto, un'attività
- "Sviluppatori software per studi notarili" — un tipo di software, un cliente
- "Catering per eventi aziendali" — un servizio
- "Produzione di olio extravergine di oliva" — un prodotto, una filiera
- "Aziende di sviluppo siti web e e-commerce" — un servizio digitale coerente

**Esempi non atomici (Modalità B):**

- "Medtech" — HW + SW + consumabili + diagnostica
- "Facility management" — pulizie + manutenzione + sicurezza + landscaping
- "Fintech" — pagamenti + lending + wealth + insurtech
- "AI" — vendor + agenzie + prodotti + piattaforme ML
- "Cosmetica" — skincare + makeup + fragranze + haircare; mass + luxury

### Test di copertura (sempre, prima di decidere)

Prima di scegliere la modalità, **nomina esplicitamente nel ragionamento 3-5 aziende reali** che sai appartenere al mercato richiesto. Per ognuna chiediti: "la mia descrizione di mercato copre come questa azienda si descrive?"

- Se **tutte** le aziende sono coperte da un'unica descrizione → Modalità A
- Se almeno una azienda nota richiede una descrizione diversa dalle altre → Modalità B

Il test compare nel messaggio del Checkpoint 1, così l'utente vede su quali aziende hai verificato la descrizione.

### Modalità A — Mercato Atomico

Se valuti il mercato come atomico:

1. Scrivi **UN testo di ricerca in inglese** seguendo le regole nella sezione "Come scrivere un buon testo di ricerca" più avanti in questo Step.
2. **Checkpoint 1 (Modalità A)**: presenta la proposta all'utente e aspetta la risposta prima di calibrare, perché la calibrazione costa decine di ricerche e un testo sbagliato le spreca tutte. Formato:

```
Il mercato "[Nome]" mi sembra abbastanza stretto da essere coperto da una singola ricerca semantica, senza scomposizione in sotto-mercati.

Proporrei: **"[testo EN]"**

Test di copertura: ho verificato che [Azienda 1], [Azienda 2], [Azienda 3] sarebbero tutte coperte da questa descrizione.

Vuoi che proceda con la singola search, o preferisci che lo scomponga in sotto-mercati per maggiore granularità?
```

3. Subito dopo, chiedi (scelta strutturata se il client la offre, altrimenti opzioni numerate): *"Procedo con la singola search, o vuoi che scomponga il mercato in sotto-mercati?"* → `Vai con la singola search` · `Voglio modificare il testo della search` · `Spacchetta in sotto-mercati` · `Stop, non procedere`

4. Comportamento dopo la risposta:
   - **"Vai con la singola search"** → vai direttamente allo Step 3 (Calibrazione), saltando lo Step 2
   - **"Voglio modificare il testo della search"** → chiedi all'utente in linguaggio naturale come riformulare, applica e **ripeti questo Step 1 da capo** (ripresentando il checkpoint)
   - **"Spacchetta in sotto-mercati"** → cambia modalità, vai allo Step 2 (Modalità B); a quel punto la decomposizione passerà comunque per il Checkpoint 1
   - **"Stop, non procedere"** → fermati, non chiamare altri tool, non produrre output

Una risposta libera si interpreta come indicato nella SKILL.md («Dove ti fermi e aspetti»); se chiede di scomporre, vai allo Step 2.

### Modalità B — Mercato Ampio

Se valuti il mercato come ampio (test di copertura fallito, attraversa dimensioni di business model):

- Procedi direttamente allo Step 2 (decomposizione), senza fermarti in questo step
- L'approvazione della decomposizione viene raccolta più avanti al Checkpoint 1

### Come scrivere un buon testo di ricerca

Vale sia per la singola search della Modalità A sia per ogni sotto-mercato della Modalità B.

Il testo deve essere una **descrizione dettagliata delle attività aziendali** del tipo di azienda che stai cercando. Descrivi **cosa fanno** concretamente — le attività, i processi, i prodotti, i servizi. Non è un claim da homepage né uno slogan: è una descrizione fattuale e specifica delle attività operative.

**Cosa includere:** attività aziendali, processi produttivi, tipi di prodotti/servizi, tecnologie utilizzate, materiali lavorati.

**Cosa NON includere:** clienti target (non "for hospitals and clinics"), qualità del lavoro (non "leading", "innovative", "high-quality"), claim commerciali, mission aziendale.

**Regole:**
- **10-25 parole** per ogni testo
- **In inglese**
- Descrivi solo **cosa fa** l'azienda, non per chi lo fa o quanto bene
- Usa termini concreti e operativi, non etichette di categoria

**Esempio — Medtech sub-query 1:**
- ❌ `"medical technology and healthcare devices"` (etichetta di categoria, troppo generico)
- ❌ `"development and manufacturing of medical devices and diagnostic equipment for hospitals and clinics"` (include il cliente target "for hospitals and clinics")
- ✅ `"development and manufacturing of medical devices, diagnostic imaging equipment and patient monitoring systems"` (descrive solo le attività e i prodotti)

**Esempio — Baby food sub-query 1:**
- ❌ `"baby food products"` (etichetta)
- ❌ `"production of infant formula and nutritional products for newborns and toddlers"` (include il target "for newborns and toddlers")
- ✅ `"production of infant formula, milk-based nutritional preparations and baby weaning food"` (solo attività e prodotti)

---


## Step 2 — Solo Modalità B: Scomponi il Mercato in Sotto-Mercati

Ogni mercato ampio va scomposto in sotto-mercati concreti. Anche un mercato che sembra specifico (es. "facility management") può avere sotto-segmenti distinti con attività aziendali molto diverse tra loro.

### Come ragionare sulla scomposizione

Pensa dal lato dell'offerta: cosa **fanno, producono o vendono** concretamente le aziende in questo mercato? Passa in rassegna queste dimensioni per non tralasciare intere categorie:

1. **Prodotto vs Servizio**: ci sono sia aziende che producono beni fisici che aziende che erogano servizi?
2. **Hardware vs Software/Digitale**: ci sono sia produttori di cose fisiche che aziende tech/software?
3. **A monte vs A valle**: ci sono produttori di materie prime/componenti E assemblatori/distributori di prodotti finiti?
4. **High-tech vs Commodity**: ci sono player specializzati/innovativi E player di volume/commodity?
5. **B2B vs B2C**: alcune aziende vendono ad altre aziende, altre al consumatore finale?

Non tutte le dimensioni si applicano a ogni mercato — ma passarle in rassegna evita di dimenticare un'intera categoria.

### Regole di scomposizione

- Punta a **3-6 sotto-mercati**. Più di 6 = troppo granulare. Meno di 3 = probabilmente manca qualcosa (e in tal caso forse il mercato era atomico — riconsidera la Modalità A).
- Ogni sotto-mercato deve corrispondere a un gruppo di aziende che svolgono attività aziendali simili tra loro.
- Una leggera sovrapposizione tra sotto-mercati va bene — meglio catturare un'azienda due volte che perderla. Il perimetro unico al netto dell'overlap si calcola dopo (Step 5).
- Il nome di un sotto-mercato può citare i clienti (come negli esempi qui sotto); il testo di ricerca in inglese no.

### Esempio: "Medtech"

Applicando il framework: Hardware (dispositivi, impianti) + Software (digital health) + Consumabili (monouso, reagenti) + Diagnostica (strumenti da laboratorio):

1. Sviluppo e produzione di dispositivi medici e apparecchiature diagnostiche per ospedali
2. Produzione di impianti ortopedici, protesi e strumenti chirurgici
3. Sviluppo di software sanitario digitale, piattaforme di telemedicina e sistemi di supporto decisionale clinico
4. Produzione di reagenti diagnostici in-vitro e strumenti di analisi di laboratorio
5. Produzione di materiale medico monouso, apparecchiature di sterilizzazione e dispositivi di monitoraggio paziente

### Esempio: "Baby food"

1. Produzione di latti formulati e prodotti nutrizionali per neonati e prima infanzia
2. Produzione di cereali, omogeneizzati e snack biologici a base di frutta per bambini 0-3 anni
3. Sviluppo e produzione di alimenti complementari per lo svezzamento e integratori nutrizionali pediatrici

### Check di copertura (sempre, prima di calibrare)

Dopo aver scritto i sotto-mercati, prima di fare qualsiasi chiamata API, **nomina esplicitamente nel tuo ragionamento 3-5 aziende reali** che sai appartenere a questo mercato. Per ognuna chiediti: "almeno uno dei miei sotto-mercati coprirebbe come questa azienda si descrive?" Se la risposta è no per qualcuna, aggiungi un sotto-mercato.

Il check compare nel riepilogo del Checkpoint 1: senza la lista esplicita di aziende verificate, il Check di copertura non è stato fatto.

### Definisci i Testi di Ricerca in Inglese

Per ciascun sotto-mercato, scrivi un testo di ricerca seguendo le regole nella sezione **"Come scrivere un buon testo di ricerca"** dello Step 1 (10-25 parole, in inglese, solo attività operative, niente target/qualità/claim).

---


## Checkpoint 1 (Modalità B): Approvazione della Decomposizione

Prima di calibrare, fermati e aspetta l'approvazione dell'utente: la calibrazione costa decine di ricerche per sotto-mercato, e una decomposizione sbagliata le spreca tutte.

### Cosa scrivere prima della domanda

Scrivi nella tua risposta il riepilogo della decomposizione in questo formato:

```
Ho scomposto il mercato "[Nome Mercato]" in questi sotto-mercati:

1. **[Nome sotto-mercato 1]**
   Search: "[testo di ricerca in inglese]"

2. **[Nome sotto-mercato 2]**
   Search: "[testo di ricerca in inglese]"

3. **[Nome sotto-mercato 3]**
   Search: "[testo di ricerca in inglese]"

Check di copertura: ho verificato che [Azienda Nota 1], [Azienda Nota 2], [Azienda Nota 3]
sarebbero coperte rispettivamente dai sotto-mercati [N], [N], [N].
```

### La domanda

Subito dopo il riepilogo, chiedi (scelta strutturata se il client la offre, altrimenti opzioni numerate): *"Confermi questa decomposizione e i testi di ricerca? Procedo con la calibrazione delle soglie?"* → `Procedi con la calibrazione` · `Voglio modificare la decomposizione` · `Stop, non procedere`

### Comportamento dopo la risposta

- **"Procedi con la calibrazione"** → vai allo Step 3
- **"Voglio modificare la decomposizione"** → chiedi all'utente in linguaggio naturale cosa modificare, applica le modifiche e **ripeti questo Checkpoint da capo**
- **"Stop, non procedere"** → fermati, non chiamare altri tool, non produrre output

Una risposta libera si interpreta come indicato nella SKILL.md («Dove ti fermi e aspetti»).

---

