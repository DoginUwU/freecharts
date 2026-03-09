import type { IpcMain } from "electron";
import { AirportTasks } from "./AirportTasks";
import { CacheFileTasks } from "./CacheFileTasks";
import { ConfigTasks } from "./ConfigTasks";
import { DirectoryTasks } from "./DirectoryTasks";

export class BackendTasks {
	constructor(ipcMain: IpcMain) {
		const cacheFileTasks = new CacheFileTasks();
		const configTasks = new ConfigTasks();
		const directoryTasks = new DirectoryTasks();
		const airportTasks = new AirportTasks();

		ipcMain.handle("cacheFile", cacheFileTasks.cacheFile);
		ipcMain.handle("findCachedFile", cacheFileTasks.findCachedFile);
		ipcMain.handle("findCachedFilePath", cacheFileTasks.findCachedFilePath);

		ipcMain.handle("setConfig", configTasks.setConfig);
		ipcMain.handle("readConfig", configTasks.readConfig);
		ipcMain.handle("readAllConfig", configTasks.readAllConfig);

		ipcMain.handle("selectDirectory", (event, defaultPath) =>
			directoryTasks.selectDirectory(event, defaultPath),
		);
		ipcMain.handle("deleteDirectoryContents", (event, directoryPath) =>
			directoryTasks.deleteDirectoryContents(event, directoryPath),
		);
		ipcMain.handle(
			"copyDirectoryContents",
			(event, sourcePath, destinationPath) =>
				directoryTasks.copyDirectoryContents(
					event,
					sourcePath,
					destinationPath,
				),
		);
		ipcMain.handle("copyFile", (event, sourcePath, destinationPath) =>
			directoryTasks.copyFile(event, sourcePath, destinationPath),
		);
		ipcMain.handle("listDirectoryContents", (event, directoryPath) =>
			directoryTasks.listDirectoryContents(event, directoryPath),
		);

		ipcMain.handle("getAirportsInBounds", airportTasks.getAirportsInBounds);
		ipcMain.handle("getGatesInBounds", airportTasks.getGatesInBounds);
		ipcMain.handle("getWaypointByIdent", airportTasks.getWaypointByIdent);
		ipcMain.handle("getAirportByIcao", airportTasks.getAirportByIcao);
	}
}
