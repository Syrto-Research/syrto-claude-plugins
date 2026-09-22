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

```
claude plugin validate .
claude plugin validate plugins/syrto-ai-claude --strict
claude --plugin-dir plugins/syrto-ai-claude
```

Bump `version` in `plugins/syrto-ai-claude/.claude-plugin/plugin.json` with every release;
installed copies only update when the version changes.

## License

Proprietary, all rights reserved. See [LICENSE](LICENSE).
