<template>
  <button
    class="bg-zinc-900/70 outline-none rounded-lg px-4 py-2 text-sm hover:bg-primary transition-colors"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup></script>
