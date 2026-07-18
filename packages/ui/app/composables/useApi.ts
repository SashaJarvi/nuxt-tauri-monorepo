import type { ApiResult } from "../types/api";

export function useApi() {
  const config = useRuntimeConfig();
  const { isTauri } = usePlatform();

  // Web app uses relative URLs, native uses absolute
  const baseUrl = computed(() =>
    isTauri.value ? (config.public.apiBaseUrl as string) || "" : ""
  );

  async function request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResult<T>> {
    try {
      // Use Tauri HTTP plugin for native apps, browser fetch for web
      let fetchFn: typeof fetch = fetch;
      if (isTauri.value) {
        const { fetch: tauriFetch } = await import("@tauri-apps/plugin-http");
        fetchFn = tauriFetch;
      }

      const response = await fetchFn(`${baseUrl.value}${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
      });

      // Use text() + JSON.parse() as workaround for Tauri iOS streaming issue
      const text = await response.text();
      const data = JSON.parse(text);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: "HTTP_ERROR",
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }

      return { success: true, data: data.data ?? data };
    } catch (err) {
      console.error("[useApi] Error:", err);
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: err instanceof Error ? err.message : String(err),
        },
      };
    }
  }

  return {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
  };
}
