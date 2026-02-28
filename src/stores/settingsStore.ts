import { defineStore } from "pinia";
import type { Config } from "../backend/tasks/ConfigTasks";

export const useSettingsStore = defineStore("settings", {
	state: () => ({
		currentSettings: { chartsTheme: 'light' } as Config,
	}),
	actions: {
		async loadSettings() {
			const settings = await window.api.readAllConfig();
			this.currentSettings = settings;
		},
        async setSetting<T extends keyof Config>(key: T, value: Config[T]) {
            this.currentSettings[key] = value;
            await window.api.setConfig(key, value);
        }
	},
});
