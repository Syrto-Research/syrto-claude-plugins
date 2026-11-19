# Buyer List — Prioritization, Contact Mapping & Output

Reference for the `buyer-list` skill. Read this before finalizing tiers (Step 4), mapping contacts (Step 5) and building the deliverables (Step 6). All deliverables are in Italian.

---

### Step 4: Prioritization

By now every buyer already carries a *provisional* tier from its L1 screen (Step 2/3). This step confirms it: the L2 deep-dive done on Tier 1/2, outside-the-box, and deep-dive names may promote or demote a buyer, and any Tier 2/3 borderline should have been taken to L2 before finalizing. Rationale is the single most important input here. Tier 1/2 and outside-the-box buyers need a rationale that reflects the full framework from Step 2/3 (strategic fit, deal thesis, synergies, market position impact, integration logic, must-have vs. nice-to-have), confirmed financial capacity, and a clear ownership picture. Tier 3 buyers, screened at L1 only, need a grounded short rationale on what L1 shows (activity fit, size vs. target). A buyer without a grounded rationale doesn't belong on the list.

- **Tier 1 (5-10)**: Highest strategic fit, proven acquirers, clear rationale, confirmed financial capacity — contact first
- **Tier 2 (10-15)**: Good fit but less obvious, or financial capacity not fully confirmed — contact in second wave
- **Tier 3 (10-20)**: Possible but lower probability — contact if process needs broadening

**"Fuori dagli schemi" is a cross-cutting flag, not a tier.** An outside-the-box buyer can land in Tier 1, 2 or 3 depending on genuine fit and capacity — do not automatically demote every non-obvious name to Tier 3. Tag it as "Fuori dagli schemi: Sì" alongside its tier, and make sure every output (Excel and HTML) visually distinguishes these names (a distinct badge/color, and a dedicated call-out section) so they don't get lost among the more obvious direct-competitor names.


### Step 5: Contact Mapping

For each Tier 1 buyer:
- Key decision maker (CEO, Corp Dev head, Partner) — informed by the UBO/ownership work in Step 2/3 (who actually has authority to decide). For an Italian company, take name and role from its ownership structure in Syrto (board and CEO); for a fund, from its website. Record name and role only: this suite never buys contact details.
- Relationship status (existing relationship, cold outreach, need introduction)
- Known preferences or constraints (size, geography, structure)
- Best approach channel


### Step 6: Output — all in Italian

Produce three deliverables with deliberately different levels of depth: the Excel is a scanning tool, the HTML buyer book is the narrative deliverable, and the deep-dive focuses on four names. **Every label, header, tier name and piece of rationale text in every deliverable must be written in Italian.** **Le deliverable HTML (buyer book e deep-dive) e l'Excel si producono secondo le regole di output di `${CLAUDE_PLUGIN_ROOT}/shared/core.md` §5** (canone visivo, capacità di fogli di calcolo del client per l'Excel, offerta del PDF, digest in chat): i contenuti e la struttura descritti qui sotto restano invariati, non costruire un HTML con stile proprio. L'Excel resta lo strumento di scanning.

**1. Excel workbook — keep it simple.** This is a quick-scan tool, not the analysis itself:
- Buyers divided by type (Acquirenti Strategici / Fondi Finanziari)
- Organized in tiers within each type, with a clearly visible "Fuori dagli schemi" flag/column
- One-line rationale (the "razionale dell'operazione" sentence — not the full six-part framework)
- Key financials only, sourced from Syrto: fatturato, EBITDA, dimensione vs. target (strategics) or dimensione fondo / dry powder (sponsors)
- Summary tab: buyer counts by tier and by type (including a count of outside-the-box names), implied valuation range from Step 1
- Contact mapping tab for Tier 1
- Do not dump the full ownership/rationale framework detail into Excel — that belongs in the HTML

**2. HTML buyer book — the complete version, for every buyer on the list:**
- A clean, graphic, tiered overview of the full buyer list (strategic + financial), in Italian
- A dedicated, visually distinct section or set of callouts for "Buyer fuori dagli schemi" so a reader can find these without having to hunt through every card
- For every Tier 1/2 and outside-the-box buyer: the full rationale framework (all six elements), ownership structure summary (UBO, ownership type, listed Y/N — from Syrto for Italian entities, listed status from the legal form plus a web check), and financial capacity metrics (from Syrto for Italian entities). For Tier 3 buyers: the L1 read and the short rationale, with the deeper fields marked "non approfondito (Tier 3)". This is what makes the HTML more complete than the Excel.
- Enriched with additional Syrto data where useful (sector positioning, size comparison, each buyer against its automatic benchmark from the financial analysis, the thematic spider profile; the positioning radar can place the target and its buyers side by side)

**3. Deep-dive page — HTML only, for the best 2 strategic buyers and best 2 financial sponsors.** At least one of the four should be an outside-the-box name where the research supports it — don't default to the two most obvious direct competitors if a non-obvious name has a genuinely strong, well-evidenced case. Write this as if the seller has already read the full list and picked these 4 names to focus on, and now wants to know everything about them, in Italian:
- Full rationale (all six framework elements, in detail, not summarized)
- Full financial profile: fatturato, EBITDA, cassa, indebitamento netto/leva, andamento pluriennale — from Syrto for Italian entities
- Efficiencies and inefficiencies: margini, efficienza del capitale, struttura dei costi, qualsiasi elemento che Syrto segnali come anomalo rispetto al settore
- Performance vs. the market: come crescita/profittabilità del buyer si confrontano con il benchmark automatico di Syrto (aziende della stessa classe di attività e fascia dimensionale nella sua macro-area) e con il suo profilo tematico spider
- Business model description (from Syrto + website)
- Potential synergies in detail (not just listed — explained, with rough magnitude if estimable)
- Ownership structure and UBO, and listed-company status (from Syrto for Italian entities; listed status from the legal form plus a web check)
- For strategic buyers: an explicit health/capacity check confirming the buyer is financially healthy and actually able to fund and execute the acquisition (leverage, cash position, recent M&A activity) — not just a good rationale fit
- For financial sponsors: fund capacity, portfolio fit, and why each ranks above the other sponsors on the list
- Integration logic and must-have-vs-nice-to-have conclusion, stated plainly
