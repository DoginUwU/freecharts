import type { IpcMain } from "electron";
import { CacheFileTasks } from "./CacheFileTasks";
import { ConfigTasks } from "./ConfigTasks";

export class BackendTasks {
  constructor(ipcMain: IpcMain) {
    const cacheFileTasks = new CacheFileTasks();
    const configTasks = new ConfigTasks();

    ipcMain.handle("cacheFile", cacheFileTasks.cacheFile);
    ipcMain.handle("findCachedFile", cacheFileTasks.findCachedFile);

    ipcMain.handle("setConfig", configTasks.setConfig);
    ipcMain.handle("readConfig", configTasks.readConfig);
  }
}
