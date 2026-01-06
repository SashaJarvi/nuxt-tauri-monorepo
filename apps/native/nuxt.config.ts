export default defineNuxtConfig({
  extends: ["@repo/ui"],

  app: {
    head: {
      title: "native",
      charset: "utf-8",
      viewport:
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      meta: [
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
      ],
    },
  },

  // SSR must be disabled for Tauri
  ssr: false,

  modules: ["@vueuse/nuxt"],

  // Runtime config for API base URL (native apps call web API)
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    },
  },

  vite: {
    // Prevent vite from obscuring rust errors
    clearScreen: false,
    // Tauri expects a fixed port, fail if that port is not available
    server: {
      strictPort: true,
    },
    // Environment variables with these prefixes will be exposed to the client
    envPrefix: ["VITE_", "TAURI_"],
  },

  // Avoids error [unhandledRejection] EMFILE: too many open files, watch
  ignore: ["**/src-tauri/**"],

  devServer: {
    host: "0.0.0.0", // Allow mobile device access
    port: 1420,
  },

  compatibilityDate: "2025-01-01",
});
