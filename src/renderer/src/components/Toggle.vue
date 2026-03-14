<template>
    <label class="relative inline-flex items-center cursor-pointer group">
        <input type="checkbox" :checked="modelValue"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)" class="sr-only peer">
        <div class="w-11 h-6 bg-zinc-800 rounded-full peer 
                peer-checked:after:translate-x-full peer-checked:after:border-white 
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-zinc-400 after:rounded-full after:h-5 after:w-5 
                after:transition-all peer-checked:bg-primary peer-checked:after:bg-white">
        </div>
        <span v-if="label" class="ml-3 text-sm font-medium opacity-80">{{ label }}</span>
    </label>
</template>

<script setup lang="ts">
defineProps<{
    label?: string;
    modelValue: boolean | undefined;
}>();
defineEmits(['update:modelValue']);
</script>
