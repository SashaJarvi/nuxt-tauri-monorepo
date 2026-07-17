# Nuxt 4 + Tauri 2 Monorepo

A production-ready monorepo template for building cross-platform applications with **Nuxt 4** and **Tauri 2**. Deploy to web, desktop (Windows, macOS, Linux), and mobile (iOS, Android) from a single codebase.

## Features

- **Nuxt 4** with Vue 3 Composition API
- **Tauri 2** for desktop and mobile builds
- **Turborepo** for efficient monorepo management
- **pnpm Catalogs** for centralized dependency versioning
- **Shared UI Layer** with auto-imported components
- **Nuxt UI** component library with Tailwind CSS v4
- **shadcn-vue** style components (Button, Card, Textarea, etc.)
- **Shared Server Routes** across web and native apps
- **Text Analysis Feature** with NLP-powered sentiment analysis

## Project Structure

```
nuxt-tauri-monorepo/
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
│   │   │   │   └── views/      # Feature views (AnalyzeTextView)
│   │   │   ├── composables/    # Shared composables
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── schemas/        # Zod validation schemas
│   │   │   └── assets/css/     # Global styles
│   │   ├── server/api/         # Shared API routes
│   │   └── nuxt.config.ts
│   ├── eslint-config-custom/   # Shared ESLint configuration
│   └── tsconfig/               # Shared TypeScript configuration
├── pnpm-workspace.yaml         # Workspace config with catalogs
├── turbo.json                  # Turborepo configuration
└── package.json                # Root scripts
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) >= 9.15.0
- [Rust](https://rustup.rs/) (for Tauri builds)

### For Mobile Development

- **iOS**: Xcode with iOS SDK
- **Android**: Android Studio with Android SDK

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nuxt-tauri-monorepo

# Install dependencies
pnpm install
```

### Development

```bash
# Start web app
pnpm dev:web

# Start native desktop app (requires web server running)
pnpm dev:native

# Start Android app
pnpm dev:android

# Start iOS app
pnpm dev:ios
```

### Building

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

| Technology | Version | Purpose |
|------------|---------|---------|
| Nuxt | 4.1.2 | Vue meta-framework |
| Vue | 3.5.13 | Frontend framework |
| Tauri | 2.x | Desktop/mobile runtime |
| Tailwind CSS | 4.x | Utility-first CSS |
| Nuxt UI | 4.x | Component library |
| TypeScript | 5.7.2 | Type safety |
| Zod | 3.24.0 | Schema validation |
| natural | 8.0.1 | NLP text analysis |
| Turborepo | 2.5.8 | Monorepo tooling |

## Shared UI Layer

The `packages/ui` package is a Nuxt layer that provides shared functionality across all apps:

### Components

- **UI Primitives**: Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Textarea
- **Views**: AnalyzeTextView (text analysis feature)

### Composables

- `usePlatform()` - Detect runtime platform (web/Tauri)
- `useApi()` - Unified API client for web and native
- `useTauri()` - Tauri-specific utilities

### Server Routes

- `GET /api/health` - Health check endpoint
- `POST /api/example` - Example POST endpoint
- `POST /api/text-analysis` - Text analysis with NLP

## pnpm Catalogs

Dependencies are managed centrally via pnpm catalogs in `pnpm-workspace.yaml`:

```yaml
catalog:
  nuxt: "^4.1.2"
  vue: "^3.5.13"
  tailwindcss: "^4.1.14"
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
| `pnpm format` | Format code with Prettier |
| `pnpm shadcn` | Add shadcn-vue components |

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
environment or in a git-ignored `apps/native/.env`:

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
1. Open the project in Xcode: `apps/native/src-tauri/gen/apple/native.xcodeproj`
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
- **Plugin Version**: Using `tauri-plugin-http@2.3.0` due to a streaming bug in newer versions

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

## License

MIT
