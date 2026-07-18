// Shared state (singleton pattern) - ensures consistent state across all calls
const isWeb = ref(true);
const isDesktop = ref(false);
const isMobile = ref(false);
const isTauri = ref(false);
let initialized = false;

export function usePlatform() {
  // Synchronous Tauri detection (runs immediately on first call)
  // This is critical for useApi() to get the correct baseUrl
  // Tauri v2 uses __TAURI_INTERNALS__, v1 used __TAURI__
  if (!initialized && typeof window !== "undefined") {
    const hasTauri = "__TAURI__" in window || "__TAURI_INTERNALS__" in window;
    if (hasTauri) {
      isTauri.value = true;
      isWeb.value = false;
    }
    initialized = true;
  }

  // Async platform detection (mobile vs desktop) - requires plugin import
  onMounted(async () => {
    if (isTauri.value) {
      try {
        const { platform } = await import("@tauri-apps/plugin-os");
        const os = await platform();
        isMobile.value = os === "android" || os === "ios";
        isDesktop.value = !isMobile.value;
      } catch {
        // Fallback to desktop if plugin not available
        isDesktop.value = true;
      }
    }
  });

  return { isWeb, isDesktop, isMobile, isTauri };
}
