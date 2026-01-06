export function usePlatform() {
  const isWeb = ref(true);
  const isDesktop = ref(false);
  const isMobile = ref(false);
  const isTauri = ref(false);

  onMounted(async () => {
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      isTauri.value = true;
      isWeb.value = false;

      try {
        // Detect mobile vs desktop via Tauri
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
