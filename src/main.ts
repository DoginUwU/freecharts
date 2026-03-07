import path from "node:path";
import { app, BrowserWindow, ipcMain, screen } from "electron";
import started from "electron-squirrel-startup";
import { BackendTasks } from "./backend/tasks";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

if (started) {
	app.quit();
}

const createWindow = () => {
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: Math.round(width * 0.9),
		height: Math.round(height * 0.9),
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
		// backgroundMaterial: "mica",
		autoHideMenuBar: true,
		show: false,
		resizable: true,
		titleBarStyle: "hidden",

		// frame: false
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	mainWindow.webContents.once("dom-ready", () => {
		mainWindow.show();
	});
};

app.whenReady().then(() => {
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
