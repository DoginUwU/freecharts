<template>
    <div class="relative w-full h-full">
        <div ref="mapElement" class="w-full h-full"></div>

        <MapSettings :map-style="currentStyle" :selected-rea="selectedRea" @update:map-style="setMapStyle"
            @update:selected-rea="selectedRea = $event" @update:airports-layer-enabled="applyAirportsLayerVisibility" />

        <RouteManager @fit-route="fitRoute" />
    </div>
</template>

<script setup lang="ts">
import type { Map as MapLibre, StyleSpecification } from "maplibre-gl";
import { storeToRefs } from "pinia";
import {
    h,
    markRaw,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    render,
    watch,
} from "vue";
import { geoService } from "../services/GeoService";
import { useRouteStore } from "../stores/routeStore";
import AirportMapPopup from "./Map/AirportMapPopup.vue";
import MapSettings from "./Map/MapSettings.vue";
import RouteManager from "./Map/RouteManager.vue";

const loadedLayouts = new Set<string>();
const mapElement = ref<HTMLDivElement>();
let map: MapLibre | null = null;

const routeStore = useRouteStore();
const { currentWaypoints } = storeToRefs(routeStore);

const currentStyle = ref<"dark" | "satellite">("dark");
const selectedRea = ref("none");

const styles: Record<"dark" | "satellite", string | StyleSpecification> = {
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    satellite: {
        version: 8,
        sources: {
            "raster-tiles": {
                type: "raster",
                tiles: [
                    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                ],
                tileSize: 256,
                attribution:
                    "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
            },
        },
        layers: [
            {
                id: "simple-tiles",
                type: "raster",
                source: "raster-tiles",
                minzoom: 0,
                maxzoom: 22,
            },
        ],
    },
};

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
            center: [-43.1629, -22.9101],
            zoom: 9,
        }),
    );

    map.on("load", () => {
        setupLayers();
        updateAirports();
        updateGates();
        updateCurrentRoute();
    });

    map.on("style.load", () => {
        setupLayers();

        loadedLayouts.clear();

        updateAirports();
        updateGates();
        updateCurrentRoute();
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

        const container = document.createElement("div");

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

watch(currentWaypoints, () => {
    updateCurrentRoute();
});

function setMapStyle(nextStyle: "dark" | "satellite") {
    if (!map) return;
    if (currentStyle.value === nextStyle) return;
    currentStyle.value = nextStyle;

    map.setStyle(styles[nextStyle]);
}

function applyAirportsLayerVisibility(value: boolean) {
    if (!map) return;

    const visibility = value ? "visible" : "none";

    if (map.getLayer("airports-circle")) {
        map.setLayoutProperty("airports-circle", "visibility", visibility);
    }

    if (map.getLayer("airports-label")) {
        map.setLayoutProperty("airports-label", "visibility", visibility);
    }

    if (!value) {
        map.getCanvas().style.cursor = "";
    }
}

function setupLayers() {
    if (!map) return;

    if (!map.getSource("airport-details")) {
        map.addSource("airport-details", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
            id: "osm-apron",
            type: "fill",
            source: "airport-details",
            filter: ["==", ["get", "aeroway"], "apron"],
            paint: {
                "fill-color": "#383838",
                "fill-opacity": 0.85,
            },
        });

        map.addLayer({
            id: "osm-taxiway-surface",
            type: "line",
            source: "airport-details",
            filter: ["==", ["get", "aeroway"], "taxiway"],
            paint: {
                "line-color": "#4a4640",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    13,
                    3,
                    16,
                    45,
                    20,
                    55,
                ],
                "line-opacity": 0.9,
            },
        });

        map.addLayer({
            id: "osm-taxiway-line",
            type: "line",
            source: "airport-details",
            filter: ["==", ["get", "aeroway"], "taxiway"],
            paint: {
                "line-color": "#d4a843",
                "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 16, 2],
            },
        });

        map.addLayer({
            id: "osm-runway-surface",
            type: "line",
            source: "airport-details",
            filter: ["==", ["get", "aeroway"], "runway"],
            paint: {
                "line-color": "#2a2a2a",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    1,
                    12,
                    3,
                    14,
                    12,
                    16,
                    45,
                    18,
                    65,
                ],
            },
        });

        map.addLayer({
            id: "osm-runway-line",
            type: "line",
            source: "airport-details",
            filter: ["==", ["get", "aeroway"], "runway"],
            paint: {
                "line-color": "#e0e0e0",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    12,
                    1,
                    14,
                    1.5,
                    16,
                    2,
                ],
                "line-dasharray": [3, 5],
                "line-opacity": 0.7,
            },
        });
    }

    if (!map.getSource("airports")) {
        map.addSource("airports", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
            id: "airports-circle",
            type: "circle",
            source: "airports",
            maxzoom: 14,
            paint: {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 5, 12, 7],
                "circle-color": "#818cf8",
                "circle-stroke-color": "#c7d2fe",
                "circle-stroke-width": 1.5,
                "circle-opacity": 0.9,
            },
        });

        map.addLayer({
            id: "airports-label",
            type: "symbol",
            source: "airports",
            maxzoom: 14,
            layout: {
                "text-field": ["get", "icao"],
                "text-font": ["Open Sans Regular"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 8, 11, 12, 13],
                "text-offset": [0, 1.5],
                "text-anchor": "top",
                "text-allow-overlap": false,
            },
            paint: {
                "text-color": "#e0e7ff",
                "text-halo-color": "#1e1b4b",
                "text-halo-width": 1.5,
            },
        });
    }

    if (!map.getSource("gates")) {
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
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 4, 18, 6],
                "circle-color": "#3b82f6",
                "circle-stroke-color": "#93c5fd",
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
                "text-size": 11,
                "text-offset": [0, 1.2],
                "text-anchor": "top",
            },
            paint: {
                "text-color": "#93c5fd",
                "text-halo-color": "#1e3a5f",
                "text-halo-width": 1.5,
            },
        });
    }

    if (!map.getSource("flight-plan")) {
        map.addSource("flight-plan", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
            id: "route-line-glow",
            type: "line",
            source: "flight-plan",
            filter: ["==", ["geometry-type"], "LineString"],
            paint: {
                "line-color": "#00d4ff",
                "line-width": 10,
                "line-opacity": 0.15,
                "line-blur": 6,
            },
        });

        map.addLayer({
            id: "route-line-layer",
            type: "line",
            source: "flight-plan",
            filter: ["==", ["geometry-type"], "LineString"],
            paint: {
                "line-color": "#00d4ff",
                "line-width": 4,
                "line-opacity": 0.9,
            },
        });

        map.addLayer({
            id: "route-waypoints-circle",
            type: "circle",
            source: "flight-plan",
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
                "circle-radius": 5,
                "circle-color": "#0a1628",
                "circle-stroke-color": "#00d4ff",
                "circle-stroke-width": 2,
                "circle-opacity": 1,
            },
        });

        map.addLayer({
            id: "route-waypoints-label",
            type: "symbol",
            source: "flight-plan",
            filter: ["==", ["geometry-type"], "Point"],
            layout: {
                "text-field": ["get", "name"],
                "text-font": ["Open Sans Bold"],
                "text-offset": [0, 1.4],
                "text-anchor": "top",
                "text-size": 11,
            },
            paint: {
                "text-color": "#00d4ff",
                "text-halo-color": "#001820",
                "text-halo-width": 1.5,
            },
        });
    }
}

async function updateAirports() {
    if (!map) return;

    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const center = map.getCenter();
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

    if (zoom >= 13 && airports.length > 0) {
        const closest = airports.reduce((prev, curr) => {
            const prevDist = Math.hypot(prev.lon - center.lng, prev.lat - center.lat);
            const currDist = Math.hypot(curr.lon - center.lng, curr.lat - center.lat);
            return currDist < prevDist ? curr : prev;
        });

        if (!loadedLayouts.has(closest.icao)) {
            loadDetailedLayout(closest);
        }
    }
}

async function loadDetailedLayout(airport: { icao: string; name: string }) {
    loadedLayouts.add(airport.icao);

    try {
        const geojson = await geoService.loadAirportOSM(airport.icao);

        const detailSource = map?.getSource("airport-details") as any;
        if (detailSource) {
            detailSource.setData(geojson);
        }
    } catch (e) {
        console.error("Failed to load OSM layout", e);
        loadedLayouts.delete(airport.icao);
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

function fitRoute() {
    if (!map) return;
    const validPoints = currentWaypoints.value.filter((w) => w.type !== "invalid");
    if (validPoints.length < 2) return;

    const lngs = validPoints.map((w) => w.lon);
    const lats = validPoints.map((w) => w.lat);
    map.fitBounds(
        [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 80, duration: 800 },
    );
}

async function updateCurrentRoute() {
    await routeStore.computeCurrentRoute();

    const validPoints = currentWaypoints.value.filter(({ type }) => type !== "invalid");

    const routeGeoJSON = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: validPoints.map((point) => [point!.lon, point!.lat]),
                },
            },
            ...validPoints.map((point) => ({
                type: "Feature",
                properties: { name: point!.ident },
                geometry: {
                    type: "Point",
                    coordinates: [point!.lon, point!.lat],
                },
            })),
        ],
    };

    const source = map!.getSource("flight-plan") as any;
    source.setData(routeGeoJSON);
}
</script>
