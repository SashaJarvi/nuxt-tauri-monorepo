// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],

  css: ["@repo/ui/app/assets/css/globals.css"],

  components: [{ path: "./app/components", pathPrefix: false }],

  imports: {
    dirs: ["./app/composables"],
  },

  compatibilityDate: "2025-01-01",
});
