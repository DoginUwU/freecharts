<template>
    <div class="p-2 text-white bg-black/60 rounded border border-gray-700 backdrop-blur-sm">
        <h3 class="font-bold text-base text-primary">{{ icao }}</h3>
        <p class="text-sm">{{ name }}</p>
    </div>
</template>

<script lang="ts" setup>
defineProps<{
    icao: string;
    name: string;
    priority: number;
}>();
</script>
