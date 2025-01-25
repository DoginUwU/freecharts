import { type IpcMain } from "electron";
import { CacheFileTasks } from "./CacheFileTasks";

export class BackendTasks {
  constructor(ipcMain: IpcMain) {
    const cacheFileTasks = new CacheFileTasks();

    ipcMain.handle("cacheFile", cacheFileTasks.cacheFile);
    ipcMain.handle("findCachedFile", cacheFileTasks.findCachedFile);
  }
}
