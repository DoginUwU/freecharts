<template>
    <CollapsableFloatingCard class="absolute top-4 right-4 z-10" :icon="PhSlidersHorizontal"
        title="Configurações do mapa">
        <div class="flex flex-col">
            <div class="px-4 py-3 border-b border-white/[0.06]">
                <div class="text-[11px] text-slate-500 uppercase tracking-widest mb-2">Estilo do mapa</div>
                <div class="flex gap-2">
                    <button v-for="style in mapStyles" class="text-xs px-3 py-1.5 rounded-lg border transition" :class="mapStyle === style.value
                        ? 'bg-primary/20 border-primary/40 text-primary'
                        : 'bg-zinc-900/70 border-white/10 text-slate-300 hover:bg-white/[0.04]'
                        " @click="emit('update:map-style', style.value)">
                        {{ style.name }}
                    </button>
                </div>
            </div>

            <div class="px-4 py-3">
                <div class="text-[11px] text-slate-500 uppercase tracking-widest mb-2">Camadas</div>
                <div class="flex items-center justify-between gap-3">
                    <span class="text-sm text-slate-300">Aeródromos</span>
                    <Toggle v-model="airportsLayerEnabled" />
                </div>
            </div>
        </div>
    </CollapsableFloatingCard>
</template>

<script setup lang="ts">
import { PhSlidersHorizontal } from "@phosphor-icons/vue";
import CollapsableFloatingCard from "../CollapsableFloatingCard.vue";
import Toggle from "../Toggle.vue";

defineProps<{
    mapStyle: "dark" | "satellite";
    selectedRea: string;
}>();

const airportsLayerEnabled = defineModel<boolean>('airports-layer-enabled');

const emit = defineEmits<{
    "update:map-style": [value: "dark" | "satellite"];
    "update:selected-rea": [value: string];
}>();

const mapStyles = [
    { name: "Escuro", value: "dark" },
    { name: "Satélite", value: "satellite" },
] as const;
</script>
]