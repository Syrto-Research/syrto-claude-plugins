#!/usr/bin/env bun
/**
 * Build a platform's copy of the Syrto AI plugin from the canonical `content/` tree.
 *
 *   bun scripts/build.ts --platform claude            # writes plugins/syrto-ai-claude
 *   bun scripts/build.ts --platform openai --out DIR  # writes DIR/shared and DIR/skills
 *   add --check to compare instead of writing (exit 1 on any difference)
 *
 * Sources, in order of precedence:
 *   platforms/<p>/overrides/**  a whole file that differs per platform (replaces content/)
 *   content/**                  everything else, shared by every platform
 *   platforms/<p>/plugin/**     manifests, hooks, README: copied to the output root as is
 *
 * Markdown in content/ and overrides/ may use:
 *   {{ROOT}}                    the plugin root, as the platform can resolve it
 *   <!-- only:<p> --> ... <!-- /only -->   lines kept only for platform <p>
 *                                          (each marker alone on its line)
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, relative, resolve } from "node:path";

const REPO = resolve(import.meta.dir, "..");
const CONTENT = join(REPO, "content");
const PLATFORMS = ["claude", "openai"] as const;
type Platform = (typeof PLATFORMS)[number];

// The only output paths a build owns; anything else under --out is left alone.
const MANAGED = ["shared", "skills"];

// Platform-only strings that must not appear in shared content outside an only-block,
// so a Claude or ChatGPT detail cannot leak into the other platform's copy.
const PLATFORM_ONLY = [
  "${CLAUDE_PLUGIN_ROOT}",
  ".syrto/",
  "/areas/",
  "/profile.md",
  "/preferences.md",
  "$ARGUMENTS",
  "disable-model-invocation",
  "`xlsx`",
  "`spreadsheets`",
  "ask_user_input_v0",
];

const ONLY_OPEN = /^<!-- only:([a-z]+) -->$/;
const ONLY_CLOSE = "<!-- /only -->";

export function rootFor(platform: Platform, file: string): string {
  if (platform === "claude") return "${CLAUDE_PLUGIN_ROOT}";
  const up = posix.relative(posix.dirname(file), ".");
  return up === "" ? "." : up;
}

/** Keep the lines for `platform`, drop the others' only-blocks, and fail on bad markers. */
export function resolveBlocks(text: string, platform: Platform, file: string): string {
  const out: string[] = [];
  let open: string | null = null;
  text.split("\n").forEach((line, i) => {
    const marker = line.trim();
    const opening = marker.match(ONLY_OPEN);
    if (opening) {
      if (open) throw new Error(`${file}:${i + 1}: nested only-block`);
      if (!PLATFORMS.includes(opening[1] as Platform)) throw new Error(`${file}:${i + 1}: unknown platform "${opening[1]}"`);
      open = opening[1];
      return;
    }
    if (marker === ONLY_CLOSE) {
      if (!open) throw new Error(`${file}:${i + 1}: ${ONLY_CLOSE} without an opening marker`);
      open = null;
      return;
    }
    if (line.includes("<!-- only") || line.includes("<!-- /only")) {
      throw new Error(`${file}:${i + 1}: an only-block marker must be alone on its line`);
    }
    if (open === null || open === platform) out.push(line);
  });
  if (open) throw new Error(`${file}: only-block for "${open}" is never closed`);
  return out.join("\n");
}

export function render(text: string, platform: Platform, file: string): string {
  const body = resolveBlocks(text, platform, file).replaceAll("{{ROOT}}", rootFor(platform, file));
  const left = body.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error(`${file}: unknown token ${left[0]}`);
  return body;
}

function walk(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    if (name === "__pycache__" || name === ".DS_Store") return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full, base) : [relative(base, full).split("\\").join("/")];
  });
}

/** Shared content may not carry platform-only strings, or tool names outside the capability map. */
export function lint(content = CONTENT): string[] {
  const errors: string[] = [];
  const map = readFileSync(join(content, "shared/syrto-reference.md"), "utf8");
  const tools = [...new Set(map.match(/`(syrto_[a-z_]+)`/g)?.map((m) => m.slice(1, -1)) ?? [])];
  for (const file of walk(content).filter((f) => f.endsWith(".md"))) {
    // Strip every only-block so only the text all platforms share is checked.
    let inBlock = false;
    const shared = readFileSync(join(content, file), "utf8").split("\n").filter((line) => {
      const m = line.trim();
      if (ONLY_OPEN.test(m)) return (inBlock = true), false;
      if (m === ONLY_CLOSE) return (inBlock = false), false;
      return !inBlock;
    });
    shared.forEach((line) => {
      for (const s of PLATFORM_ONLY) if (line.includes(s)) errors.push(`content/${file}: "${s}" outside an only-block`);
      if (file !== "shared/syrto-reference.md") {
        for (const t of tools) if (line.includes(t)) errors.push(`content/${file}: tool name ${t} outside the capability map`);
      }
    });
  }
  return errors;
}

function build(platform: Platform, out: string): void {
  const overrides = join(REPO, "platforms", platform, "overrides");
  const files = new Map<string, string>();
  for (const f of walk(CONTENT)) files.set(f, join(CONTENT, f));
  for (const f of walk(overrides)) files.set(f, join(overrides, f));
  for (const [file, src] of [...files].sort()) {
    if (!MANAGED.some((m) => file.startsWith(`${m}/`))) throw new Error(`${file}: outside ${MANAGED.join(", ")}`);
    const dest = join(out, file);
    mkdirSync(dirname(dest), { recursive: true });
    if (file.endsWith(".md")) writeFileSync(dest, render(readFileSync(src, "utf8"), platform, file));
    else cpSync(src, dest);
  }
  const plugin = join(REPO, "platforms", platform, "plugin");
  if (existsSync(plugin)) cpSync(plugin, out, { recursive: true });
}

/** Every generated file must match; under the managed paths, nothing extra may exist. */
function diff(expected: string, actual: string): string[] {
  const want = new Set(walk(expected));
  const have = new Set(walk(actual).filter((f) => MANAGED.some((m) => f.startsWith(`${m}/`)) || want.has(f)));
  const problems: string[] = [];
  for (const f of want) {
    if (!have.has(f)) problems.push(`missing: ${f}`);
    else if (!readFileSync(join(expected, f)).equals(readFileSync(join(actual, f)))) problems.push(`differs: ${f}`);
  }
  for (const f of have) if (!want.has(f)) problems.push(`not generated: ${f}`);
  return problems;
}

function main(): number {
  const args = process.argv.slice(2);
  const opt = (name: string) => {
    const i = args.indexOf(name);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const platform = opt("--platform") as Platform | undefined;
  if (!platform || !PLATFORMS.includes(platform)) {
    console.error(`usage: bun scripts/build.ts --platform ${PLATFORMS.join("|")} [--out DIR] [--check]`);
    return 2;
  }
  const out = resolve(opt("--out") ?? (platform === "claude" ? join(REPO, "plugins/syrto-ai-claude") : ""));
  if (!opt("--out") && platform !== "claude") {
    console.error("--out is required for this platform");
    return 2;
  }

  const errors = lint();
  if (errors.length) {
    console.error(errors.join("\n"));
    return 1;
  }

  if (args.includes("--check")) {
    const tmp = mkdtempSync(join(tmpdir(), "syrto-build-"));
    try {
      build(platform, tmp);
      const problems = diff(tmp, out);
      if (problems.length) {
        console.error(`${relative(process.cwd(), out) || "."} is out of date with content/ (run the build without --check):`);
        console.error(problems.map((p) => `  ${p}`).join("\n"));
        return 1;
      }
      console.log(`${platform}: up to date`);
      return 0;
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }

  for (const m of MANAGED) rmSync(join(out, m), { recursive: true, force: true });
  build(platform, out);
  console.log(`${platform}: built ${relative(process.cwd(), out) || "."}`);
  return 0;
}

if (import.meta.main) process.exit(main());
