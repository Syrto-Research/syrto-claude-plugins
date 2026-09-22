---
name: briefing-now
description: >-
  Genera subito il briefing per i meeting di oggi o di una data indicata, oppure per una
  singola azienda nominata. Invoca la skill `briefing`. Trigger su "/briefing-now",
  "briefing di oggi", "prepara le call di oggi", "cosa ho oggi".
argument-hint: [data opzionale, es. "domani" o "2025-03-15", o un nome azienda]
---

# Briefing Now

Genera immediatamente il briefing per i meeting di oggi (o della data indicata), invocando la
skill **briefing**.

## Cosa fare

1. **Determina la data target (`target_date`)**:
   - Nessun argomento → **oggi**.
   - `$ARGUMENTS` contiene "domani" / "tomorrow" → domani.
   - `$ARGUMENTS` è una data (YYYY-MM-DD) → quella data.
   - `$ARGUMENTS` è un nome azienda (non una data) → profila solo quella azienda (salta il calendario).

2. **Invoca la skill `briefing`** passando `target_date`. La skill legge il contesto dal
   profilo in memoria (`/areas/syrto-commercial-context.md`, `/profile.md`) e segue i layer condivisi in
   `${CLAUDE_PLUGIN_ROOT}/shared/` per metodo, formato e handoff.

3. **Se l'argomento è un nome azienda**:
   - Salta la lettura del calendario (Step 1–2 della skill).
   - Vai diretto all'enrichment Syrto + web e alla fit read per quell'azienda.
   - Chiedi il nome della persona del meeting se non fornito.
   - Genera un singolo card di briefing.

4. **Consegna** il deliverable come da `core.md` (HTML di default, offri il PDF, digest
   in chat) e presenta il file.
