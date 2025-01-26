import type { ImplementedConfigTasks } from "./types";
import type { IpcMainInvokeEvent } from "electron";
import ElectronStore from "electron-store";

const schema = {
  chartsTheme: {
    type: "string",
    enum: ["light", "dark"],
  },
};

export interface Config {
  chartsTheme: "light" | "dark";
}

export class ConfigTasks implements ImplementedConfigTasks {
  private static store = new ElectronStore<Config>({
    schema,
  });

  constructor() {}

  async setConfig<T extends keyof Config>(
    event: IpcMainInvokeEvent,
    key: T,
    value: Config[T],
  ): Promise<void> {
    // @ts-expect-error wrong electron-store typo??
    ConfigTasks.store.set(key, value);
  }

  async readConfig<T extends keyof Config>(
    event: IpcMainInvokeEvent,
    key: T,
  ): Promise<Config[T] | null> {
    // @ts-expect-error wrong electron-store typo??
    return ConfigTasks.store.get(key) ?? null;
  }
}
