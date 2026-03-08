<template>
    <div ref="mapElement"></div>
</template>

<script setup lang="ts">
// @ts-expect-error - .css file exists
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';

const mapElement = ref<HTMLDivElement>();

const state = reactive({
    map: null as L.Map | null,
})

onMounted(async () => {
    await nextTick();

    if (!mapElement.value) {
        console.error('Failed to find MapElement');
        return;
    }

    state.map = L.map(mapElement.value, {
        zoomControl: false,
    }).setView([-23.5505, -46.6333], 5)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        keepBuffer: 4
    }).addTo(state.map! as any)
})

onUnmounted(() => {
    if (state.map) {
        state.map.remove();
    }
})
</script>
