<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { cn } from "../../lib/utils";

interface Props extends /* @vue-ignore */ HTMLAttributes {}

const props = defineProps<Props>();

const classes = computed(() =>
  cn("font-semibold leading-none tracking-tight", props.class as string)
);
</script>

<template>
  <h3 :class="classes">
    <slot />
  </h3>
</template>
