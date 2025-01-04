<template>
  <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <div v-show="open" ref="content" class="content" v-bind="$attrs">
      <slot />
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const content = ref(null);

defineProps<{
  open: boolean;
}>();

const beforeEnter = (el: unknown) => {
  if (!(el instanceof HTMLElement)) return;

  el.style.height = "0";
  el.style.opacity = "0";
  el.style.overflow = "hidden";
};

const enter = (el: unknown) => {
  if (!(el instanceof HTMLElement)) return;

  el.style.height = `${el.scrollHeight}px`;
  el.style.opacity = "1";
};

const afterEnter = (el: unknown) => {
  if (!(el instanceof HTMLElement)) return;

  el.style.height = "auto";
  el.style.overflow = "visible";
};

const beforeLeave = (el: unknown) => {
  if (!(el instanceof HTMLElement)) return;

  el.style.height = `${el.scrollHeight}px`;
  el.style.opacity = "1";
  el.style.overflow = "hidden";
};

const leave = (el: unknown) => {
  if (!(el instanceof HTMLElement)) return;

  requestAnimationFrame(() => {
    el.style.height = "0";
    el.style.opacity = "0";
  });
};

const afterLeave = (el: unknown) => {
  if (!(el instanceof HTMLElement)) return;

  el.style.overflow = "";
};
</script>

<style scoped>
.content {
  transition:
    height 0.3s ease,
    opacity 0.3s ease;
}
</style>
