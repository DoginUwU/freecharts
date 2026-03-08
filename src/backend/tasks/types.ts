import type { InferSelectModel } from "drizzle-orm";
import type { IpcMainInvokeEvent } from "electron";
import type { airportsTable, gatesTable } from "../../libs/db/schema";
import type { Config } from "./ConfigTasks";

export interface ImplementedCacheFileTasks {
	cacheFile(
		event: IpcMainInvokeEvent,
		fileName: string,
		buffer: Buffer<ArrayBufferLike>,
	): Promise<void>;

	findCachedFile(
		event: IpcMainInvokeEvent,
		fileName: string,
	): Promise<Buffer<ArrayBufferLike> | null>;
	findCachedFilePath(
		event: IpcMainInvokeEvent,
		fileName: string,
	): Promise<string | null>;
}

export interface ImplementedConfigTasks {
	setConfig<T extends keyof Config>(
		event: IpcMainInvokeEvent,
		key: T,
		value: Config[T],
	): Promise<void>;
	readConfig<T extends keyof Config>(
		event: IpcMainInvokeEvent,
		key: T,
	): Promise<Config[T] | null>;
	readAllConfig(): Promise<Config>;
}

export interface ImplementedDirectoryTasks {
	selectDirectory(
		event: IpcMainInvokeEvent,
		defaultPath?: string,
	): Promise<string | null>;
	deleteDirectoryContents(
		event: IpcMainInvokeEvent,
		directoryPath: string,
	): Promise<boolean>;
	copyDirectoryContents(
		event: IpcMainInvokeEvent,
		sourcePath: string,
		destinationPath: string,
	): Promise<boolean>;
	copyFile(
		event: IpcMainInvokeEvent,
		sourcePath: string,
		destinationPath: string,
	): Promise<boolean>;
	listDirectoryContents(
		event: IpcMainInvokeEvent,
		directoryPath: string,
	): Promise<string[] | null>;
}

export interface ImplementedAirportTasks {
	getAirportsInBounds(
		event: IpcMainInvokeEvent,
		bounds: { south: number; north: number; west: number; east: number },
	): Promise<InferSelectModel<typeof airportsTable>[]>;

	getGatesInBounds(
	event: IpcMainInvokeEvent,
	bounds: { south: number; north: number; west: number; east: number; }
): Promise<InferSelectModel<typeof gatesTable>[]>;
}

export type ImplementedTasks = ImplementedCacheFileTasks &
	ImplementedConfigTasks &
	ImplementedDirectoryTasks &
	ImplementedAirportTasks;

export interface BackendTaskReturn<T> {
	onSuccess: () => T;
}

export type BackendTaskParameters<T extends keyof ImplementedTasks> =
	Parameters<ImplementedTasks[T]> extends [unknown, ...infer Rest] ? Rest : [];

export type BackendTask<T extends keyof ImplementedTasks> = (
	...args: BackendTaskParameters<T>
) => Promise<ReturnType<ImplementedTasks[T]>>;
