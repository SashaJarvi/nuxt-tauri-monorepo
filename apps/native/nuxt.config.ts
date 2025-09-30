export default defineNuxtConfig({
  app: {
    head: {
      title: "native",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },

  // SSR must be disabled for Tauri
  ssr: false,

  modules: ["@vueuse/nuxt"],

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
  ignore: ['**/src-tauri/**'],
  devServer: {
    host: "0",
    port: 1420,
  },

  compatibilityDate: "2025-01-01",
});
