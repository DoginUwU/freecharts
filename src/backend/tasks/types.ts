import type { IpcMainInvokeEvent } from "electron";

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

export type ImplementedTasks = ImplementedCacheFileTasks;

export interface BackendTaskReturn<T> {
  onSuccess: () => T;
}

export type BackendTaskParameters<T extends keyof ImplementedTasks> =
  Parameters<ImplementedTasks[T]> extends [unknown, ...infer Rest] ? Rest : [];

export type BackendTask<T extends keyof ImplementedTasks> = (
  ...args: BackendTaskParameters<T>
) => Promise<ReturnType<ImplementedTasks[T]>>;
