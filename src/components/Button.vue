<template>
  <button
    class="bg-zinc-900/20 outline-none border border-zinc-700 rounded-lg px-4 py-2 text-sm hover:border-primary transition-colors"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup></script>
