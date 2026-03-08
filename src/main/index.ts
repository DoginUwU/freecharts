import { electronApp, is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import { join } from "path";
import { BackendTasks } from "../backend/tasks";

const createWindow = () => {
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: Math.round(width * 0.9),
		height: Math.round(height * 0.9),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
		},
		// backgroundMaterial: "mica",
		autoHideMenuBar: true,
		show: false,
		resizable: true,
		titleBarStyle: "hidden",

		// frame: false
	});

	if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
		mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}

	mainWindow.webContents.once("dom-ready", () => {
		mainWindow.show();
	});
};

app.whenReady().then(() => {
	electronApp.setAppUserModelId("com.freecharts.app");

	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

new BackendTasks(ipcMain);
