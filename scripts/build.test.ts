import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { lint, render, resolveBlocks, rootFor } from "./build";

describe("rootFor", () => {
  test("claude resolves the plugin root itself", () => {
    expect(rootFor("claude", "skills/a/SKILL.md")).toBe("${CLAUDE_PLUGIN_ROOT}");
  });
  test("openai gets a path relative to the file", () => {
    expect(rootFor("openai", "shared/core.md")).toBe("..");
    expect(rootFor("openai", "skills/a/SKILL.md")).toBe("../..");
    expect(rootFor("openai", "skills/a/references/b.md")).toBe("../../..");
  });
});

describe("resolveBlocks", () => {
  const text = ["shared", "<!-- only:claude -->", "for claude", "<!-- /only -->", "<!-- only:openai -->", "for openai", "<!-- /only -->", "end"].join("\n");
  test("keeps the platform's lines and drops the others", () => {
    expect(resolveBlocks(text, "claude", "f.md")).toBe("shared\nfor claude\nend");
    expect(resolveBlocks(text, "openai", "f.md")).toBe("shared\nfor openai\nend");
  });
  test("rejects an unclosed block", () => {
    expect(() => resolveBlocks("<!-- only:claude -->\nx", "claude", "f.md")).toThrow("never closed");
  });
  test("rejects an unknown platform", () => {
    expect(() => resolveBlocks("<!-- only:gemini -->\nx\n<!-- /only -->", "claude", "f.md")).toThrow("unknown platform");
  });
  test("rejects a marker that shares its line with text", () => {
    expect(() => resolveBlocks("see <!-- only:claude --> here", "claude", "f.md")).toThrow("alone on its line");
  });
});

describe("render", () => {
  test("substitutes the root token", () => {
    expect(render("read `{{ROOT}}/shared/core.md`", "openai", "skills/a/SKILL.md")).toBe("read `../../shared/core.md`");
  });
  test("fails on an unknown token", () => {
    expect(() => render("{{SHARED}}", "claude", "f.md")).toThrow("unknown token");
  });
});

describe("lint", () => {
  function tree(files: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), "syrto-lint-"));
    for (const [path, body] of Object.entries(files)) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), body);
    }
    return root;
  }
  const map = "| Resolve the company | `syrto_find_company` |";

  test("accepts platform strings inside an only-block", () => {
    const root = tree({
      "shared/syrto-reference.md": map,
      "skills/a/SKILL.md": "<!-- only:claude -->\nsee `${CLAUDE_PLUGIN_ROOT}`\n<!-- /only -->",
    });
    expect(lint(root)).toEqual([]);
  });
  test("flags platform strings in shared text", () => {
    const root = tree({ "shared/syrto-reference.md": map, "skills/a/SKILL.md": "save to `/preferences.md`" });
    expect(lint(root)).toEqual(['content/skills/a/SKILL.md: "/preferences.md" outside an only-block']);
  });
  test("flags a tool name outside the capability map", () => {
    const root = tree({ "shared/syrto-reference.md": map, "skills/a/SKILL.md": "call syrto_find_company" });
    expect(lint(root)).toEqual(["content/skills/a/SKILL.md: tool name syrto_find_company outside the capability map"]);
  });
});
