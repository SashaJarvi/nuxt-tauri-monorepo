import type { ApiResult } from "../types/api";
import type { TextAnalysisResult } from "../types/text-analysis";

// Native (Tauri) computes locally via the Rust `analyze_text` command; web uses the
// shared HTTP API route. useTauri()/useApi() are auto-imported by the Nuxt layer.
export function useTextAnalysis() {
  const { isTauri, invoke } = useTauri();
  const { post } = useApi();

  async function analyze(text: string): Promise<ApiResult<TextAnalysisResult>> {
    if (isTauri.value) {
      try {
        const data = await invoke<TextAnalysisResult>("analyze_text", { text });
        return { success: true, data: data as TextAnalysisResult };
      } catch (err) {
        return {
          success: false,
          error: {
            code: "NATIVE_ERROR",
            message: err instanceof Error ? err.message : String(err),
          },
        };
      }
    }
    return post<TextAnalysisResult>("/api/text-analysis", { text });
  }

  return { analyze };
}
