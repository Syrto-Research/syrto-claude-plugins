# Syrto AI plugins

Single source for the Syrto AI skills. `AGENTS.md` is a symlink to this file.

- Edit `content/`, `platforms/<platform>/overrides/` or `platforms/claude/plugin/`, never
  `plugins/syrto-ai-claude/` directly: it is generated, and CI fails when it drifts. Rebuild with
  `bun scripts/build.ts --platform claude`, then run `bun test scripts` and
  `claude plugin validate plugins/syrto-ai-claude --strict`.
- Skills name Syrto capabilities ("resolve the company", "the financial analysis"). Tool names and
  metric slugs live only in `content/shared/syrto-reference.md`; the build enforces the tool half.
- Keep platform differences inside `<!-- only:<platform> -->` blocks, or in an override when the
  whole file differs. Shared text must read correctly on Claude, ChatGPT and Codex.
- The sales team owns the method (scores, weights, tiers, steps, layouts). Fix what is wrong,
  contradictory or duplicated; raise method changes as questions on the pull request.
- Changes to `content/` reach the ChatGPT package only when `Syrto-Research/syrto-openai-plugin`
  syncs to a newer commit of this repo.
- Commits and PR titles follow Conventional Commits; PRs target `main`.
