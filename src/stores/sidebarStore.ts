import { defineStore } from "pinia";

export const useSidebarStore = defineStore("sidebar", {
  state: () => ({
    minimizeData: false,
  }),
  actions: {
    toggleMinimizeData() {
      this.minimizeData = !this.minimizeData;
    },
  },
});
