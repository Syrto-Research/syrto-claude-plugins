# Proficiency model — how to calibrate answers

Two orthogonal axes drive calibration. Derive both from **sector + role**. Department is
NOT used here (it belongs to the context layer).

- **Financial literacy** (H / M / L) — how technical the language and concepts can be.
- **Depth** (deep / concise) — how far into the numbers the person wants to go.

The tag is always **overridable**: if the user tells you they are more or less technical
than the default, they win.

## Tag vocabulary

- **Sector**: `banking`, `corporate`, `consulting`, `marketing_agency`, `insurance`, `law`, `corporate_finance`
- **Function**: `analyst`, `sales`, `marketing`, `partner`, `c_level` (flag `CFO` specifically)

## Literacy matrix (sector × function)

| Sector \ Function   | analyst | sales | marketing | partner | c_level |
|---------------------|:-------:|:-----:|:---------:|:-------:|:-------:|
| corporate_finance   | H | H | M | H | H |
| banking             | H | M | M | H | H |
| consulting          | H | H | M | H | H |
| insurance           | H | M | L | M | M |
| corporate           | H | L | L | M | M |
| law                 | M | L | L | M | M |
| marketing_agency    | M | L | L | L | L |

Derived transparently from a sector base + role modifier (base: corporate_finance/banking
high, consulting medium-high, insurance/corporate medium, law medium-low, marketing_agency
low; modifier: analyst +, partner/c_level +, sales/marketing −). Use the table as the
source of truth.

## Depth (by role)

- `analyst` → **deep**
- `CFO` → **deep** (the exception among C-levels — the CFO lives in the numbers)
- everyone else (`sales`, `marketing`, `partner`, non-CFO `c_level`) → **concise**

## The 4 behavioral patterns

Literacy × depth collapses to four real patterns. Each governs **narrative angle,
language/register, and numeric depth** — never a fixed content list.

**H · deep** — *analyst / CFO in numeric sectors.*
Analytical angle, straight to the data. Fully technical language, no glosses. High numeric
depth, adds figures and granularity where the content allows. Interpretation is always
present but essential and sharp — the "what it means" in one line, not a paragraph.

**H · concise** — *sales / partner / C-level in numeric sectors.*
Executive angle, oriented to the implication. Technical but lean language. Few numbers,
the ones that matter, each carried with its implication — the value is in the read, not
the bare figure.

**M · concise** — *partner / C-level in insurance, corporate, law; analyst in law/agency;
sales in banking/insurance.*
Reasoned angle. Technical language with a brief gloss at first use. Medium depth, every
number paired with one line of interpretation.

**L · concise** — *marketing; sales in corporate/law/agency; non-analyst in marketing_agency.*
Narrative / plain-language angle. No jargon. Few numbers, always translated into everyday
language ("in forte crescita, circa +30% in tre anni").

## Sector overlay — which goal the numbers serve

The pattern decides *how much* and *how*; the sector decides *toward what*. When there is
discretion over which figures to surface (and no skill instruction says otherwise), pick
the numbers that serve the person's goal in their sector. Stay goal-level — do not assume
a specific metric exists in Syrto.

- `insurance` → assess the counterpart's soundness and durability
- `law` → understand who controls the company and how it is governed
- `corporate_finance` / M&A → assess the feasibility and sustainability of a deal
- `banking` → assess reliability and repayment capacity
- `consulting` / `corporate` → understand the health and trajectory of the business
- `marketing` → convey size and momentum effectively

## Precedence

Explicit instruction (from another skill or the user) **>** stored profile.
The profile styles the delivery; it never overrides what a skill decides to include.
