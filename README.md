# Nuxt 4 + Tauri 2 Starter

A starter template for building cross-platform applications with **Nuxt 4** and **Tauri 2**. Deploy one Nuxt codebase to web, desktop (Windows, macOS, Linux), and mobile (iOS, Android).

## Features

- **Nuxt 4** with Vue 3 Composition API
- **Tauri 2** for desktop and mobile builds
- **Turborepo** for efficient monorepo management
- **pnpm Catalogs** for centralized dependency versioning
- **Shared UI Layer** (`packages/ui`) — components, composables, server routes shared across web and native
- **Nuxt UI** component library with Tailwind CSS v4
- **shadcn-vue** style components (Button, Card, Textarea, etc.)
- **Example feature** wired end-to-end (Vue view → shared Zod-validated API route → native Rust command) so you can see how a real feature is structured before you build your own
- **`pnpm rename`** script to make this your own app in one step
- **GitHub Actions CI** (lint, type-check, web build, `cargo check`)

## Using this template

1. Click **"Use this template"** on GitHub (or `git clone` this repo and remove its git history yourself).
2. `corepack enable` (this repo pins an exact pnpm version via `packageManager` in `package.json`).
3. `pnpm install` (if this fails with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, see [Supply-chain hardening](#supply-chain-hardening))
4. `pnpm rename` — prompts for your app's display name and bundle identifier (e.g. `com.acme.myapp`) and updates `tauri.conf.json`, the native app title, and the root package name. To skip the prompts, pass them as flags: `pnpm rename --name "My App" --id com.acme.myapp`.
5. Replace the app icon: `pnpm tauri icon path/to/icon.png` (1024x1024 PNG recommended).
6. Update the copyright holder in `LICENSE`.
7. Delete or replace the example feature (see [Example feature](#example-feature)) and start building.

## Project Structure

```
├── apps/
│   ├── web/                    # Nuxt 4 web application
│   │   └── app/
│   │       └── app.vue
│   └── native/                 # Nuxt 4 + Tauri 2 native application
│       ├── app/
│       │   └── app.vue
│       └── src-tauri/          # Tauri Rust backend
│           ├── src/
│           ├── Cargo.toml
│           └── tauri.conf.json
├── packages/
│   ├── ui/                     # Shared Nuxt layer
│   │   ├── app/
│   │   │   ├── components/     # Shared Vue components
│   │   │   │   ├── ui/         # UI primitives (Button, Card, etc.)
│   │   │   │   └── views/      # Feature views (ExampleView)
│   │   │   ├── composables/    # Shared composables
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── schemas/        # Zod validation schemas
│   │   │   └── assets/css/     # Global styles
│   │   ├── server/api/         # Shared API routes
│   │   └── nuxt.config.ts
│   ├── eslint-config-custom/   # Shared ESLint configuration
│   └── tsconfig/               # Shared TypeScript configuration
├── scripts/
│   └── rename.mjs              # `pnpm rename` — see Using this template
├── pnpm-workspace.yaml         # Workspace config with catalogs
├── turbo.json                  # Turborepo configuration
└── package.json                # Root scripts
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) managed via corepack — see `packageManager` in `package.json`
- [Rust](https://rustup.rs/) (for Tauri builds)

### For Mobile Development

- **iOS**: Xcode with iOS SDK
- **Android**: Android Studio with Android SDK

The platform projects under `apps/native/src-tauri/gen/` are generated, not committed. Before your first iOS or Android run:

```bash
pnpm tauri ios init
pnpm tauri android init
```

## Development

```bash
# Start web app
pnpm dev:web

# Start native desktop app (requires web server running)
pnpm dev:native

# Start Android app (requires web server running)
pnpm dev:android

# Start iOS app (requires web server running)
pnpm dev:ios
```

## Building

```bash
# Build web app
pnpm build:web

# Build native desktop app
pnpm build:native

# Build Android app
pnpm build:android

# Build iOS app
pnpm build:ios
```

## Key Technologies

Exact versions are centralized in the `catalog:` section of `pnpm-workspace.yaml` — check there for what's currently pinned.

| Technology | Purpose |
|------------|---------|
| Nuxt 4 | Vue meta-framework |
| Vue 3 | Frontend framework |
| Tauri 2 | Desktop/mobile runtime |
| Tailwind CSS 4 | Utility-first CSS |
| Nuxt UI | Component library |
| TypeScript | Type safety |
| Zod | Schema validation |
| Turborepo | Monorepo tooling |

## Shared UI Layer

The `packages/ui` package is a Nuxt layer that provides shared functionality across all apps:

### Components

- **UI Primitives**: Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Textarea
- **Views**: ExampleView (see [Example feature](#example-feature))

### Composables

- `usePlatform()` — detect runtime platform (web / Tauri desktop / Tauri mobile)
- `useApi()` — unified HTTP client for web and native
- `useTauri()` — wraps Tauri's `invoke()` and `openUrl()`

### Server Routes

- `GET /api/health` — health check endpoint
- `POST /api/example` — example POST endpoint, used by the example feature

## Example feature

`ExampleView.vue` (rendered by both `apps/web/app/app.vue` and `apps/native/app/app.vue`) is a minimal, working reference for how a feature is wired through every layer of this template:

- **Platform detection** — `usePlatform()` renders which environment the app is running in.
- **Shared API route** — a form posts to `/api/example` (`packages/ui/server/api/example.post.ts`) via `useApi()`, validated on the server with the Zod schema in `packages/ui/app/schemas/api.ts`. This route runs identically on web (same-origin) and native (over HTTP via `useApi()`).
- **Native Rust command** — a button invokes the `greet` Tauri command (`apps/native/src-tauri/src/lib.rs`) via `useTauri().invoke()`. Only shown when running under Tauri.

When you're ready to build your own feature, delete `ExampleView.vue` and follow the same pattern: put shared code in `packages/ui`, add server routes under `packages/ui/server/api/`, and add native-only Rust commands in `apps/native/src-tauri/src/lib.rs`.

## pnpm Catalogs

Dependencies are managed centrally via pnpm catalogs in `pnpm-workspace.yaml`:

```yaml
catalog:
  nuxt: "^4.4.8"
  vue: "^3.5.13"
  tailwindcss: "^4.3.3"
  # ... more dependencies
```

Use in package.json:

```json
{
  "dependencies": {
    "nuxt": "catalog:"
  }
}
```

### Supply-chain hardening

`pnpm-workspace.yaml` sets `minimumReleaseAge: 10080`, so pnpm refuses to install any package version published less than a week ago. This mitigates compromised-release attacks, but has a side effect: **a plain `pnpm install` can fail** with `ERR_PNPM_NO_MATURE_MATCHING_VERSION` when a catalog range resolves to a version that's only a few days old.

When that happens you have three options:

- `pnpm install --frozen-lockfile` — installs exactly what's in the committed `pnpm-lock.yaml` without re-resolving (this is what CI uses, and it's the recommended path).
- Wait for the flagged version to age past the one-week window, then `pnpm install`.
- Add the specific package to [`minimumReleaseAgeExclude`](https://pnpm.io/settings#minimumreleaseageexclude) if you consciously accept a fresh release.

`onlyBuiltDependencies` similarly allowlists which packages may run install/postinstall scripts — add new native-build deps there explicitly.

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:web` | Start web app only |
| `pnpm dev:native` | Start native desktop app |
| `pnpm dev:android` | Start Android app |
| `pnpm dev:ios` | Start iOS app |
| `pnpm build` | Build all apps |
| `pnpm build:web` | Build web app |
| `pnpm build:native` | Build native desktop app |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm check-types` | Type-check all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm shadcn` | Add shadcn-vue components |
| `pnpm rename` | Rename this template into your own app |

## Adding New Components

Use shadcn-vue to add new UI components:

```bash
pnpm shadcn add <component-name>
```

Components are added to `packages/ui/app/components/ui/`.

## iOS Development

### Prerequisites

1. **Xcode** with iOS SDK installed
2. **iOS device** connected via USB (or simulator)
3. **Apple Developer account** (free account works for development)
4. Run `pnpm tauri ios init` once to generate `apps/native/src-tauri/gen/apple/`

### First-Time Setup

When running `pnpm dev:ios` for the first time, you need to configure your iOS device:

#### 1. Trust Developer Certificate

On your iOS device:
1. Go to **Settings** → **General** → **VPN & Device Management**
2. Find your developer certificate under "Developer App"
3. Tap it and select **Trust**

#### 2. Grant Local Network Permission

When the app launches, iOS will prompt for local network access. Tap **Allow**.

If you missed the prompt:
1. Go to **Settings** → **Privacy & Security** → **Local Network**
2. Find the app and enable the toggle

### Environment Configuration

The iOS app needs to connect to your development server over the network. This is
handled automatically: `pnpm dev:ios` (and `pnpm dev:android`) run through
`apps/native/scripts/dev-host.mjs`, which detects your machine's current LAN IP and
sets `NUXT_PUBLIC_API_BASE_URL=http://<lan-ip>:3000` for the app — no manual setup
needed. (Desktop `pnpm dev:native` uses the `localhost:3000` default.)

To override the base URL explicitly, set `NUXT_PUBLIC_API_BASE_URL` in your
environment or in a git-ignored `apps/native/.env` (see `apps/native/.env.example`):

```bash
# apps/native/.env
NUXT_PUBLIC_API_BASE_URL=http://<your-local-ip>:3000
```

Find your local IP:
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

### Running iOS Development

```bash
# Terminal 1: Start the web server (required for API)
pnpm dev:web

# Terminal 2: Start the iOS app
pnpm dev:ios
```

### Viewing Logs

To debug the iOS app, use Xcode's console or Safari's Web Inspector:

#### Safari Web Inspector
1. On your Mac, open **Safari** → **Settings** → **Advanced** → Enable "Show Develop menu"
2. On your iOS device, go to **Settings** → **Safari** → **Advanced** → Enable "Web Inspector"
3. Connect your device via USB
4. In Safari on Mac, go to **Develop** → **[Your Device]** → **[Your App]**

#### Xcode Console
1. Open the project in Xcode: the `.xcodeproj` under `apps/native/src-tauri/gen/apple/`
2. Run the app from Xcode
3. View logs in the Debug area (⇧⌘Y)

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Untrusted Developer" error | Trust certificate in Settings → General → VPN & Device Management |
| App can't connect to server | Ensure device is on the same network; check the `[dev-host] Using API base URL` line printed on startup matches your host IP |
| "Local Network" permission denied | Enable in Settings → Privacy & Security → Local Network |
| API requests timeout | Verify web server is running with `pnpm dev:web` |
| `isTauri` is false | Ensure you're running the Tauri build, not just Nuxt |

### Technical Notes

- **HTTP Plugin**: iOS Tauri apps use `@tauri-apps/plugin-http` for network requests (browser `fetch` doesn't work)
- **ATS Exceptions**: App Transport Security is configured to allow local HTTP connections
- **Plugin Version**: `tauri-plugin-http` is pinned to `=2.5.9` due to a streaming bug in newer versions — don't loosen this pin without checking upstream fixes

## Configuration

### Tauri Configuration

Edit `apps/native/src-tauri/tauri.conf.json` to configure:

- App name and identifier
- Window settings
- Build commands
- Bundle targets

### Nuxt Configuration

Each app extends the shared UI layer:

```typescript
// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  extends: ["@repo/ui"],
  // app-specific config
});
```

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`: ESLint, type-checking, and a web build in one job; `cargo check` (with a stub frontend build output, since Tauri needs `frontendDist` to exist at compile time) in another.

## License

MIT — update the copyright holder in `LICENSE` for your own project.
