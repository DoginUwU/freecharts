import type { InferSelectModel } from "drizzle-orm";
import type { IpcMainInvokeEvent } from "electron";
import type {
	airportsTable,
	fixesTable,
	gatesTable,
} from "../../libs/db/schema";
import type { RouteWaypoint } from "../../renderer/src/types/route";
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
		bounds: { south: number; north: number; west: number; east: number },
	): Promise<InferSelectModel<typeof gatesTable>[]>;

	getWaypointByIdent(
		event: IpcMainInvokeEvent,
		ident: string,
	): Promise<InferSelectModel<typeof fixesTable> | null>;

	getAirportByIcao(
		event: IpcMainInvokeEvent,
		icao: string,
	): Promise<InferSelectModel<typeof airportsTable> | null>;
}

export interface RouteOptions {
	departureRunway?: string;
	arrivalRunway?: string;
}

export interface ImplementedRouteTasks {
	computeRoute(
		event: IpcMainInvokeEvent,
		rawRoute: string,
		options?: RouteOptions,
	): Promise<RouteWaypoint[]>;
}

export type ImplementedTasks = ImplementedCacheFileTasks &
	ImplementedConfigTasks &
	ImplementedDirectoryTasks &
	ImplementedAirportTasks &
	ImplementedRouteTasks;

export interface BackendTaskReturn<T> {
	onSuccess: () => T;
}

export type BackendTaskParameters<T extends keyof ImplementedTasks> =
	Parameters<ImplementedTasks[T]> extends [unknown, ...infer Rest] ? Rest : [];

export type BackendTask<T extends keyof ImplementedTasks> = (
	...args: BackendTaskParameters<T>
) => Promise<ReturnType<ImplementedTasks[T]>>;
