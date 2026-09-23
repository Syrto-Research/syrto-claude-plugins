# Market Sizing — Nota Metodo e Output finale

Riferimento della skill `market-sizing`. Leggi questo file prima di costruire l'output finale.

---

## Nota Metodo (in cima al deliverable)

Prima dei numeri di mercato scrivi una breve nota **Metodo** (3-6 righe), così il lettore sa quanto fidarsi dei dati prima di leggerli. Elenca le decisioni sul perimetro che l'utente ha confermato:

- **Metodo e perimetro**: ricerca semantica (Modalità A con il testo di ricerca, o Modalità B con N sotto-mercati), oppure codici ATECO elencati.
- **Soglie**: la soglia calibrata di ogni ricerca (non nel percorso ATECO).
- **Filtri e anno**: eventuali filtri aggiuntivi e l'anno di riferimento.
- **Base di bilancio**: bilanci individuali, salvo che l'utente abbia chiesto altro.
- **Esatto o stimato**: in Modalità B, se il numero di aziende uniche e il totale sono esatti (unione con soglie uguali) o stimati, e come è stato misurato l'overlap.
- **Fonti**: solo Syrto, documenti dell'utente, web con citazioni.
- **Scostamenti** dal metodo, con il motivo: un checkpoint saltato perché l'utente l'ha chiesto, un overlap non misurabile (totale riportato come range).

La nota parla al lettore: niente nomi di strumenti, parametri o numeri di step interni.

**Prima di scrivere l'output**, controlla senza stamparlo: le domande iniziali e i checkpoint hanno avuto risposta (o l'utente ha chiesto di saltarli); ogni ricerca ha la sua soglia calibrata e il tally al confine; in Modalità B il perimetro unico è contato, stimato o dato come range; nessun numero viene dal web. Se manca qualcosa, completalo ora invece di segnalarlo.

---


## Step 7: Output Finale

Le tabelle e i blocchi descritti qui sotto sono il **contenuto** del deliverable: titolo del mercato, nota Metodo, perimetro complessivo, composizione per sotto-mercato (Modalità B), aziende campione (Modalità B) e note/disclaimer. La nota Metodo va comunque **in cima**, prima di tutto il resto. Il rendering — formato, canone estetico, offerta del PDF, digest in chat — segue `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (leggi `/preferences.md` dalla memoria, sovrascrivibile da un template dell'utente). Non costruire un HTML con stile proprio.

Il contenuto dipende dalla modalità.

### Modalità A — Singola search

```
## Mercato: [Nome del Mercato]

[QUI VA LA NOTA METODO, prima di tutto il resto]

---

**Perimetro complessivo**

Ricerca semantica utilizzata: **"[testo EN]"** — soglia calibrata: **0.XX**

| Metrica | [Anno di Riferimento] |
|:--------|-------------:|
| N. Aziende | X.XXX |
| Fatturato Medio | XX,X Mln € |
| Fatturato Mediano (range) | XX,X Mln € - XX,X Mln € |
| EBITDA Medio | XX,X Mln € |
| EBITDA Margin Mediano (range) | XX,X% - XX,X% |
| CAGR Ricavi 3y Mediano | XX,X% |

> Perimetro definito via singola ricerca semantica Syrto.
> La soglia è stata calibrata al minimo valore che produce ≥ 15/20 aziende pertinenti al confine.
> Importi: medie aritmetiche. Rapporti (EBITDA margin, CAGR): mediane. I range sono l'intervallo tra 10° e 90° percentile.
> [1-2 frasi di commento sul mercato]
```

### Modalità B — Decomposizione

```
## Mercato: [Nome del Mercato]

[QUI VA LA NOTA METODO, prima di tutto il resto]

---

**Perimetro complessivo (al netto delle sovrapposizioni)**

| Metrica | [Anno di Riferimento] |
|:--------|-------------:|
| N. Aziende uniche | X.XXX (esatto) oppure ~X.XXX (stima) |
| Fatturato Totale perimetro | XXX,X Mln € (esatto o ~stima) |
| Fatturato Medio | XX,X Mln € |
| EBITDA Medio | XX,X Mln € |
| EBITDA Margin Mediano | XX,X% |
| CAGR Ricavi 3y Mediano | XX,X% |

> Se le soglie dei sotto-mercati coincidono e rientrano nel conteggio dell'unione, **N. Aziende uniche**, **Fatturato Totale** e le statistiche del perimetro sono **esatti**. Altrimenti sono **stime**: indica come è stato misurato l'overlap (unione a soglia comune con intervallo certo [A; B], oppure `f = X%` campionato sulle prime 50 aziende per sotto-mercato, approssimato). Le size e le statistiche **per sotto-mercato** (tabella sotto) sono esatte.

### Composizione per sotto-mercato

| Sotto-mercato | Testo di ricerca (EN) | Soglia calibrata | N. Aziende | Fatturato Medio | EBITDA % Mediano | CAGR Ricavi 3y Mediano |
|:--------------|:---------------------|:----------------:|----------:|---------------:|--------------:|--------------------:|
| [Nome 1] | "..." | 0.XX | X.XXX | XX,X Mln € | XX,X% | +XX,X% |
| [Nome 2] | "..." | 0.XX | X.XXX | XX,X Mln € | XX,X% | +XX,X% |
| [Nome 3] | "..." | 0.XX | X.XXX | XX,X Mln € | XX,X% | +XX,X% |

> Perimetro definito via ricerca semantica Syrto.
> Per ogni sotto-mercato la soglia è stata calibrata al minimo valore che produce ≥ 15/20 aziende pertinenti al confine.
> Importi: medie aritmetiche del rispettivo perimetro. Rapporti (EBITDA margin, CAGR): mediane.
> [1-2 frasi di commento sul mercato]
```

### Cosa mostrare nella tabella per sotto-mercato (Modalità B)

Per ogni sotto-mercato, mostra:
- Il **nome descrittivo** in italiano
- Il **testo di ricerca in inglese** usato (per trasparenza e riproducibilità)
- La **soglia calibrata** finale
- Il **numero di aziende**
- Il **fatturato medio** (media dall'aggregato Syrto)
- L'**EBITDA % mediano**
- Il **CAGR ricavi 3y mediano**

Questo dà all'utente piena visibilità su come è stato costruito il perimetro e gli permette di giudicare se la scomposizione ha senso.

### Aziende campione per sotto-mercato (Modalità B)

Sotto le tabelle, elenca per ciascun sotto-mercato le ~50 aziende più pertinenti (Step 5), con **ragione sociale + partita IVA**: mostrarle dà all'utente un campione concreto delle aziende del perimetro. Precisa che è un campione delle aziende più pertinenti per match, non l'elenco completo del perimetro.

### Regole di formattazione (entrambe le modalità)

- Importi e percentuali nello stile numerico della casa (core §5).
- Null/mancante: "N/D"

---
