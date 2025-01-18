<template>
  <div class="flex gap-4 h-vh overflow-hidden">
    <Transition name="airfield-anim" appear>
      <aside
        v-if="!minimizeData || !state.currentChartId"
        class="flex flex-col items-center text-center gap-2 min-w-80 w-80 overflow-y-auto pr-2 pb-2"
      >
        <Input
          v-model="state.icao"
          class="w-full"
          placeholder="ICAO"
          @keydown="handleICAO"
        />
        <template v-if="state.currentAirfield">
          <div class="flex flex-col my-2">
            <h2 class="text-white font-bold text-2xl">
              {{ state.currentAirfield.icao }}
            </h2>
            <span class="text-sm">{{ state.currentAirfield.name }}</span>
            <span class="text-sm text-zinc-400">
              ({{ state.currentAirfield.city }},
              {{ state.currentAirfield.state }})
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
          <CheckboxGroup
            :items="availableChartTypes"
            :selecteds="[state.currentChartType]"
            @select="handleChangeChartType"
          />

          <div
            v-for="(charts, subtype, index) in groupedCharts[
              state.currentChartType
            ]"
            :key="index"
            class="w-full"
            :class="{ 'mt-2': index > 0 }"
          >
            <span v-if="subtype !== 'null'">{{ subtype }}</span>
            <ul class="w-full mt-3 relative">
              <TransitionGroup name="charts-list" appear>
                <li
                  v-for="(chart, index) in charts"
                  :key="chart.id"
                  class="w-full flex justify-start bg-zinc-900/20 outline-none border-x border-b border-zinc-700 p-2 hover:bg-primary transition-colors"
                  :class="{
                    'border-t rounded-t-lg': index === 0,
                    'border-b rounded-b-lg': index === charts.length - 1,
                    '!bg-primary': state.currentChartId === chart.id,
                  }"
                  role="button"
                  @click="loadChart(chart.id)"
                >
                  <i class="uil uil-plane-departure mr-2" />
                  <span class="text-white text-start">
                    {{ chart.name.toUpperCase() }}
                  </span>
                </li>
              </TransitionGroup>
            </ul>
          </div>
        </template>
      </aside>
    </Transition>
    <ChartReader
      v-if="state.currentAirfield && state.currentChartId"
      :key="state.currentChartId"
      :airfield="state.currentAirfield"
      :chart-id="state.currentChartId"
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
import { computed, onMounted, reactive } from "vue";
import CheckboxGroup, { CheckboxItem } from "../components/CheckboxGroup.vue";
import Input from "../components/Input.vue";
import ChartReader from "../components/Charts/ChartReader.vue";
import { Airfield, Chart, ChartType } from "../types/airfield";
import { AirfieldService } from "../services/AirfieldService";
import { groupBy, mapValues } from "lodash-es";
import { useSidebarStore } from "../stores/sidebarStore";
import { storeToRefs } from "pinia";

const sidebarStore = useSidebarStore();
const { minimizeData } = storeToRefs(sidebarStore);

// const AVAILABLE_CHARTS_TYPES = ["ADC", "IAC", "SID", "STAR", "VAC"];
const chartTypesColorMap: Record<ChartType, string> = {
  GRD: "#9b5de5",
  SID: "#F15BB5",
  STAR: "#ffd166",
  VAC: "#00F5D4",
};

const state = reactive({
  currentChartId: null as string | null,
  currentAirfield: null as Airfield | null,
  charts: [] as Chart[],
  currentChartType: "",
  icao: "",
});

onMounted(() => {
  sidebarStore.minimizeData = false;

  // TODO: remove this
  state.icao = "sbgr";
  loadAirfieldByIcao();
});

const groupedCharts = computed(() => {
  const dictionary = groupBy(state.charts, (chart) => chart.type);
  const subDictionary = mapValues(dictionary, (group) =>
    groupBy(group, (chart) => chart.subType),
  );

  return subDictionary;
});

const availableChartTypes = computed(() => {
  return Array.from(new Set(state.charts.map((chart) => chart.type)))
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

function handleChangeChartType(newType: string) {
  state.currentChartType = newType;
}

function handleICAO(event: KeyboardEvent) {
  if (event.code === "Enter" && state.icao.length === 4) {
    loadAirfieldByIcao();
  }
}

async function loadAirfieldByIcao() {
  state.currentAirfield = await AirfieldService.findByICAO(
    state.icao.toUpperCase(),
  );
  state.charts = await AirfieldService.findChartsByICAO(
    state.icao.toUpperCase(),
  );
  state.currentChartType = availableChartTypes.value[0].value;
  state.icao = "";
}

async function loadChart(chartId: string) {
  state.currentChartId = chartId;
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
