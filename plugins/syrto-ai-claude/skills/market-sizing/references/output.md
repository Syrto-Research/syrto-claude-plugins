# Market Sizing — Compliance Block e Output finale

Riferimento della skill `market-sizing`. Leggi questo file prima di costruire l'output finale.

---

## Compliance Block (OBBLIGATORIO, prima dell'output)

Prima di mostrare l'output finale (la tabella di mercato e i numeri aggregati), **devi stampare nella risposta** il blocco di compliance qui sotto. Compilalo onestamente: se hai saltato uno step, scrivi ❌ e indica perché. Se uno step **non si applica per la modalità** (es. Step 2/Checkpoint A/Step 5 in Modalità A), scrivi **N/A**. **Mai mentire** — un compliance block falso è peggio di uno step saltato dichiarato.

### Formato

```markdown
## ✓ Skill compliance — Market Perimeter

**Metodo:** [Semantico / ATECO]
**Modalità eseguita:** [A — Singola search / B — Decomposizione / N/A se ATECO]

| # | Step | Eseguito | Note |
|:-:|:-----|:--------:|:-----|
| ★ | Fonti dell'analisi confermate all'inizio (documenti + web) | ✅/❌ | web: sì/no; documenti caricati: ... |
| 0 | Identificazione e conferma del mercato con l'utente | ✅/❌/N/A | mercato confermato: "..." |
| 1 | Valutazione di atomicità + test di copertura | ✅/❌ | esito: atomico → Modalità A / ampio → Modalità B; aziende verificate: ... |
| 1A | Tool call ask_user_input_v0 per singola search (solo Modalità A) | ✅/N/A | risposta: "..." |
| 2 | Decomposizione in N sotto-mercati (solo Modalità B) | ✅/N/A | N = X |
| 2b | Check di copertura sotto-mercati (solo Modalità B) | ✅/N/A | aziende verificate: ... |
| A | Checkpoint A — tool call + risposta utente (solo Modalità B) | ✅/N/A | risposta: "..." |
| 3 | Calibrazione boundary 15/20 per ogni search | ✅/❌ | soglie finali: ... |
| B | Checkpoint B — tool call + risposta utente | ✅/❌ | risposta: "..." |
| 4 | Aggregati: **una sola aggregate per query** (incl. `revenue_cagr_3_years`), nessuna call sull'anno−3 | ✅/❌ | |
| 5 | Perimetro unico Mod. B: stima overlap a campione | ✅/N/A | somma grezza S=XXX; overlap f=X%; unico stimato ≈XXX |
```

### Regola di onestà

Se uno o più step sono stati saltati o eseguiti parzialmente, scrivi ❌ e una nota onesta sul perché. Esempi accettabili:

- "❌ — Step 0 saltato: l'utente ha fornito direttamente il mercato senza azienda di riferimento" (legittimo)
- "❌ — calibrazione saltata: l'utente ha richiesto risultato rapido" (legittimo se l'utente lo ha realmente chiesto)
- "❌ — stima overlap non eseguita: campione delle 50 non recuperabile; totale riportato come range" (legittimo se onesto)
- "N/A — Step 2: Modalità A, decomposizione non applicabile" (legittimo)
- "❌ — Checkpoint 1A saltato: ho proceduto direttamente perché il mercato sembrava ovvio" (NON legittimo — ripeti la skill)
- "❌ — Checkpoint A saltato: ho proceduto direttamente perché la decomposizione era ovvia" (NON legittimo — ripeti la skill)

Esempi **mai accettabili**:

- Mettere ✅ a step non realmente eseguiti
- Spacciare per esatto un totale unico che è stimato, o inventare `f` senza un campione realmente misurato
- Dichiarare "Checkpoint eseguito" senza che `ask_user_input_v0` sia stato chiamato
- Omettere il blocco di compliance dall'output
- Mettere N/A su step che si sarebbero dovuti eseguire nella modalità scelta

Il Compliance Block va sempre **prima** dei numeri di mercato, non dopo, in modo che il lettore possa contestualizzare l'attendibilità dei dati prima di leggerli.

---


## Step 7: Output Finale

Le tabelle e i blocchi descritti qui sotto sono il **contenuto** del deliverable: titolo del mercato, Compliance Block, perimetro complessivo, composizione per sotto-mercato (Modalità B), aziende campione (Modalità B) e note/disclaimer. Il Compliance Block va comunque **in cima**, prima di tutto il resto. Il rendering — formato, canone estetico, offerta del PDF, digest in chat — segue `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (leggi `/preferences.md` dalla memoria, sovrascrivibile da un template dell'utente). Non costruire un HTML con stile proprio.

Il contenuto dipende dalla modalità.

### Modalità A — Singola search

```
## Mercato: [Nome del Mercato]

[QUI VA IL COMPLIANCE BLOCK — prima di tutto il resto]

---

**Perimetro complessivo**

Ricerca semantica utilizzata: **"[testo EN]"** — soglia calibrata: **0.XX**

| Metrica | [Anno di Riferimento] |
|:--------|-------------:|
| N. Aziende | X.XXX |
| Fatturato Medio | XX,XM € |
| Fatturato Mediano (range) | XX,XM € - XX,XM € |
| EBITDA Medio | XX,XM € |
| EBITDA Margin Medio (range) | XX,X% - XX,X% |
| CAGR Ricavi 3y Medio | XX,X% |

> Perimetro definito via singola ricerca semantica Syrto.
> La soglia è stata calibrata al minimo valore che produce ≥ 15/20 aziende pertinenti al confine.
> Tutti i benchmark sono medie aritmetiche (non mediane).
> [1-2 frasi di commento sul mercato]
```

### Modalità B — Decomposizione

```
## Mercato: [Nome del Mercato]

[QUI VA IL COMPLIANCE BLOCK — prima di tutto il resto]

---

**Perimetro complessivo (stima al netto delle sovrapposizioni)**

| Metrica | [Anno di Riferimento] |
|:--------|-------------:|
| N. Aziende uniche (stima) | ~X.XXX |
| Fatturato Totale perimetro (stima) | ~XXX,XM € |
| Fatturato Medio (ponderato) | XX,XM € |
| EBITDA Medio (ponderato) | XX,XM € |
| EBITDA Margin Medio (ponderato) | XX,X% |
| CAGR Ricavi 3y Medio (ponderato) | XX,X% |

> **N. Aziende uniche** e **Fatturato Totale** sono stime: overlap `f = X%` campionato sulle prime 50 aziende per sotto-mercato. Le **medie** sono ponderate per conteggio e insensibili all'overlap → valori reali. Le size e le medie **per sotto-mercato** (tabella sotto) sono esatte.

### Composizione per sotto-mercato

| Sotto-mercato | Testo di ricerca (EN) | Soglia calibrata | N. Aziende | Fatturato Medio | EBITDA % Medio | CAGR Ricavi 3y Medio |
|:--------------|:---------------------|:----------------:|----------:|---------------:|--------------:|--------------------:|
| [Nome 1] | "..." | 0.XX | X.XXX | XX,XM € | XX,X% | +XX,X% |
| [Nome 2] | "..." | 0.XX | X.XXX | XX,XM € | XX,X% | +XX,X% |
| [Nome 3] | "..." | 0.XX | X.XXX | XX,XM € | XX,X% | +XX,X% |

> Perimetro definito via ricerca semantica Syrto.
> Per ogni sotto-mercato la soglia è stata calibrata al minimo valore che produce ≥ 15/20 aziende pertinenti al confine.
> Tutti i benchmark di settore sono medie aritmetiche del rispettivo perimetro (non mediane).
> [1-2 frasi di commento sul mercato]
```

### Cosa mostrare nella tabella per sotto-mercato (Modalità B)

Per ogni sotto-mercato, mostra:
- Il **nome descrittivo** in italiano
- Il **testo di ricerca in inglese** usato (per trasparenza e riproducibilità)
- La **soglia calibrata** finale
- Il **numero di aziende**
- Il **fatturato medio** (average dal Syrto aggregate, non mediana)
- L'**EBITDA % medio** (average)
- Il **CAGR ricavi 3y medio** (average)

Questo dà all'utente piena visibilità su come è stato costruito il perimetro e gli permette di giudicare se la scomposizione ha senso.

### Aziende campione per sotto-mercato (Modalità B)

Sotto le tabelle, elenca per ciascun sotto-mercato le ~50 aziende già estratte per la stima dell'overlap (Step 5), con **ragione sociale + partita IVA**. Sono aziende già estratte (nessuna chiamata aggiuntiva): mostrarle dà all'utente un campione concreto delle aziende del perimetro. Precisa che è un campione delle aziende più pertinenti per match, non l'elenco completo del perimetro.

### Regole di formattazione (entrambe le modalità)

- Valori ≥ 1B: "X,XB €"
- Valori ≥ 1M: "XX,XM €" (un decimale se sotto 10M: "X,XM €")
- Valori ≥ 1k: "XXXk €"
- Percentuali: formato italiano con virgola (es. "12,3%")
- Null/mancante: "N/D"
- Le metriche percentuali da Syrto arrivano come rapporti (0.12 = 12%) — moltiplicare per 100

---

