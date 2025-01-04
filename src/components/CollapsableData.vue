<template>
  <div
    class="w-full bg-zinc-900/20 border-t border rounded-lg p-1 border-zinc-700 hover:border-primary transition-colors group"
  >
    <div
      class="flex items-center select-none"
      role="button"
      @click="toggleOpen"
    >
      <span class="ml-auto group-hover:text-primary transition-colors">{{
        title
      }}</span>
      <i
        class="uil uil-angle-right ml-auto group-hover:text-primary transition"
        :class="{ 'rotate-[90deg]': state.open }"
      />
    </div>
    <CollapseTransition :open="state.open">
      <div class="[&>*]:text-zinc-400">
        <slot />
      </div>
    </CollapseTransition>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import CollapseTransition from "./CollapseTransition.vue";

defineProps<{
  title: string;
}>();

const state = reactive({
  open: false,
});

function toggleOpen() {
  state.open = !state.open;
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.2s;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
