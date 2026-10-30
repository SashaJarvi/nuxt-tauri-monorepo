# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a starter template: a pnpm/Turborepo monorepo deploying **one Nuxt 4 codebase** to web, desktop (Tauri 2), and mobile (iOS/Android via Tauri 2). All apps extend a shared Nuxt layer (`packages/ui`) that provides components, composables, types, schemas, and server API routes.

`ExampleView.vue` (rendered by both `apps/web/app/app.vue` and `apps/native/app/app.vue`) is a minimal reference feature exercising every layer — platform detection, a shared Zod-validated API route, and a native Rust command. Delete it and follow the same pattern when building a real feature. New consumers of this template run `pnpm rename` first (see README.md) to set their own app name and bundle identifier.

## Architecture

### The shared layer is the app

`packages/ui` is a [Nuxt layer](https://nuxt.com/docs/getting-started/layers), not a component library consumed via imports — `apps/web` and `apps/native` both do `extends: ["@repo/ui"]` in their `nuxt.config.ts`. This means most feature code (components, composables, server API routes, styles) lives in `packages/ui` and is auto-imported/merged into both apps automatically. The two apps' own directories are thin: `app/app.vue` plus app-specific `nuxt.config.ts` overrides (SSR toggle, runtime config, dev server settings, CORS rules).

When adding a feature that should work on both web and native, put it in `packages/ui`, not in an individual app.

### Platform detection drives request behavior, not routing

There's a single set of composables in `packages/ui/app/composables` that both apps use identically; behavior branches at runtime instead of via separate codepaths:

- `usePlatform()` — module-level singleton refs (`isTauri`, `isWeb`, `isDesktop`, `isMobile`). Tauri is detected synchronously on first call by checking `window.__TAURI_INTERNALS__`/`__TAURI__`, because `useApi()` needs that value immediately to pick a base URL. Desktop vs. mobile is resolved async afterward via `@tauri-apps/plugin-os`.
- `useApi()` — the HTTP client every feature should call through. Web builds use relative URLs against the shared server routes (same-origin, SSR-capable). Native builds use `@tauri-apps/plugin-http`'s `fetch` (not the browser `fetch` — required for iOS) against an absolute `apiBaseUrl`, and read the response via `.text()` + `JSON.parse()` rather than `.json()` as a workaround for a Tauri iOS streaming bug.
- `useTauri()` — wraps `invoke()` for calling Rust commands and `openUrl()`, both of which no-op/fallback gracefully when not running under Tauri.

### Server routes are shared, called differently per platform

API routes live only in `packages/ui/server/api/` (e.g. `health.get.ts`, `example.post.ts`) and are inherited by both apps via the Nuxt layer. `apps/web` serves and calls them same-origin. `apps/native` has `ssr: false` (required for Tauri) and no server of its own — it calls the web app's server routes over the network through `useApi()`, which is why the web dev server must be running for native/mobile dev, and why `apps/web/nuxt.config.ts` adds explicit CORS `routeRules` for `/api/**`.

Response shape is standardized via `createSuccessResponse`/`createErrorResponse` in `packages/ui/app/utils/api.ts` and the `ApiResult<T>` type — new routes should follow this convention. Request bodies are validated with Zod schemas in `packages/ui/app/schemas/`.

### Rust/Tauri side

`apps/native/src-tauri` is a standard Tauri 2 project. `src/lib.rs` registers plugins (`tauri-plugin-http`, `tauri-plugin-opener`) and Tauri commands via `invoke_handler!`; add new native-only commands there and call them from the frontend via `useTauri().invoke()`. Permissions for what the frontend is allowed to call (including which HTTP hosts `plugin-http` may fetch) are declared in `apps/native/src-tauri/capabilities/default.json` — new allowed API hosts must be added there.

`tauri-plugin-http` is pinned to `=2.8.3` (exact version) in `Cargo.toml` due to a known streaming bug in newer versions; don't loosen this pin without checking upstream fixes. Rust crate versions for Tauri packages should stay aligned with the npm `@tauri-apps/*` versions in the pnpm catalog.

The iOS/Android platform projects under `apps/native/src-tauri/gen/` are gitignored, not committed — they're regenerated per-developer via `pnpm tauri ios init` / `pnpm tauri android init` so per-developer signing config (Apple Team ID, etc.) never ends up in git.

### Dependency versioning via pnpm catalog

Shared dependency versions are centralized in `pnpm-workspace.yaml` under `catalog:` and referenced from package.json files as `"nuxt": "catalog:"`. When bumping a shared dependency (Nuxt, Vue, Tauri packages, Tailwind, etc.), update the catalog entry in `pnpm-workspace.yaml` rather than individual package.json files.

`pnpm-workspace.yaml` also enforces supply-chain hardening: `minimumReleaseAge: 10080` (packages must be published ≥1 week before they can be installed) and `onlyBuiltDependencies` allowlists which packages may run install/postinstall scripts. New deps requiring native builds/postinstall scripts must be added to that allowlist explicitly.

### UI components

`packages/ui/app/components/ui/` holds shadcn-vue-style primitives (Button, Card, Textarea, etc.) added via `pnpm shadcn add <component>`; `components/views/` holds composed feature views (e.g. `ExampleView.vue`). Both directories are registered with `pathPrefix: false` in the layer's `nuxt.config.ts`, so components are auto-imported by bare name across both apps. Styling is Tailwind CSS v4 plus Nuxt UI, with `class-variance-authority`/`tailwind-merge`/`clsx` for variant styling (see `packages/ui/app/lib/utils.ts`'s `cn()` helper).

### ESLint config

Both apps consume `packages/eslint-config-custom`, itself built on `@vercel/style-guide` and `@vue/eslint-config-typescript` (see `vue.js`). `apps/web` further wires this through Nuxt's generated `.nuxt/eslint.config.mjs` (`eslint.config.mjs`). Notable overridden rules: `import/no-default-export` and `vue/multi-word-component-names` are both off.
