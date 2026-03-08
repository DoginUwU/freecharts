<template>
    <div ref="mapElement"></div>
</template>

<script setup lang="ts">
// @ts-expect-error - .css file exists
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';

const mapElement = ref<HTMLDivElement>();
const airportsLayer = L.layerGroup();
const gatesLayer = L.layerGroup();

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

    airportsLayer.addTo(state.map! as any)
    gatesLayer.addTo(state.map! as any)

    state.map.on('moveend', updateAirports);
    state.map.on('moveend', updateGates);

    state.map.on('zoomend', updateAirports);
    state.map.on('zoomend', updateGates);

    updateAirports();
})

onUnmounted(() => {
    if (state.map) {
        state.map.remove();
    }
})

async function updateAirports() {
    if (!state.map) return;

    const bounds = state.map.getBounds();
    const payload = {
        south: bounds.getSouth(),
        north: bounds.getNorth(),
        west: bounds.getWest(),
        east: bounds.getEast()
    };

    const airports = await window.api.getAirportsInBounds(payload);

    airportsLayer.clearLayers();

    airports.forEach((apt) => {
        const marker = L.circleMarker([apt.lat, apt.lon], {
            radius: 5,
            fillColor: "#9333ea",
            color: "#fff",
            weight: 1,
            fillOpacity: 1
        }).bindTooltip(
            `<b>${apt.icao}</b><br>${apt.name}`,
            {
                direction: 'top',
                offset: L.point(0, -10),
                className: 'airport-tooltip'
            }
        );

        marker.addTo(airportsLayer);
    });
};

async function updateGates() {
    if (!state.map) return;
    if (state.map.getZoom() < 15) {
        gatesLayer.clearLayers();
        return;
    }

    const bounds = state.map.getBounds();
    const payload = {
        south: bounds.getSouth(),
        north: bounds.getNorth(),
        west: bounds.getWest(),
        east: bounds.getEast()
    };

    const gates = await window.api.getGatesInBounds(payload);

    gatesLayer.clearLayers();

    gates.forEach((gate) => {
        const marker = L.circleMarker([gate.lat, gate.lon], {
            radius: 4,
            fillColor: "#2563eb",
            color: "#fff",
            weight: 1,
            fillOpacity: 1
        }).bindTooltip(
            `<b>${gate.airportIcao}</b><br>${gate.name}`,
            {
                direction: 'top',
                offset: L.point(0, -10),
                className: 'airport-tooltip'
            }
        );

        marker.addTo(gatesLayer);
    });
}
</script>

<style>
.airport-tooltip {
    @apply !text-sm bg-black border-0 rounded-md text-white;
}
</style>
