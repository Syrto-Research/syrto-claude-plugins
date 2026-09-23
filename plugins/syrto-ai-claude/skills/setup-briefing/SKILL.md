---
name: setup-briefing
description: >-
  Comando esplicito: configura, sposta o ferma la routine automatica del briefing giornaliero
  come attività pianificata ricorrente. Trigger su "/setup-briefing", "configura il briefing
  giornaliero", "schedula il briefing", "sposta l'orario del briefing", "set up my daily
  briefing". Non per preparare un briefing adesso (usa briefing).
disable-model-invocation: true
argument-hint: [orario opzionale, es. "07:00" o "21:00"]
---

# Setup Daily Briefing

Configura la routine automatica che ogni sera prepara il briefing per i meeting del prossimo
giorno lavorativo, tramite uno scheduled task.

## Cosa fare

1. **Verifica prerequisiti**: connettore **Syrto**, connettore **calendario** (quello connesso, es. Outlook o Google Calendar) e la
   ricerca web devono essere disponibili. Se manca qualcosa, spiega all'utente cosa connettere.
   Serve anche una funzione di attività pianificate nel client (in Claude Desktop e Cowork, le
   attività pianificate): se il client non la offre, dillo e suggerisci di lanciare il briefing
   a mano con `/briefing-now`.

2. **Chiedi l'orario** (se non passato come argomento):
   - Default suggerito: **21:00** (la sera prima, per preparare il giorno dopo).
   - L'utente può scegliere qualsiasi orario.
   - Se sceglie un orario mattutino (es. 07:00), avvisa che il briefing sarà per i meeting di
     oggi stesso, non del giorno dopo.

3. **Riepiloga e chiedi conferma prima di creare**: orario, giorni attivi (lun-ven) e cosa verrà
   generato. Ricorda che ogni esecuzione legge i dati Syrto come una richiesta manuale, quindi
   conta nell'utilizzo del piano anche nei giorni in cui il briefing non viene aperto. Se la
   descrizione dello strumento dice che le attività girano solo con l'app aperta, dillo. Crea
   l'attività solo dopo un sì.

4. **Crea l'attività pianificata** con la funzione di attività pianificate del client:
   - **Orario**: quello confermato, solo giorni lavorativi (lun-ven). Se lo strumento chiede
     un'espressione cron, leggi nella sua descrizione se va in ora locale o in UTC: in ora
     locale usa l'orario così com'è (21:00 → `0 21 * * 1-5`); in UTC convertilo e avvisa che al
     cambio dell'ora legale l'esecuzione si sposta di un'ora.
   - **Prompt salvato**: un'esecuzione pianificata non ricorda questa conversazione, quindi il
     prompt deve bastare a se stesso. La data target si decide qui, in base all'orario, così
     l'esecuzione non deve calcolarla:
     - orario dalle 18:00 in poi:
       ```
       Esegui la skill briefing in modalità calendario per i meeting del prossimo giorno
       lavorativo (dopo il venerdì viene il lunedì). È un'esecuzione automatica: non fare
       domande e non proporre scelte, usa i default della skill e annota le ipotesi nel
       riepilogo. Leggi il contesto salvato dell'utente (profilo e contesto commerciale),
       se presente. Salva l'HTML e riassumi in chat meeting, verdetti e aziende non trovate
       su Syrto.
       ```
     - orario prima delle 18:00: lo stesso prompt, con "per i meeting di oggi" al posto di "per
       i meeting del prossimo giorno lavorativo (dopo il venerdì viene il lunedì)".
   - **Nome**: "Daily Briefing".

5. **Conferma** all'utente: orario configurato, giorni attivi (lun-ven), cosa verrà generato
   (briefing con profilo aziende + persone + fit read + talking points), come cambiarlo
   (`/setup-briefing 07:30`) e come lanciarlo a mano (`/briefing-now`).

## Se il task esiste già

Controlla prima le attività pianificate esistenti. Se esiste già "Daily Briefing":
- Chiedi se l'utente vuole aggiornare l'orario; se non ne indica uno nuovo, conserva quello attuale.
- Aggiorna l'attività esistente invece di crearne una nuova (evita duplicati), e riscrivi il
  prompt salvato con la variante che corrisponde al nuovo orario.
- Se l'utente chiede di fermarla, sospendila o eliminala.
