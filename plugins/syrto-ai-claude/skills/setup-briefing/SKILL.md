---
name: setup-briefing
description: >-
  Configura la routine automatica del briefing giornaliero come scheduled task ricorrente.
  Trigger su "/setup-briefing", "configura il briefing giornaliero", "schedula il briefing".
argument-hint: [orario opzionale, es. "07:00" o "21:00"]
---

# Setup Daily Briefing

Configura la routine automatica che ogni sera prepara il briefing per i meeting del prossimo
giorno lavorativo, tramite uno scheduled task.

## Cosa fare

1. **Verifica prerequisiti**: connettore **Syrto**, connettore **calendario** (quello connesso, es. Outlook o Google Calendar) e la
   ricerca web devono essere disponibili. Se manca qualcosa, spiega all'utente cosa connettere.

2. **Chiedi l'orario** (se non passato come argomento):
   - Default suggerito: **21:00** (la sera prima, per preparare il giorno dopo).
   - L'utente può scegliere qualsiasi orario.
   - Se sceglie un orario mattutino (es. 07:00), avvisa che il briefing sarà per i meeting di
     oggi stesso, non del giorno dopo.

3. **Crea lo scheduled task** con `create_trigger`:
   - **cron_expression** (in UTC — converti dall'ora locale italiana): converti l'orario in cron, solo giorni lavorativi (es. 21:00 ora italiana → `0 19 * * 1-5` in ora legale, `0 20 * * 1-5` in ora solare).
   - **prompt**:
     ```
     Esegui la skill briefing per i meeting del prossimo giorno lavorativo.
     Regola: se oggi è venerdì → cerca i meeting di lunedì.
     Se oggi è lun-gio e l'orario è ≥18:00 → cerca domani.
     Se l'orario è <18:00 → cerca oggi.
     Leggi il contesto dal profilo in memoria (/areas/syrto-commercial-context.md, /profile.md).
     Consegna il deliverable come da core.md e condividilo.
     ```
   - **name**: "Daily Briefing".
   - **initiation**: `human_request`.

4. **Conferma** all'utente: orario configurato, giorni attivi (lun-ven), cosa verrà generato
   (briefing con profilo aziende + persone + fit read + talking points), come cambiarlo
   (`/setup-briefing 07:30`) e come lanciarlo a mano (`/briefing-now`).

## Se il task esiste già

Verifica prima con `list_triggers`. Se esiste già uno scheduled task "Daily Briefing":
- Chiedi se l'utente vuole aggiornare l'orario.
- Usa `update_trigger` per modificarlo (non crearne uno nuovo — evita duplicati).
