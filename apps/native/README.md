# apps/native

The Tauri 2 desktop/mobile app. Extends the shared `packages/ui` Nuxt layer via `extends: ["@repo/ui"]` in `nuxt.config.ts` — most feature code lives there, not here. Rust/Tauri backend lives under `src-tauri/`. See the root [README.md](../../README.md) for setup, scripts, iOS/Android instructions, and architecture.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
