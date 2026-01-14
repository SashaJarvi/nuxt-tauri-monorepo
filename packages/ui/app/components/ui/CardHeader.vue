<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { cn } from "../../lib/utils";

interface Props extends /* @vue-ignore */ HTMLAttributes {}

const props = defineProps<Props>();

const classes = computed(() =>
  cn("flex flex-col space-y-1.5 p-6", props.class as string)
);
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
