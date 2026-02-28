// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, type IpcRenderer, ipcRenderer } from "electron";
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
	findCachedFilePath: defineBackendTask(ipcRenderer, "findCachedFilePath"),

	setConfig: defineBackendTask(ipcRenderer, "setConfig"),
	readConfig: defineBackendTask(ipcRenderer, "readConfig"),
	readAllConfig: defineBackendTask(ipcRenderer, "readAllConfig"),

	selectDirectory: defineBackendTask(ipcRenderer, "selectDirectory"),
	deleteDirectoryContents: defineBackendTask(ipcRenderer, "deleteDirectoryContents"),
	copyDirectoryContents: defineBackendTask(ipcRenderer, "copyDirectoryContents"),
	copyFile: defineBackendTask(ipcRenderer, "copyFile"),
	listDirectoryContents: defineBackendTask(ipcRenderer, "listDirectoryContents"),
});

declare global {
	interface Window {
		api: {
			cacheFile: BackendTask<"cacheFile">;
			findCachedFile: BackendTask<"findCachedFile">;
			findCachedFilePath: BackendTask<"findCachedFilePath">;

			setConfig: BackendTask<"setConfig">;
			readConfig: BackendTask<"readConfig">;
			readAllConfig: BackendTask<"readAllConfig">;

			selectDirectory: BackendTask<"selectDirectory">;
			deleteDirectoryContents: BackendTask<"deleteDirectoryContents">;
			copyDirectoryContents: BackendTask<"copyDirectoryContents">;
			copyFile: BackendTask<"copyFile">;
			listDirectoryContents: BackendTask<"listDirectoryContents">;
		};
	}
}
