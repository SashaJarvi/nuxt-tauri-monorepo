<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { cn } from "../../lib/utils";

defineOptions({ inheritAttrs: false });

interface Props extends /* @vue-ignore */ HTMLAttributes {
  modelValue?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const classes = computed(() =>
  cn(
    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    props.class as string
  )
);

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}
</script>

<template>
  <textarea
    :class="classes"
    :value="modelValue"
    @input="handleInput"
    v-bind="$attrs"
  />
</template>
