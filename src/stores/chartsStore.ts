import { defineStore } from "pinia";
import type { Chart } from "../types/airfield";
import { useSettingsStore } from "./settingsStore";

export const useChartsStore = defineStore("charts", {
	state: () => ({
		currentIcao: "",
		currentChart: null as Chart | null,
		currentChartPage: 1,
		favoritedCharts: [] as Chart[],
	}),
	actions: {
		favoriteChart(chart: Chart) {
			const alreadyFevorited = this.favoritedCharts.some(
				(favoritedChart) => favoritedChart.id === chart.id,
			);

			if (alreadyFevorited) {
				const data = this.favoritedCharts.filter(
					(favoritedChart) => favoritedChart.id !== chart.id,
				);

				this.favoritedCharts = data;

				return data;
			}

			this.favoritedCharts.push(chart);
		},
		isFavoritedChart(chart: Chart) {
			return this.favoritedCharts.some(
				(favoritedChart) => favoritedChart.id === chart.id,
			);
		},

		toggleChartsTheme() {
			const settingsStore = useSettingsStore();
			
			if (settingsStore.currentSettings.chartsTheme === "light") {
				settingsStore.setSetting("chartsTheme", "dark");
			} else {
				settingsStore.setSetting("chartsTheme", "light");
			}
		},
	},
});
