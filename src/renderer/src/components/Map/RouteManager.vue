<template>
    <div class="absolute top-4 left-4 z-10 w-80">
        <div
            class="bg-zinc-900/90 border-zinc-700 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">

            <div class="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <div class="flex items-center gap-2">
                    <PhNavigationArrow class="w-4 h-4 text-cyan-400" />
                    <span class="text-sm font-semibold text-white tracking-wide">Rota</span>
                </div>
                <button @click="expanded = !expanded"
                    class="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
                    <PhCaretDown :class="['w-4 h-4 transition-transform duration-200', expanded ? '' : '-rotate-90']" />
                </button>
            </div>

            <div v-if="expanded" class="px-3 py-2.5 border-b border-white/5">
                <Textarea v-model="rawRouteInput" @keydown.enter="applyRoute" placeholder="SBGR DCT KONAN DCT SBCF"
                    class="w-full text-sm" enter-to-submit />
            </div>

            <div v-if="expanded" class="overflow-y-auto" style="max-height: 19rem">
                <div v-if="isLoading" class="flex items-center justify-center py-8 gap-2 text-slate-500">
                    <span class="text-xs">Calculando rota...</span>
                </div>

                <div v-else-if="currentWaypoints.length === 0"
                    class="flex flex-col items-center justify-center py-8 gap-1">
                    <PhPath class="w-6 h-6 text-slate-700" />
                    <span class="text-xs text-slate-600">Nenhuma rota carregada</span>
                </div>

                <template v-else>
                    <div v-for="(wp, index) in currentWaypoints" :key="wp.ident + index"
                        class="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors group">

                        <div class="flex flex-col items-center gap-0.5 w-5 shrink-0">
                            <span class="text-[10px] text-slate-600 leading-none">{{
                                String(index + 1).padStart(2, '0') }}</span>
                            <div class="w-2 h-2 rounded-full border-2 mt-0.5" :class="dotClass(wp.type, index)" />
                            <div v-if="index < currentWaypoints.length - 1"
                                class="w-px flex-1 min-h-[6px] bg-white/10" />
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5">
                                <span class="text-sm font-bold"
                                    :class="wp.type === 'invalid' ? 'text-red-400' : 'text-white'">
                                    {{ wp.ident }}
                                </span>
                                <span class="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                                    :class="badgeClass(wp.type)">
                                    {{ typeLabel(wp.type) }}
                                </span>
                            </div>

                            <div v-if="wp.type !== 'invalid'" class="flex items-center gap-2.5 mt-0.5">
                                <span class="text-[10px] text-slate-500 flex items-center gap-1">
                                    <PhCompass class="w-2.5 h-2.5 shrink-0" />
                                    {{ mockHeading(index) }}°
                                </span>
                                <span class="text-[10px] text-slate-500 flex items-center gap-1">
                                    <PhClock class="w-2.5 h-2.5 shrink-0" />
                                    {{ mockETE(index) }}
                                </span>
                                <span class="text-[10px] text-slate-500 flex items-center gap-1">
                                    <PhDropHalf class="w-2.5 h-2.5 shrink-0" />
                                    {{ mockFuelLeg(index) }} kg
                                </span>
                            </div>
                            <div v-else class="text-[10px] text-red-400/70 mt-0.5">
                                Fixo não encontrado
                            </div>
                        </div>

                        <div
                            class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button title="Remover fixo"
                                class="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition active:scale-95">
                                <PhX class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <div v-if="expanded && validCount > 0"
                class="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between">
                <div class="flex gap-4">
                    <div>
                        <div class="text-[9px] text-slate-600 uppercase tracking-widest">ETE Total</div>
                        <div class="text-xs text-slate-300">{{ totalETE }}</div>
                    </div>
                    <div>
                        <div class="text-[9px] text-slate-600 uppercase tracking-widest">Combustível</div>
                        <div class="text-xs text-slate-300">{{ totalFuel }} kg</div>
                    </div>
                </div>
                <button @click="emit('fit-route')"
                    class="text-[11px] text-slate-500 hover:text-white transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 active:scale-95">
                    <PhArrowsOut class="w-3.5 h-3.5" />
                    Encaixar
                </button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import {
    PhArrowBendRightDown,
    PhArrowsOut,
    PhCaretDown,
    PhClock,
    PhCompass,
    PhDropHalf,
    PhNavigationArrow,
    PhPath,
    PhX,
} from "@phosphor-icons/vue";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { useRouteStore } from "../../stores/routeStore";
import { RouteWaypoint } from "../../types/route";
import Input from "../Input.vue";
import Textarea from "../Textarea.vue";

type WpType = RouteWaypoint["type"];

const emit = defineEmits<{
    "fit-route": [];
}>();

const routeStore = useRouteStore();
const { currentWaypoints, currentRawRoute } = storeToRefs(routeStore);

const expanded = ref(true);
const isLoading = ref(false);
const rawRouteInput = ref(currentRawRoute.value);

watch(currentRawRoute, (v) => {
    rawRouteInput.value = v;
});

const validCount = computed(
    () => currentWaypoints.value.filter((w) => w.type !== "invalid").length,
);

async function applyRoute() {
    if (rawRouteInput.value.trim() === routeStore.currentLoadedRouteKey) return;
    routeStore.currentRawRoute = rawRouteInput.value.trim().toUpperCase();
    isLoading.value = true;
    await routeStore.computeCurrentRoute();
    isLoading.value = false;
}

const MOCK_HEADINGS = [27, 103, 215, 318, 72, 145, 260, 333, 55, 190];
const MOCK_MINUTES = [14, 22, 18, 31, 12, 25, 19, 27, 16, 20];
const MOCK_FUEL_LEG = [210, 320, 275, 460, 185, 375, 290, 410, 240, 305];

function mockHeading(i: number): string {
    return String(MOCK_HEADINGS[i % MOCK_HEADINGS.length]).padStart(3, "0");
}

function mockETE(i: number): string {
    const minutes = MOCK_MINUTES[i % MOCK_MINUTES.length];
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

function mockFuelLeg(i: number): number {
    return MOCK_FUEL_LEG[i % MOCK_FUEL_LEG.length];
}

const totalETE = computed(() => {
    const totalMin = currentWaypoints.value
        .filter((w) => w.type !== "invalid")
        .reduce((acc, _, i) => acc + MOCK_MINUTES[i % MOCK_MINUTES.length], 0);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${String(m).padStart(2, "0")}m`;
});

const totalFuel = computed(() =>
    currentWaypoints.value
        .filter((w) => w.type !== "invalid")
        .reduce((acc, _, i) => acc + MOCK_FUEL_LEG[i % MOCK_FUEL_LEG.length], 0),
);

function dotClass(type: WpType, index: number): string {
    if (type === "invalid") return "border-red-500/70 bg-transparent";
    if (index === 0 || index === currentWaypoints.value.length - 1)
        return "border-cyan-400 bg-cyan-400";
    return "border-slate-500 bg-transparent";
}

function badgeClass(type: WpType): string {
    switch (type) {
        case "airport":
            return "bg-indigo-500/20 text-indigo-300";
        case "waypoint":
            return "bg-cyan-500/15 text-cyan-400";
        case "procedure":
            return "bg-green-500/20 text-green-400";
        case "airway":
            return "bg-yellow-500/20 text-yellow-400";
        default:
            return "bg-red-500/20 text-red-400";
    }
}

function typeLabel(type: WpType): string {
    switch (type) {
        case "airport":
            return "APT";
        case "waypoint":
            return "WPT";
        case "procedure":
            return "PROC";
        case "airway":
            return "AWY";
        default:
            return "INV";
    }
}
</script>
