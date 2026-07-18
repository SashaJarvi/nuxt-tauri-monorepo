<script setup lang="ts">
import Card from "../ui/Card.vue";
import CardHeader from "../ui/CardHeader.vue";
import CardTitle from "../ui/CardTitle.vue";
import CardDescription from "../ui/CardDescription.vue";
import CardContent from "../ui/CardContent.vue";
import Textarea from "../ui/Textarea.vue";
import Button from "../ui/Button.vue";

const { isWeb, isDesktop, isMobile, isTauri } = usePlatform();
const { invoke } = useTauri();
const api = useApi();

const inputText = ref("");
const apiResult = ref<string | null>(null);
const apiError = ref<string | null>(null);
const isCallingApi = ref(false);

const greeting = ref<string | null>(null);
const isGreeting = ref(false);

async function callApi() {
  if (!inputText.value.trim()) return;

  isCallingApi.value = true;
  apiError.value = null;
  apiResult.value = null;

  const response = await api.post<{ processed: string }>("/api/example", {
    text: inputText.value,
  });

  if (response.success) {
    apiResult.value = response.data.processed;
  } else {
    apiError.value = response.error.message;
  }

  isCallingApi.value = false;
}

async function callGreet() {
  isGreeting.value = true;
  greeting.value = await invoke<string>("greet", { name: "there" });
  isGreeting.value = false;
}
</script>

<template>
  <div class="container mx-auto max-w-2xl p-6 space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Platform</CardTitle>
        <CardDescription>Detected via usePlatform()</CardDescription>
      </CardHeader>
      <CardContent>
        <dl class="grid grid-cols-2 gap-2 text-sm">
          <dt class="text-muted-foreground">Web</dt>
          <dd class="font-medium">{{ isWeb }}</dd>
          <dt class="text-muted-foreground">Tauri</dt>
          <dd class="font-medium">{{ isTauri }}</dd>
          <dt class="text-muted-foreground">Desktop</dt>
          <dd class="font-medium">{{ isDesktop }}</dd>
          <dt class="text-muted-foreground">Mobile</dt>
          <dd class="font-medium">{{ isMobile }}</dd>
        </dl>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Shared API route</CardTitle>
        <CardDescription>
          Calls the server route at /api/example via useApi()
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="callApi">
          <Textarea
            v-model="inputText"
            placeholder="Type something to echo back uppercased..."
            rows="3"
            class="resize-none"
          />
          <Button type="submit" :disabled="isCallingApi" class="w-full">
            {{ isCallingApi ? "Sending..." : "Send to /api/example" }}
          </Button>
          <p v-if="apiError" class="text-sm text-red-600">{{ apiError }}</p>
          <p v-if="apiResult" class="text-sm text-muted-foreground">
            Response: <span class="font-medium">{{ apiResult }}</span>
          </p>
        </form>
      </CardContent>
    </Card>

    <Card v-if="isTauri">
      <CardHeader>
        <CardTitle>Native Rust command</CardTitle>
        <CardDescription>
          Calls the "greet" Tauri command via useTauri().invoke()
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Button :disabled="isGreeting" class="w-full" @click="callGreet">
          {{ isGreeting ? "Invoking..." : "Invoke greet" }}
        </Button>
        <p v-if="greeting" class="text-sm text-muted-foreground">
          {{ greeting }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
