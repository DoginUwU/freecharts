<template>
	<main class="flex h-screen">
		<Sidebar />
		<Toaster theme="dark" position="bottom-right" />
		<router-view class="flex-1" />
	</main>
</template>

<script setup lang="ts">
import { onBeforeMount } from "vue";
import { Toaster } from "vue-sonner";
import Sidebar from "./components/Sidebar.vue";
import { useSettingsStore } from "./stores/settingsStore";
// @ts-expect-error - No types available for vue-sonner
import "vue-sonner/style.css";

const settingsStore = useSettingsStore();

onBeforeMount(async () => {
	await settingsStore.loadSettings();
});
</script>
