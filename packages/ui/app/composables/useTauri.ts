export function useTauri() {
  const { isTauri } = usePlatform();

  // Invoke a Tauri command
  async function invoke<T>(
    command: string,
    args?: Record<string, unknown>,
  ): Promise<T | null> {
    if (!isTauri.value) {
      console.warn(
        `Tauri command "${command}" called in non-Tauri environment`,
      );
      return null;
    }

    try {
      const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
      return await tauriInvoke<T>(command, args);
    } catch (err) {
      console.error(`Tauri command "${command}" failed:`, err);
      throw err;
    }
  }

  // Open a URL in the default browser
  async function openUrl(url: string): Promise<void> {
    if (!isTauri.value) {
      window.open(url, "_blank");
      return;
    }

    try {
      const { openUrl: tauriOpenUrl } = await import(
        "@tauri-apps/plugin-opener"
      );
      await tauriOpenUrl(url);
    } catch (err) {
      console.error("Failed to open URL:", err);
      // Fallback to window.open
      window.open(url, "_blank");
    }
  }

  return {
    isTauri,
    invoke,
    openUrl,
  };
}
