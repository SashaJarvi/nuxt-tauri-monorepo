// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],

  css: ["@repo/ui/app/assets/css/globals.css"],

  components: [
    { path: "./components/ui", pathPrefix: false },
    { path: "./components/views", pathPrefix: false },
  ],

  imports: {
    dirs: ["./composables"],
  },

  compatibilityDate: "2025-01-01",
});
