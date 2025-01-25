import { defineStore } from "pinia";
import { Chart } from "../types/airfield";

export const useChartsStore = defineStore("charts", {
  state: () => ({
    currentIcao: "",
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
  },
});
