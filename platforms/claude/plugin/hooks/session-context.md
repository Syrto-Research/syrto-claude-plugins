Syrto AI plugin: session note. It applies only to tasks about Italian companies or Syrto data;
ignore it for everything else.

- The suite's method, scoring, output and context rules are in this plugin's `shared/core.md`, and
  the capability map (which Syrto tool does what) in `shared/syrto-reference.md`. The Syrto skills
  load both.
- The user's profile, preferences and commercial context: where they live is in `core.md` §3 (the
  Claude app's memory, else `.syrto/` files in the project, else the conversation only). Read what
  the task needs and do not re-ask for what is already there.
- Thin or missing context is not a blocker: proceed with sensible defaults and say which you
  assumed. Run `syrto-onboarding` only when the user asks to set up or update their profile.
