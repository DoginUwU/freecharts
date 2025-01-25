<template>
  <div class="flex h-vh overflow-hidden pt-4">
    <Transition name="airfield-anim" appear>
      <aside
        v-show="!minimizeData"
        class="flex flex-col items-center text-center gap-2 min-w-80 w-80 overflow-y-auto pr-2 mb-2"
      >
        <CheckboxGroup
          :items="CHARTS_MENU"
          :selecteds="[state.currentTab]"
          @select="state.currentTab = $event"
        />
        <ChartAirfieldData
          v-show="state.currentTab === 'charts'"
          :airfield="currentAirfield"
          :charts="charts ?? []"
          :selected-chart="state.currentChart"
          @load-chart="loadChart"
        />
        <ChartFavorites
          v-show="state.currentTab === 'favorites'"
          :airfield="currentAirfield"
          :selected-chart="state.currentChart"
          @load-chart="loadChart"
        />
      </aside>
    </Transition>
    <ChartReader
      v-if="currentAirfield && state.currentChart"
      :key="state.currentChart.id"
      :airfield="currentAirfield"
      :chart="state.currentChart"
    />
    <div v-else class="w-full h-full flex items-center justify-center flex-col">
      <h3 class="font-semibold text-xl">Aguardando instruções, comandante</h3>
      <span class="opacity-85">
        Escolha alguma carta aeronáutica, ela será exibida aqui!
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from "vue";
import ChartReader from "../components/Charts/ChartReader.vue";
import { Chart } from "../types/airfield";
import { AirfieldService } from "../services/AirfieldService";
import { useSidebarStore } from "../stores/sidebarStore";
import { storeToRefs } from "pinia";
import ChartAirfieldData from "../components/Charts/ChartAirfieldData.vue";
import CheckboxGroup, { CheckboxItem } from "../components/CheckboxGroup.vue";
import ChartFavorites from "../components/Charts/ChartFavorites.vue";
import { useChartsStore } from "../stores/chartsStore";
import { useQuery } from "@tanstack/vue-query";

const CHARTS_MENU: CheckboxItem[] = [
  {
    label: "Cartas",
    value: "charts",
    color: "#6d5adb",
  },
  {
    label: "Favoritos",
    value: "favorites",
    color: "#6d5adb",
  },
];

const sidebarStore = useSidebarStore();
const { minimizeData } = storeToRefs(sidebarStore);

const chartsStore = useChartsStore();
const { currentIcao } = storeToRefs(chartsStore);

const { data: currentAirfield } = useQuery({
  queryKey: ["airfield", currentIcao],
  queryFn: async () => {
    if (!currentIcao.value) return null;
    return AirfieldService.findByICAO(currentIcao.value);
  },
  staleTime: Infinity,
});

const { data: charts } = useQuery({
  queryKey: ["airfield", "charts", currentIcao],
  queryFn: async () => {
    if (!currentIcao.value) return null;
    return AirfieldService.findChartsByICAO(currentIcao.value);
  },
  staleTime: Infinity,
});

const state = reactive({
  currentTab: CHARTS_MENU[0].value,
  currentChart: null as Chart | null,
});

onMounted(() => {
  sidebarStore.minimizeData = false;
});

// async function loadAirfieldByIcao(icao: string) {
//   state.currentAirfield = await AirfieldService.findByICAO(icao);
//   state.charts = await AirfieldService.findChartsByICAO(icao);
//   // state.currentChartType = availableChartTypes.value[0].value;
//   // chartsStore.favoriteChart(state.charts[0]);
// }

async function loadChart(chart: Chart) {
  state.currentChart = chart;
}
</script>

<style scoped>
.airfield-anim-leave-active {
  transition: width 0.3s;
}

.airfield-anim-enter-active {
  transition:
    width 0.3s,
    min-width 0.3s,
    opacity 0.7s;
}

.airfield-anim-enter-from,
.airfield-anim-leave-to {
  opacity: 0;
  width: 0;
  min-width: 0;
  overflow: hidden;
}
</style>
