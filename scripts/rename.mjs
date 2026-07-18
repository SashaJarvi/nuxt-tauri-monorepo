#!/usr/bin/env node
// Renames this starter template: updates the app display name, package name,
// and Tauri bundle identifier across the files that need to agree with each
// other for `tauri dev` / `tauri build` (and iOS/Android init) to work.
//
// Interactive:     pnpm rename
// Non-interactive: pnpm rename --name "My App" --id com.acme.myapp

import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TAURI_CONF = path.join(rootDir, "apps/native/src-tauri/tauri.conf.json");
const NATIVE_NUXT_CONFIG = path.join(rootDir, "apps/native/nuxt.config.ts");
const ROOT_PACKAGE_JSON = path.join(rootDir, "package.json");

const BUNDLE_ID_RE = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/;

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateName(value) {
  return value.trim().length === 0 ? "Display name cannot be empty" : null;
}

function validateBundleId(value) {
  return BUNDLE_ID_RE.test(value.trim())
    ? null
    : "Must be reverse-DNS, e.g. com.acme.myapp";
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

// Parses `--name <value>` / `--id <value>` (and `--name=<value>` forms).
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const eq = arg.indexOf("=");
    if (arg.startsWith("--") && eq !== -1) {
      args[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else if (arg.startsWith("--")) {
      args[arg.slice(2)] = argv[(i += 1)];
    }
  }
  return args;
}

async function prompt(rl, question, validate) {
  for (;;) {
    const answer = (await rl.question(question)).trim();
    const error = validate(answer);
    if (!error) return answer;
    console.log(`  ✗ ${error}`);
  }
}

// Rewrites all files. Pure w.r.t. input — no prompting — so it's easy to test.
function applyRename(displayName, bundleId) {
  const packageName = slugify(displayName);
  const updated = [];

  // apps/native/src-tauri/tauri.conf.json
  const tauriConf = readJson(TAURI_CONF);
  tauriConf.productName = packageName;
  tauriConf.identifier = bundleId;
  tauriConf.app ??= {};
  tauriConf.app.windows ??= [{}];
  tauriConf.app.windows[0].title = displayName;
  writeJson(TAURI_CONF, tauriConf);
  updated.push(TAURI_CONF);

  // apps/native/nuxt.config.ts — head.title is a plain string literal
  const nuxtConfigSrc = readFileSync(NATIVE_NUXT_CONFIG, "utf8");
  const titleRe = /title:\s*(["'`]).*?\1/;
  if (titleRe.test(nuxtConfigSrc)) {
    writeFileSync(
      NATIVE_NUXT_CONFIG,
      nuxtConfigSrc.replace(titleRe, `title: "${displayName}"`),
    );
    updated.push(NATIVE_NUXT_CONFIG);
  } else {
    console.warn(
      `  ⚠ Could not find a "title:" field in ${path.relative(rootDir, NATIVE_NUXT_CONFIG)} — skipped`,
    );
  }

  // root package.json
  const rootPackageJson = readJson(ROOT_PACKAGE_JSON);
  rootPackageJson.name = packageName;
  writeJson(ROOT_PACKAGE_JSON, rootPackageJson);
  updated.push(ROOT_PACKAGE_JSON);

  return updated;
}

async function resolveInputs(args) {
  // Values supplied via flags: validate and use without prompting.
  if (args.name !== undefined || args.id !== undefined) {
    const nameError = validateName(args.name ?? "");
    const idError = validateBundleId(args.id ?? "");
    if (nameError || idError) {
      console.error(
        `Invalid arguments:${nameError ? `\n  --name: ${nameError}` : ""}${idError ? `\n  --id: ${idError}` : ""}`,
      );
      process.exit(1);
    }
    return { displayName: args.name.trim(), bundleId: args.id.trim() };
  }

  // Otherwise prompt interactively.
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const displayName = await prompt(
      rl,
      'App display name (e.g. "My App"): ',
      validateName,
    );
    const bundleId = await prompt(
      rl,
      'Bundle identifier, reverse-DNS (e.g. "com.acme.myapp"): ',
      validateBundleId,
    );
    return { displayName, bundleId };
  } finally {
    rl.close();
  }
}

async function main() {
  console.log("Nuxt + Tauri starter — rename\n");

  const { displayName, bundleId } = await resolveInputs(
    parseArgs(process.argv.slice(2)),
  );

  for (const file of applyRename(displayName, bundleId)) {
    console.log(`✓ Updated ${path.relative(rootDir, file)}`);
  }

  console.log("\nDone. Remaining manual steps:");
  console.log(
    "  1. Replace the app icon: pnpm tauri icon path/to/icon.png (1024x1024 PNG recommended)",
  );
  console.log("  2. Update the copyright holder in LICENSE");
  console.log("  3. If apps/native/src-tauri/gen/ was already generated, re-run:");
  console.log("       pnpm tauri ios init   (and/or pnpm tauri android init)");
  console.log("     so the platform projects pick up the new name/identifier.");
}

main();
