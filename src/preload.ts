// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, IpcRenderer, ipcRenderer } from "electron";
import type {
  BackendTask,
  BackendTaskParameters,
  ImplementedTasks,
} from "./backend/tasks/types";

export function defineBackendTask<T extends keyof ImplementedTasks>(
  ipcRenderer: IpcRenderer,
  task: T,
) {
  return (...args: BackendTaskParameters<T>) => {
    return ipcRenderer.invoke(task, ...args);
  };
}

contextBridge.exposeInMainWorld("api", {
  cacheFile: defineBackendTask(ipcRenderer, "cacheFile"),
  findCachedFile: defineBackendTask(ipcRenderer, "findCachedFile"),
});

declare global {
  interface Window {
    api: {
      cacheFile: BackendTask<"cacheFile">;
      findCachedFile: BackendTask<"findCachedFile">;
    };
  }
}
