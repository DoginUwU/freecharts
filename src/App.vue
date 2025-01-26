<template>
  <main class="flex h-screen">
    <Sidebar />
    <router-view class="flex-1" />
  </main>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import Sidebar from "./components/Sidebar.vue";
import { useChartsStore } from "./stores/chartsStore";

const chartsStore = useChartsStore();

onBeforeMount(async () => {
  await handleConfigs();
});

async function handleConfigs() {
  const configChartsTheme = await window.api.readConfig("chartsTheme");

  if (configChartsTheme) {
    chartsStore.chartsTheme = configChartsTheme;
  }
}
</script>
