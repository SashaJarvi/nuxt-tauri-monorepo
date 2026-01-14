import {
  createSuccessResponse,
  createErrorResponse,
} from "../../app/utils/api";
import { textAnalysisRequestSchema } from "../../app/schemas/text-analysis";
import type { TextAnalysisResult } from "../../app/types/text-analysis";
import natural from "natural";

const tokenizer = new natural.WordTokenizer();
const analyzer = new natural.SentimentAnalyzer(
  "English",
  natural.PorterStemmer,
  "afinn"
);

function getMostFrequentWord(words: string[]): string | null {
  if (words.length === 0) return null;

  const frequency: Record<string, number> = {};
  for (const word of words) {
    const lower = word.toLowerCase();
    frequency[lower] = (frequency[lower] || 0) + 1;
  }

  let maxWord: string | null = null;
  let maxCount = 0;
  for (const [word, count] of Object.entries(frequency)) {
    if (count > maxCount) {
      maxCount = count;
      maxWord = word;
    }
  }

  return maxWord;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const result = textAnalysisRequestSchema.safeParse(body);
  if (!result.success) {
    return createErrorResponse(
      "VALIDATION_ERROR",
      "Invalid request body",
      result.error.flatten()
    );
  }

  const { text } = result.data;

  const words = tokenizer.tokenize(text) || [];
  const sentimentScore = analyzer.getSentiment(words);

  const analysisResult: TextAnalysisResult = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    analysis: {
      wordCount: words.length,
      charCount: text.length,
      mostFrequentWord: getMostFrequentWord(words),
      sentimentScore: sentimentScore,
    },
  };

  return createSuccessResponse(analysisResult);
});
