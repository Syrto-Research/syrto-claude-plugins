---
name: outreach-writer
description: >
  Write personalized outbound copy (email + LinkedIn) for companies, using Syrto company
  data and a user-provided value proposition. Brand-agnostic: no campaign tool, no push.
  Use whenever the user says "scrivi messaggi", "genera email", "scrivi le email",
  "messaggio personalizzato", "crea messaggi", "outreach copy", "write outreach",
  "cold email", or wants tailored messages for a set of prospect companies. Typically
  runs after prospects-scout / company-analysis have produced the company list.
metadata:
  version: "1.0.0"
---

## PRECONDITION — user profile required (do this FIRST)
# Outreach Writer

## Suite integration (read first)
Follow `${CLAUDE_PLUGIN_ROOT}/shared/core.md` (method, memory, output, efficiency, handoff) and `${CLAUDE_PLUGIN_ROOT}/shared/syrto-reference.md` (tools + metrics). Reuse any upstream `SYRTO-HANDOFF` before calling Syrto; emit one when you feed another skill.

Generate one personalized email and one LinkedIn message per target company, tailored to what that company actually does. Output is copy only — this skill does not push to any campaign tool. Prerequisite: the Syrto connector is connected.

## Inputs
1. **Company list** — from an upstream `SYRTO-HANDOFF` (preferred: reuse the anagraphic already gathered), an uploaded file, or the user's message. For each company you need its real activity, size and market — read from the handoff, else `syrto_get_company_anagraphic`.
2. **Value proposition** — the angle to push. Ask the user if it isn't given (or take it from `/areas/syrto-commercial-context.md` — what they sell).
3. **Reference client to cite (optional)** — a satisfied client the message can name as proof. This is a **user input or from the memory portfolio**. Never invent one; if none is provided, write the message without a name-drop.
4. **Channels** — which companies also get a LinkedIn message (default: both).

## Message format rules
Non-negotiable. Every message follows them exactly.

**Opening greeting (email and LinkedIn).** Start with a time-of-day greeting followed by the first name: use "Buongiorno [Nome]," in the morning and "Buonasera [Nome]," from the afternoon on. Write it as plain text — use the neutral placeholder `[Nome]` where the first name goes.

**Email closing.** End with:
```
Un caro saluto,
[Firma]
```

**LinkedIn closing.** End with: `Un caro saluto, [Firma]`

Use neutral placeholders throughout — `[Nome]`, `[Firma]`, `[Azienda]` — never templating syntax.

### Style rules
- **Short and direct.** Email body (between greeting and closing) is 3–5 sentences max, two short paragraphs.
- **Never use em dashes.** Use commas or periods.
- **Never use question marks when proposing a meeting.** "Posso proporti un incontro martedì alle 9." not "Ti va martedì alle 9?"
- **Never use English words** where an Italian equivalent exists (no "nice-to-have", "game-changer", "deep dive", "follow-up").
- **Never use colons to introduce a concept.** Write complete sentences.
- **Always propose a specific day and time.** Rotate days (lunedì–venerdì). Only orario 9 or 14. Never repeat the same day+time for consecutive companies.
- **Cite the reference client naturally** when one is provided, as proof of a result — not as a bare customer list. If none is provided, skip the name-drop.
- **Human tone.** Write like someone who genuinely knows what the company does. No buzzwords, no hype.
- **Company-specific hook.** The first sentence after the greeting must reference something specific about THAT company: what they do, their size, their market — drawn from Syrto anagraphic data.

### Email structure
```
Buongiorno/Buonasera [Nome],

[1-2 sentences: company-specific hook from activity + size]
[1-2 sentences: the value proposition, connected to their reality]
[1 sentence: reference-client proof if available + a specific day and time]

Un caro saluto,
[Firma]
```

### LinkedIn structure
Shorter — body under ~300 characters, same rules compressed.
```
Buongiorno/Buonasera [Nome], [company hook + value prop + reference proof + meeting proposal, 2-3 sentences max]

Un caro saluto, [Firma]
```

## Workflow
1. **Group by company.** All contacts at the same company share one email and one LinkedIn message.
2. **Generate per company.** For each unique company produce the email body and the LinkedIn body, built from its Syrto activity/size + the value proposition.
3. **Rotate meeting slots.** Cycle days lunedì→venerdì, alternate 9 and 14, never the same day+time twice in a row.
4. **Assemble & review.** Present the messages (email + LinkedIn per company) to the user, showing 2-3 examples in chat for feedback on tone before finalizing. Adjust on request.

## Output
Email copy + LinkedIn copy per company, presented for review (and exportable to a file on request). No campaign creation, no external push.

## Examples (de-branded — reference client is a placeholder)

**Consulting firm — VP "gestire più progetti senza aumentare le risorse":**
con circa 120 persone su trasformazione strategica, IT e supply chain, immagino che i team spendano parecchio tempo a costruire analisi di mercato e competitive per le proposal. Noi forniamo quei dati pronti in minuti, scenario competitivo, benchmark, posizionamento. Se ti va di approfondire come [cliente di riferimento] ha ridotto il tempo di questi processi del 90%, posso proporti un incontro martedì alle 14.

**Corporate finance — VP "trova aziende perfette per i mandati":**
so che lavorate su M&A e raccolta di capitale cross-border. Trovare i target giusti per i mandati, soprattutto nelle nicchie italiane, è spesso il pezzo più lungo del processo. Noi identifichiamo aziende per attività reale, non per codice ATECO, e mappiamo chi è più predisposto a operazioni straordinarie. Se ti va di vedere come [cliente di riferimento] arriva prima sulle opportunità migliori, posso proporti un incontro mercoledì alle 9.
