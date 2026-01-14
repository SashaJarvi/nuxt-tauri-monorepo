import { z } from "zod";

export const textAnalysisRequestSchema = z.object({
  text: z
    .string()
    .min(1, "Text input cannot be empty")
    .max(10000, "Text input exceeds the maximum allowed length"),
});

export type TextAnalysisRequest = z.infer<typeof textAnalysisRequestSchema>;
