<template>
  <input
    v-model="model"
    type="text"
    class="bg-zinc-900/70 outline-none border border-zinc-700/20 rounded-xl px-4 py-1 text-sm focus:border-primary"
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
const model = defineModel();
</script>
