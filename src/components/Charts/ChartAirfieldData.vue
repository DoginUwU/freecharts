<template>
  <div
    class="flex flex-col items-center text-center gap-2 w-full h-full flex-1 mt-4"
  >
    <Input
      v-model="state.icao"
      class="w-full"
      placeholder="ICAO"
      @keydown="handleKeyDownICAO"
    />
    <template v-if="airfield">
      <div class="flex flex-col my-2">
        <h2 class="text-white font-bold text-2xl">
          {{ airfield.icao }}
        </h2>
        <span class="text-sm">{{ airfield.name }}</span>
        <span class="text-sm text-zinc-400">
          ({{ airfield.city }}, {{ airfield.state }})
        </span>
      </div>
      <!-- <CollapsableData title="Metar">
            <span> SBLO 032000Z 25008KT 9999 FEW030 32/20 Q1008= </span>
          </CollapsableData>
          <CollapsableData title="ATC">
            <div
              class="flex items-center justify-between gap-4 text-center px-2"
            >
              <span class="text-white font-bold">
                <i class="uil uil-rss" />
                Tower
              </span>
              <span>118.400</span>
            </div>
          </CollapsableData> -->
      <!-- <div class="w-full h-[1px] bg-zinc-700 my-3"></div> -->

      <ChartList
        :selected-chart="selectedChart"
        :charts="charts"
        @load-chart="emit('loadChart', $event)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, reactive, watch } from "vue";
import { Airfield, Chart } from "../../types/airfield";
import Input from "../Input.vue";
import ChartList from "./ChartList.vue";
import { storeToRefs } from "pinia";
import { useChartsStore } from "../../stores/chartsStore";

const chartsStore = useChartsStore();
const { currentIcao } = storeToRefs(chartsStore);

const emit = defineEmits<{
  loadChart: [chart: Chart];
  loadAirfield: [icao: string];
}>();

const props = defineProps<{
  selectedChart: Chart | null;
  airfield: Airfield | null;
  charts: Chart[];
}>();

const state = reactive({
  icao: currentIcao.value,
});

onBeforeMount(() => {
  if (currentIcao.value) {
    handleICAO();
  }
});

watch(
  () => props.airfield?.icao,
  () => {
    state.icao = "";
  },
);

watch(
  () => state.icao,
  () => {
    state.icao = state.icao.toUpperCase();
  },
);

function handleKeyDownICAO(event: KeyboardEvent) {
  if (event.code === "Enter" && state.icao.length === 4) {
    handleICAO();
  }
}

function handleICAO() {
  currentIcao.value = state.icao;
  emit("loadAirfield", state.icao);
}
</script>
