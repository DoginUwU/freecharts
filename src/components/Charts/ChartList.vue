<template>
  <div
    class="flex flex-col items-center text-center gap-2 w-full"
    ref="container"
  >
    <CheckboxGroup
      :items="availableChartTypes"
      :selecteds="[state.currentChartType]"
      @select="handleChangeChartType"
    />

    <div
      v-for="(charts, subtype, index) in groupedCharts[state.currentChartType]"
      :key="index"
      class="w-full"
      :class="{ 'mt-2': index > 0 }"
    >
      <span v-if="subtype !== 'null'">{{ subtype }}</span>
      <ul class="w-full mt-4 relative">
        <TransitionGroup name="charts-list" appear>
          <li
            v-for="(chart, index) in charts"
            :key="chart.id"
            class="chart-type w-full flex justify-start bg-zinc-900/20 outline-none border-x border-b border-zinc-700 p-2 transition-colors group"
            :class="{
              'border-t rounded-t-lg': index === 0,
              'border-b rounded-b-lg': index === charts.length - 1,
              active: selectedChart?.id === chart.id,
            }"
            role="button"
            @click="emit('loadChart', chart)"
          >
            <i class="uil uil-plane-departure mr-2" />
            <span class="text-white text-start">
              {{ chart.name.toUpperCase() }}
            </span>
            <i
              role="button"
              class="uil uil-star ml-auto opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
              :class="{
                '!opacity-100 text-yellow-500 hover:text-yellow-600':
                  chartsStore.isFavoritedChart(chart),
              }"
              @click.stop="chartsStore.favoriteChart(chart)"
            />
          </li>
        </TransitionGroup>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, reactive, ref, watch } from "vue";
import { useChartsStore } from "../../stores/chartsStore";
import { groupBy, mapValues } from "lodash-es";
import { Chart, ChartType } from "../../types/airfield";
import CheckboxGroup, { CheckboxItem } from "../CheckboxGroup.vue";

const container = ref<HTMLDivElement>();

const chartTypesColorMap: Record<ChartType, string> = {
  APP: "#00b4d8",
  GRD: "#9b5de5",
  SID: "#ba4c8e",
  STAR: "#c5a14d",
  VAC: "#03ad96",
};

const props = defineProps<{
  selectedChart: Chart | null;
  charts: Chart[];
}>();

const emit = defineEmits<{
  loadChart: [chart: Chart];
}>();

const state = reactive({
  currentChartType: "",
});

const chartsStore = useChartsStore();

const groupedCharts = computed(() => {
  const dictionary = groupBy(props.charts, (chart) => chart.type);
  const subDictionary = mapValues(dictionary, (group) =>
    groupBy(group, (chart) => chart.subType),
  );

  return subDictionary;
});

const availableChartTypes = computed(() => {
  return Array.from(new Set(props.charts.map((chart) => chart.type)))
    .sort((a, b) => {
      if (!chartTypesColorMap[a]) return 1;

      return a.localeCompare(b);
    })
    .map<CheckboxItem>((type) => ({
      label: type,
      value: type,
      color: chartTypesColorMap[type] ?? "#000",
    }));
});

const currentChartTypeColor = computed(() => {
  const firstOfType = availableChartTypes.value.find(
    (type) => type.value === state.currentChartType,
  );

  return firstOfType?.color;
});

watch(
  () => currentChartTypeColor.value,
  async (color) => {
    if (!color) return;

    await nextTick();

    container.value?.style.setProperty("--chart-type-color", color);
  },
  { immediate: true },
);

watch(
  () => availableChartTypes.value.length,
  () => {
    state.currentChartType = availableChartTypes.value[0]?.value;
  },
  {
    immediate: true,
  },
);

function handleChangeChartType(newType: string) {
  state.currentChartType = newType;
}
</script>

<style scoped>
.chart-type:hover,
.chart-type.active {
  background-color: var(--chart-type-color);
}

.charts-list-move,
.charts-list-enter-active,
.charts-list-leave-active {
  transition: transform 0.3s ease;
}

.charts-list-enter-from,
.charts-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.charts-list-leave-active {
  position: absolute;
}
</style>
