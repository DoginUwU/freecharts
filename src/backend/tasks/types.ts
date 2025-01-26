import type { IpcMainInvokeEvent } from "electron";
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
}

export type ImplementedTasks = ImplementedCacheFileTasks &
  ImplementedConfigTasks;

export interface BackendTaskReturn<T> {
  onSuccess: () => T;
}

export type BackendTaskParameters<T extends keyof ImplementedTasks> =
  Parameters<ImplementedTasks[T]> extends [unknown, ...infer Rest] ? Rest : [];

export type BackendTask<T extends keyof ImplementedTasks> = (
  ...args: BackendTaskParameters<T>
) => Promise<ReturnType<ImplementedTasks[T]>>;
