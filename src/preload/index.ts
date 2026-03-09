import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, type IpcRenderer, ipcRenderer, shell } from "electron";
import type {
	BackendTask,
	BackendTaskParameters,
	ImplementedTasks,
} from "../backend/tasks/types";

const api = {
	cacheFile: defineBackendTask(ipcRenderer, "cacheFile"),
	findCachedFile: defineBackendTask(ipcRenderer, "findCachedFile"),
	findCachedFilePath: defineBackendTask(ipcRenderer, "findCachedFilePath"),

	setConfig: defineBackendTask(ipcRenderer, "setConfig"),
	readConfig: defineBackendTask(ipcRenderer, "readConfig"),
	readAllConfig: defineBackendTask(ipcRenderer, "readAllConfig"),

	selectDirectory: defineBackendTask(ipcRenderer, "selectDirectory"),
	deleteDirectoryContents: defineBackendTask(
		ipcRenderer,
		"deleteDirectoryContents",
	),
	copyDirectoryContents: defineBackendTask(
		ipcRenderer,
		"copyDirectoryContents",
	),
	copyFile: defineBackendTask(ipcRenderer, "copyFile"),
	listDirectoryContents: defineBackendTask(
		ipcRenderer,
		"listDirectoryContents",
	),

	getAirportsInBounds: defineBackendTask(ipcRenderer, "getAirportsInBounds"),
	getGatesInBounds: defineBackendTask(ipcRenderer, "getGatesInBounds"),
	getWaypointByIdent: defineBackendTask(ipcRenderer, "getWaypointByIdent"),
	getAirportByIcao: defineBackendTask(ipcRenderer, "getAirportByIcao"),

	openExternal: (url: string) => shell.openExternal(url),
};

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", electronAPI);
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-expect-error (define in dts)
	window.electron = electronAPI;
	window.api = api;
}

export function defineBackendTask<T extends keyof ImplementedTasks>(
	ipcRenderer: IpcRenderer,
	task: T,
) {
	return (...args: BackendTaskParameters<T>) => {
		return ipcRenderer.invoke(task, ...args);
	};
}

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

			openExternal: (url: string) => void;

			getAirportsInBounds: BackendTask<"getAirportsInBounds">;
			getGatesInBounds: BackendTask<"getGatesInBounds">;
			getWaypointByIdent: BackendTask<"getWaypointByIdent">;
			getAirportByIcao: BackendTask<"getAirportByIcao">;
		};
	}
}
