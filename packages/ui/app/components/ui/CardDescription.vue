<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { cn } from "../../lib/utils";

interface Props extends /* @vue-ignore */ HTMLAttributes {}

const props = defineProps<Props>();

const classes = computed(() =>
  cn("text-sm text-muted-foreground", props.class as string)
);
</script>

<template>
  <p :class="classes">
    <slot />
  </p>
</template>
