---
name: syrto-onboarding
description: >-
  Set up or update the user's Syrto profile: company, role and department, a silent calibration of
  how technical and how deep answers should be, and optional business context (what they sell, what
  they buy, who they sell to), saved as project context (`.syrto/` files) where a writable project
  exists. Use when the user asks to set up, configure, personalise or update Syrto: "configura
  Syrto", "setup Syrto", "set up Syrto", "onboarding Syrto", "personalizza le risposte", "tara le
  risposte su di me", "aggiorna il mio profilo", "update my profile". Not a prerequisite: other
  Syrto skills proceed with defaults when context is thin, so do not run this before answering a
  direct data question.
---

# Syrto Onboarding & Proficiency Calibration

This is the foundational layer under every Syrto skill. It answers two questions
once, then reuses the answers forever:

1. **Who is the user and what is their business?** (context layer)
2. **How technical and how deep should answers be?** (proficiency layer)

Both can live in **project-local context**, so future tasks in the same project start already
calibrated. Reuse that context instead of making the user repeat it.

> Converse in the user's language (Italian by default for Syrto users). Instructions
> below are for you; the quoted lines are ready-to-use Italian copy.

## Step 0 — Infer silently (no narration)

Silently gather what you already know and pre-fill it: the current conversation, existing
`.syrto/` files, project instructions, and connected context. Infer **company AND role**
(and anything else you can) — not just company.

Do not describe what you inferred or how ("no profile exists yet", "I can infer your company from
your email domain"): it reads as surveillance and adds nothing. Either you know a field and use it,
or you ask for it. If the profile already exists, show what is saved in one line and ask what to
change; stop there if nothing.

## Step 1 — Ask only what's genuinely missing (one line)

After Step 0's silent inference, most fields are usually already known — a returning user's role
and company may already be in project context.
Do not ask again for what you already know. One confirmation line is the exception, because the
saved profile drives every later answer:

- If company **and** role are known → open with a single friendly confirmation line, then
  continue based on the reply. Use the user's first name:
  > "Ciao [Nome], vedo che fai **[ruolo]** da **[Azienda]**, confermi? C'è altro che credi debba
  > sapere su di te prima di partire — es. il dipartimento se rilevante, o altre caratteristiche?"

  If they confirm (or add/correct something), fold it in and go to the overview (Step 4).
- If only the role is missing → one line: *"Qual è il tuo ruolo? (e, se rilevante, il dipartimento)"*
- If nothing is known → one line: *"In che azienda lavori, con che ruolo e — se rilevante — in che dipartimento?"*

Never write "so già X, mi manca solo Y" — just ask Y, plainly. Don't badger about department: if
it's unknown and not clearly relevant, leave it. Map what you have to the tags in
`references/proficiency-model.md` (sector ∈ {banking, corporate, consulting, marketing_agency,
insurance, law, corporate_finance}; function ∈ {analyst, sales, marketing, partner, c_level}).
If company or role is truly ambiguous, one light web check or one clarifying question — never
guess the sector.

## Step 2 — Derive the calibration silently

Using the matrix in `references/proficiency-model.md`, derive the user's
**financial literacy** (H/M/L) and **depth** (deep/concise). Department is NOT used here
— it belongs to the context layer. **Do not show the profiling result to the user.**
No "sei un profilo H·deep". Keep it internal. And **never describe the register/style you will
adopt** ("risponderò in modo chiaro e diretto, con i numeri che contano…") — stating the style
is itself revealing the profiling. Apply it silently.

## Step 3 — Persist as project context (silently)

Write to the three paths in `references/memory-and-capabilities.md` — `.syrto/profile.md`,
`.syrto/preferences.md`, `.syrto/commercial-context.md`. Resolve them from the active project
root. Read each existing file before writing, merge, and never blind-overwrite. Store the
derived literacy + depth AND a one-line behavior directive, so future sessions read the
calibration directly.

Do this **quietly** — do not narrate routine file plumbing. If no writable project is available,
keep the calibration in the current conversation and state briefly that persistent project context
was not saved.

## Step 4 — Capabilities overview (scannable, never a wall of text)

Show what the assistant can do, **relevant-to-profile first**, the rest under **"Altri spunti"**.
Format it to be skimmed — never a prose paragraph:

- a short intro line ("Cosa posso fare per te — in ordine di utilità per un ruolo [X]:");
- then **short bullets**, each a **bold action label** + a few words ("**Trova prospect** — aziende target da criteri, lookalike o CRM/file");
- **Altri spunti** as a **single line** of items separated by " · ".

Describe capabilities in plain terms (what they get), not by skill name; draw the ordering from
the relevance map in `references/memory-and-capabilities.md`. Keep the whole thing tight.

## Step 5 — Invite deeper business context

Explain that the more business context Syrto has, the better the answers — and that it
can be saved in the current project for reuse. Invite (do not force):

- the specific **products/services** they offer,
- what the company **buys** (inputs),
- **who they sell to** — the typical targets and their characteristics.

Distill whatever they give (typed or, for this step, pasted) into `.syrto/commercial-context.md`
per the schema. Merge into existing content; never overwrite blindly.

For activities that rely on targeted files or Excel/CRM exports, suggest keeping those inputs in
a dedicated project (a Codex project keeps its instructions, files and `.syrto/` context together;
a ChatGPT project keeps instructions and files). Mention
connected apps only when one is actually available; never claim that a CRM is connected without
checking.

## Always-on: apply the calibration

On every Syrto answer, apply the behavioral pattern from `references/proficiency-model.md`
that matches the stored literacy × depth, plus the sector overlay (which *goal* the
numbers should serve). **Precedence: an explicit instruction from another skill or from
the user overrides the profile.** The profile governs only tone, register, and how much
numeric depth and explanation to wrap around the content — not what content a skill
decides to include.

`core.md` §5 points every skill to this calibration, so it applies beyond onboarding. The rest of
the suite is governed by `{{ROOT}}/shared/core.md` (chat vs file, the visual canon and its override via
a user template saved to `.syrto/preferences.md`, context reuse, the SYRTO-HANDOFF format) and the
capability map, `{{ROOT}}/shared/syrto-reference.md`. Onboarding only sets the calibration and the
context; those layers do the rest.
