// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["@repo/ui"],

  modules: ["@nuxt/eslint"],

  // Enable CORS for native app API calls
  routeRules: {
    "/api/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  },

  // Allow access from other devices on the network (iOS, Android)
  devServer: {
    host: "0.0.0.0",
  },

  compatibilityDate: "2025-01-01",
  devtools: { enabled: true },
});
