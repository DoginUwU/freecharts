import type { IpcMainInvokeEvent } from "electron";
import ElectronStore from "electron-store";
import type { ImplementedConfigTasks } from "./types";

const schema = {
	chartsTheme: {
		type: "string",
		enum: ["light", "dark"],
	},
	filesAndDirectories: {
		type: "object",
		properties: {
			simbriefPath: {
				type: "string",
			},
			chartsPath: {
				type: "string",
			},
			autoDelete: {
				type: "boolean",
			},
		},
	}
};

export interface Config {
	chartsTheme: "light" | "dark";
	filesAndDirectories: {
		simbriefPath: string;
		chartsPath: string;
		autoDelete: boolean;
	};
}

export class ConfigTasks implements ImplementedConfigTasks {
	private static store = new ElectronStore<Config>({
		schema,
	});

	async setConfig<T extends keyof Config>(
		event: IpcMainInvokeEvent,
		key: T,
		value: Config[T],
	): Promise<void> {
		ConfigTasks.store.set(key, value);
	}

	async readConfig<T extends keyof Config>(
		event: IpcMainInvokeEvent,
		key: T,
	): Promise<Config[T] | null> {
		return ConfigTasks.store.get(key) ?? null;
	}

	async readAllConfig(): Promise<Config> {
		return ConfigTasks.store.store;
	}
}
