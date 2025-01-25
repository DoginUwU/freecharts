<template>
  <div
    class="flex flex-col items-center text-center gap-2 w-full h-full flex-1 mt-4"
  >
    <template v-for="(charts, icao) in groupedChartsByICAO" :key="icao">
      <h2 class="text-white font-bold text-2xl">
        {{ icao }}
      </h2>
      <ChartList
        :selected-chart="selectedChart"
        :charts="charts"
        @load-chart="emit('loadChart', $event)"
      />
    </template>
    <div
      v-if="!favoritedCharts.length"
      class="w-full h-fit flex items-center justify-center flex-col"
    >
      <span class="opacity-85">
        Para adicionar cartas aos favoritos, clique no ícone de estrela
        <i class="uil uil-star" /> ao passar o mouse por cima de uma carta do
        aeródromo.
        <br />
        <br />
        Elas ficarão salvas até que o programa seja fechado.
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useChartsStore } from "../../stores/chartsStore";
import { Airfield, Chart } from "../../types/airfield";
import ChartList from "./ChartList.vue";
import { computed } from "vue";
import { groupBy } from "lodash-es";

const chartsStore = useChartsStore();
const { favoritedCharts } = storeToRefs(chartsStore);

const emit = defineEmits<{
  loadChart: [chart: Chart];
}>();

defineProps<{
  selectedChart: Chart | null;
  airfield?: Airfield | null;
}>();

const groupedChartsByICAO = computed(() => {
  const dictionary = groupBy(favoritedCharts.value, (chart) => chart.icao);

  return dictionary;
});
</script>
