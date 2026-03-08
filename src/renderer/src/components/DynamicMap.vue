<template>
    <div ref="mapElement"></div>
</template>

<script setup lang="ts">
import type { Map as MapLibre } from "maplibre-gl";
import {
    h,
    markRaw,
    nextTick,
    onMounted,
    onUnmounted,
    reactive,
    ref,
    render,
} from "vue";
import AirportMapPopup from "./Map/AirportMapPopup.vue";

const mapElement = ref<HTMLDivElement>();
let map: MapLibre | null = null;

onMounted(async () => {
    await nextTick();

    if (!mapElement.value) {
        console.error("Failed to find MapElement");
        return;
    }

    map = markRaw(
        new window.maplibregl.Map({
            container: mapElement.value,
            style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
            center: [-122.420679, 37.772537],
            zoom: 9,
        }),
    );

    map.on("load", () => {
        setupLayers();
        updateAirports();
    });

    map.on("moveend", () => {
        updateAirports();
        updateGates();
    });

    updateAirports();

    map.on("mouseenter", "airports-circle", () => {
        map!.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "airports-circle", () => {
        map!.getCanvas().style.cursor = "";
    });

    map.on("click", "airports-circle", (e) => {
        if (!e.features?.[0]) return;
        const props = e.features[0].properties;

        const container = document.createElement('div');

        const vnode = h(AirportMapPopup, {
            icao: props?.icao,
            name: props?.name,
            priority: props?.priority,
        });

        render(vnode, container);

        new window.maplibregl.Popup({
            className: "airport-tooltip",
            closeButton: false,
        })
            .setLngLat((e.features[0].geometry as any).coordinates)
            .setDOMContent(container)
            .addTo(map!);
    });
});

onUnmounted(() => {
    if (map) {
        map.remove();
    }
});

function setupLayers() {
    if (!map) return;

    map.addSource("airports", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
    });

    map.addLayer({
        id: "airports-circle",
        type: "circle",
        source: "airports",
        paint: {
            "circle-radius": 5,
            "circle-color": "#6d5adb",
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 1,
        },
    });

    map.addLayer({
        id: "airports-label",
        type: "symbol",
        source: "airports",
        layout: {
            "text-field": ["get", "icao"],
            "text-font": ["Open Sans Regular"],
            "text-size": 12,
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-allow-overlap": false,
        },
        paint: {
            "text-color": "#ffffff",
            "text-halo-color": "#000",
            "text-halo-width": 1,
        },
    });

    map.addSource("gates", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
    });

    map.addLayer({
        id: "gates-circle",
        type: "circle",
        source: "gates",
        minzoom: 14,
        paint: {
            "circle-radius": 4,
            "circle-color": "#2563eb",
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 1,
        },
    });

    map.addLayer({
        id: "gates-label",
        type: "symbol",
        source: "gates",
        minzoom: 15,
        layout: {
            "text-field": ["get", "name"],
            "text-size": 10,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
        },
        paint: {
            "text-color": "#60a5fa",
        },
    });
}

async function updateAirports() {
    if (!map) return;

    const bounds = map.getBounds();
    const payload = {
        south: bounds.getSouth(),
        north: bounds.getNorth(),
        west: bounds.getWest(),
        east: bounds.getEast(),
    };

    const airports = await window.api.getAirportsInBounds(payload);

    const source = map.getSource("airports") as maplibregl.GeoJSONSource;
    if (source) {
        source.setData({
            type: "FeatureCollection",
            features: airports.map((apt) => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: [apt.lon, apt.lat] },
                properties: { icao: apt.icao, name: apt.name, priority: apt.rank },
            })),
        });
    }
}

async function updateGates() {
    if (!map || !map.isStyleLoaded()) return;

    const currentZoom = map.getZoom();
    const source = map.getSource("gates") as any;
    if (!source) return;

    if (currentZoom < 14) {
        source.setData({ type: "FeatureCollection", features: [] });
        return;
    }

    const bounds = map.getBounds();
    const payload = {
        south: bounds.getSouth(),
        north: bounds.getNorth(),
        west: bounds.getWest(),
        east: bounds.getEast(),
    };

    const gates = await window.api.getGatesInBounds(payload);

    source.setData({
        type: "FeatureCollection",
        features: gates.map((gate) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [gate.lon, gate.lat] },
            properties: { name: gate.name, airportIcao: gate.airportIcao },
        })),
    });
}
</script>
