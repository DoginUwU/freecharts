import { defineStore } from "pinia";
import { Chart } from "../types/airfield";

export const useChartsStore = defineStore("charts", {
  state: () => ({
    currentIcao: "",
    currentChart: null as Chart | null,
    currentChartPage: 1,
    favoritedCharts: [] as Chart[],
    chartsTheme: "light" as "light" | "dark",
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
      if (this.chartsTheme === "light") {
        this.chartsTheme = "dark";
      } else {
        this.chartsTheme = "light";
      }

      window.api.setConfig("chartsTheme", this.chartsTheme);
    },
  },
});
