<template>
  <div class="flex gap-2 flex-wrap">
    <button
      v-for="item in items"
      :key="item.value"
      class="bg-zinc-900/20 outline-none border text-sm px-3 py-1 rounded-lg transition"
      :class="{
        '!text-white': isSelected(item),
      }"
      :style="{
        borderColor: item.color,
        backgroundColor: isSelected(item) ? item.color : 'transparent',
      }"
      @click="handleSelect(item)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script lang="ts" setup>
export interface CheckboxItem {
  label: string;
  value: string;
  color: string;
}

const emit = defineEmits<{
  select: [value: string];
}>();

const props = defineProps<{
  items: CheckboxItem[];
  selecteds: string[];
}>();

function isSelected(item: CheckboxItem) {
  return props.selecteds.includes(item.value);
}

function handleSelect(item: CheckboxItem) {
  emit("select", item.value);
}
</script>
