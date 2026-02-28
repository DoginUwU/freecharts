<template>
  <div class="flex flex-col items-center text-center gap-2 w-full h-full flex-1 mt-4">
    <template v-for="(charts, icao) in groupedChartsByICAO" :key="icao">
      <h2 class="text-white font-bold text-2xl first-of-type:mt-0 mt-6">
        {{ icao }}
      </h2>
      <ChartList :selected-chart="selectedChart" :charts="charts" @load-chart="emit('loadChart', $event)" />
    </template>
    <Button v-if="favoritedCharts.length > 0" class="mt-auto w-full" @click="saveCharts">
      <PhDownloadSimple class="inline-block mr-2" />
      Salvar Cartas
    </Button>
    <div v-if="!favoritedCharts.length" class="w-full h-fit flex items-center justify-center flex-col">
      <span class="opacity-85">
        Para adicionar cartas aos favoritos, clique no ícone de estrela
        <PhStar class="inline-block" /> ao passar o mouse por cima de uma carta do
        aeródromo.
        <br />
        <br />
        Elas ficarão salvas até que o programa seja fechado.
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PhDownloadSimple, PhStar } from "@phosphor-icons/vue";
import { groupBy } from "lodash-es";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { toast } from "vue-sonner";
import { bufferFromChart, createChartFileName } from "../../helpers/charts";
import { useChartsStore } from "../../stores/chartsStore";
import { useSettingsStore } from "../../stores/settingsStore";
import type { Airfield, Chart } from "../../types/airfield";
import Button from "../Button.vue";
import ChartList from "./ChartList.vue";

const chartsStore = useChartsStore();
const { favoritedCharts } = storeToRefs(chartsStore);

const settingsStore = useSettingsStore();

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

async function saveCharts() {
  const isConfigured =
    !!settingsStore.currentSettings?.filesAndDirectories?.chartsPath?.length;

  if (!isConfigured) {
    toast.error(
      "O caminho para salvar as cartas não está configurado. Por favor, configure-o nas configurações antes de continuar.",
    );
    return;
  }

  const loadingToast = toast.loading("Salvando cartas... Isso pode levar alguns segundos dependendo da quantidade de cartas.");

  try {
    for (const chart of favoritedCharts.value) {
      await bufferFromChart(chart);

      const cachePath = await window.api.findCachedFilePath(
        createChartFileName(chart),
      );

      if (!cachePath) {
        toast.error(
          `Não foi possível encontrar o arquivo em cache para a carta ${chart.name}.`,
        );
        return;
      }

      const icao = chart.icao.toUpperCase();
      const finalName = `${icao} - ${chart.name.replaceAll(icao, "")}.pdf`;

      await window.api.copyFile(
        cachePath,
        `${settingsStore.currentSettings?.filesAndDirectories?.chartsPath}/${finalName}`,
      );
    }

    toast.success("Cartas salvas com sucesso!");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao salvar as cartas.");
  } finally {
    toast.dismiss(loadingToast);
  }
}
</script>
