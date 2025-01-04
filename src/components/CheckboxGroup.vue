<template>
  <div class="flex gap-2">
    <button
      v-for="item in items"
      :key="item"
      class="bg-zinc-900/20 outline-none border border-zinc-700 text-sm px-3 py-1 rounded-full transition hover:border-primary"
      :class="{ '!text-white !border-primary !bg-primary': isSelected(item) }"
      @click="handleSelect(item)"
    >
      {{ item }}
    </button>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  select: [value: string];
}>();

const props = defineProps<{
  items: string[];
  selecteds: string[];
}>();

function isSelected(item: string) {
  return props.selecteds.includes(item);
}

function handleSelect(item: string) {
  emit("select", item);
}
</script>
