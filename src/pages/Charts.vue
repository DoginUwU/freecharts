<template>
  <div class="flex gap-4 h-vh overflow-hidden">
    <aside class="flex flex-col items-center text-center gap-2 w-80">
      <Input class="w-full" placeholder="ICAO" />
      <div class="flex flex-col my-2">
        <h2 class="text-white font-bold text-2xl">SBLO</h2>
        <span class="text-sm">Governador José Richa</span>
        <span class="text-sm text-zinc-400">(Londrina, PR)</span>
      </div>
      <CollapsableData title="Metar">
        <span> SBLO 032000Z 25008KT 9999 FEW030 32/20 Q1008= </span>
      </CollapsableData>
      <CollapsableData title="ATC">
        <div class="flex items-center justify-between gap-4 text-center px-2">
          <span class="text-white font-bold">
            <i class="uil uil-rss" />
            Tower
          </span>
          <span>118.400</span>
        </div>
      </CollapsableData>
      <div class="w-full h-[1px] bg-zinc-700 my-3"></div>
      <CheckboxGroup
        :items="AVAILABLE_CHARTS_TYPES"
        :selecteds="[state.currentChartType]"
        @select="handleChangeChartType"
      />

      <span class="mt-3">Runway 28</span>
      <ul class="w-full">
        <li
          v-for="(_, index) in 3"
          :key="index"
          class="w-full flex justify-start bg-zinc-900/20 outline-none border-x border-b border-zinc-700 p-2"
          :class="{
            'border-t rounded-t-lg': index === 0,
            'border-b rounded-b-lg': index === 2,
          }"
        >
          <i class="uil uil-plane-departure mr-2" />
          <span class="text-white">ILS W OR LOC W RWY 28R</span>
        </li>
      </ul>
    </aside>
    <ChartReader />
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import CheckboxGroup from "../components/CheckboxGroup.vue";
import CollapsableData from "../components/CollapsableData.vue";
import Input from "../components/Input.vue";
import ChartReader from "../components/Charts/ChartReader.vue";

const AVAILABLE_CHARTS_TYPES = ["ADC", "IAC", "SID", "STAR", "VAC"];

const state = reactive({
  currentChartType: AVAILABLE_CHARTS_TYPES[0],
});

function handleChangeChartType(newType: string) {
  state.currentChartType = newType;
}
</script>
