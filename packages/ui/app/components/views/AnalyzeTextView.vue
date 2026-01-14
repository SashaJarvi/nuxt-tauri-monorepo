<script setup lang="ts">
import type { TextAnalysisResult } from "../../types/text-analysis";
import Card from "../ui/Card.vue";
import CardHeader from "../ui/CardHeader.vue";
import CardTitle from "../ui/CardTitle.vue";
import CardContent from "../ui/CardContent.vue";
import Textarea from "../ui/Textarea.vue";
import Button from "../ui/Button.vue";

const sourceText = ref("");
const isLoading = ref(false);
const result = ref<TextAnalysisResult | null>(null);
const error = ref<string | null>(null);

const { post } = useApi();

async function handleSubmit() {
  if (!sourceText.value.trim()) {
    error.value = "Please enter some text to analyze";
    return;
  }

  isLoading.value = true;
  error.value = null;

  const response = await post<TextAnalysisResult>("/api/text-analysis", {
    text: sourceText.value,
  });

  if (response.success) {
    result.value = response.data;
  } else {
    error.value = response.error.message;
  }

  isLoading.value = false;
}

function getSentimentText(score: number): string {
  if (score === 0) return "Neutral";
  return score > 0 ? "Positive" : "Negative";
}

function getSentimentColor(score: number): string {
  if (score === 0) return "text-muted-foreground";
  return score > 0 ? "text-green-600" : "text-red-600";
}
</script>

<template>
  <div class="container mx-auto max-w-2xl p-6">
    <Card>
      <CardHeader>
        <CardTitle>Text Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label for="source-text" class="block text-sm font-medium mb-2">
              Enter text to analyze
            </label>
            <Textarea
              id="source-text"
              v-model="sourceText"
              placeholder="Type or paste your text here..."
              rows="6"
              class="resize-none"
            />
          </div>

          <Button type="submit" :disabled="isLoading" class="w-full">
            {{ isLoading ? "Analyzing..." : "Analyze Text" }}
          </Button>

          <p v-if="error" class="text-sm text-red-600">
            {{ error }}
          </p>
        </form>
      </CardContent>
    </Card>

    <Card v-if="result" class="mt-6">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
      </CardHeader>
      <CardContent>
        <dl class="space-y-3">
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Word Count</dt>
            <dd class="font-medium">{{ result.analysis.wordCount }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Character Count</dt>
            <dd class="font-medium">{{ result.analysis.charCount }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Most Frequent Word</dt>
            <dd class="font-medium">
              {{ result.analysis.mostFrequentWord || "N/A" }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-muted-foreground">Sentiment</dt>
            <dd
              class="font-medium"
              :class="getSentimentColor(result.analysis.sentimentScore)"
            >
              {{ getSentimentText(result.analysis.sentimentScore) }}
              ({{ result.analysis.sentimentScore.toFixed(2) }})
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  </div>
</template>
