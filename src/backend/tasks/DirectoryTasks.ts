import fs from "node:fs/promises";
import path from "node:path";
import { app, dialog, type IpcMainInvokeEvent } from "electron";

export class DirectoryTasks {
	async selectDirectory(
		event: IpcMainInvokeEvent,
		defaultPath?: string,
	): Promise<string | null> {
		const { canceled, filePaths } = await dialog.showOpenDialog({
			properties: ["openDirectory", "createDirectory"],
			title: "Selecionar pasta para salvamento",
			buttonLabel: "Selecionar Pasta",
			defaultPath,
		});

		if (canceled || filePaths.length === 0) {
			return null;
		}

		return filePaths[0];
	}

	async listDirectoryContents(
		event: IpcMainInvokeEvent,
		directoryPath: string,
	): Promise<string[] | null> {
		try {
			await this.assertDirectoryProtections(directoryPath);
			const files = await fs.readdir(directoryPath);
			return files;
		} catch (error) {
			console.error(`Erro ao listar o conteúdo do diretório ${directoryPath}:`, error);
			return null;
		}
	}

	async deleteDirectoryContents(
		event: IpcMainInvokeEvent,
		directoryPath: string,
	): Promise<boolean> {
		await this.assertDirectoryProtections(directoryPath);

		const files = await fs.readdir(directoryPath);
		await Promise.all(
			files.map((file) =>
				fs.rm(path.join(directoryPath, file), {
					recursive: true,
					force: true,
				}),
			),
		);
		return true;
	}

	async copyDirectoryContents(
		event: IpcMainInvokeEvent,
		sourcePath: string,
		destinationPath: string,
	): Promise<boolean> {
		await this.assertDirectoryProtections(destinationPath);

		const files = await fs.readdir(sourcePath);
		await Promise.all(
			files.map((file) =>
				fs.copyFile(
					path.join(sourcePath, file),
					path.join(destinationPath, file),
				),
			),
		);
		return true;
	}

	async copyFile(
		event: IpcMainInvokeEvent,
		sourcePath: string,
		destinationPath: string,
	): Promise<boolean> {
		await this.assertDirectoryProtections(path.dirname(destinationPath));

		await fs.copyFile(sourcePath, destinationPath);
		return true;
	}

	private async assertDirectoryProtections(directoryPath: string) {
		if (directoryPath === "/") {
			throw new Error("Operação proibida: não é permitido acessar a raiz do sistema.");
		}

		if (directoryPath === process.cwd()) {
			throw new Error("Operação proibida: não é permitido acessar o diretório de trabalho do aplicativo.");
		}

		if (directoryPath === path.dirname(process.execPath)) {
			throw new Error("Operação proibida: não é permitido acessar o diretório de instalação do aplicativo.");
		}

		const SIMULATOR_DIR_NAMES = ["Microsoft Flight Simulator", "Prepar3D", "X-Plane 11", "X-Plane 12", "Steam"];

		if (SIMULATOR_DIR_NAMES.every((name) => !directoryPath.includes(name))) {
			throw new Error("Operação proibida: o diretório selecionado não parece ser relacionado a um simulador de voo.");
		}

		const PROTECTED_PATHS = [
			app.getPath('home'),
			app.getPath('desktop'),
			app.getPath('documents'),
			app.getPath('downloads'),
			app.getPath('music'),
			app.getPath('pictures'),
			app.getPath('videos'),
			app.getPath('temp'),
			app.getPath('userData'),
		];

		if (PROTECTED_PATHS.some((protectedPath) => directoryPath.endsWith(protectedPath))) {
			throw new Error("Operação proibida: o diretório selecionado está em uma área protegida do sistema.");
		}

		const files = await fs.readdir(directoryPath);
		const hasNonFlightData = files.some(file => {
			const ext = path.extname(file).toLowerCase();
			return [".exe", ".dll", ".sys", ".ini", ".lnk", ".AppImage"].includes(ext);
		});

		if (hasNonFlightData) {
			throw new Error("Segurança: Esta pasta contém arquivos de sistema ou executáveis. Selecione uma pasta destinada apenas a documentos de voo.");
		}

		const hasFlightData = files.some(file => {
			const ext = path.extname(file).toLowerCase();
			return [".pln", ".pdf", ".fltplan", ".fms", ".txt"].includes(ext);
		});

		const hasFiles = files.length > 0;

		if (hasFiles && !hasFlightData) {
			throw new Error("Segurança: Esta pasta não parece conter arquivos relacionados a simuladores de voo. Selecione uma pasta destinada a documentos de voo.");
		}
	}
}
