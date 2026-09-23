# Syrto plugins for Claude

Plugins that connect Claude to [Syrto](https://syrto.ai) financial data on Italian companies.

| Plugin | What it does |
|---|---|
| [`syrto-ai-claude`](plugins/syrto-ai-claude) | Sales & Marketing, M&A & Strategy, and Reporting skills over the Syrto MCP server |

## Install

In Claude Code:

```
/plugin marketplace add Syrto-Research/syrto-claude-plugins
/plugin install syrto-ai-claude@syrto
```

The plugin connects to `https://mcp.syrto.ai/mcp`. Sign in with your Syrto account: in Claude
Code, run `/mcp`, select the Syrto server and authenticate. Documentation: https://docs.syrto.ai

## Develop

This repo is the single source for the Syrto AI skills on every platform. `plugins/syrto-ai-claude`
is generated: edit the sources, then rebuild.

| Path | Holds |
|---|---|
| `content/` | Skills and shared files, identical on every platform |
| `platforms/claude/plugin/` | Claude manifest, MCP config, hooks and plugin README, copied as is |
| `platforms/<platform>/overrides/` | A whole file that differs per platform, replacing its `content/` copy |

Markdown in `content/` and `overrides/` can use `{{ROOT}}` for the plugin root, and
`<!-- only:claude -->` ... `<!-- /only -->` (or `only:openai`) around lines that belong to one
platform, each marker on its own line. The build rejects platform-only strings such as
`${CLAUDE_PLUGIN_ROOT}` or `.syrto/` outside those blocks, and Syrto tool names outside the
capability map (`content/shared/syrto-reference.md`).

```
bun scripts/build.ts --platform claude           # regenerate plugins/syrto-ai-claude
bun scripts/build.ts --platform claude --check   # what CI runs
bun test scripts
claude plugin validate plugins/syrto-ai-claude --strict
claude --plugin-dir plugins/syrto-ai-claude
```

The ChatGPT and Codex package (`Syrto-Research/syrto-openai-plugin`) builds its `shared/` and
`skills/` from this repo with `--platform openai`, pinned to a commit of this repo.

Bump `version` in `platforms/claude/plugin/.claude-plugin/plugin.json` with every release;
installed copies only update when the version changes.

## License

Proprietary, all rights reserved. See [LICENSE](LICENSE).
