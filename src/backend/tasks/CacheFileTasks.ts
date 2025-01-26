import fs from "node:fs/promises";
import path from "node:path";
import { app, type IpcMainInvokeEvent } from "electron";
import type { ImplementedCacheFileTasks } from "./types";

export class CacheFileTasks implements ImplementedCacheFileTasks {
  constructor() {
    this.cacheClean();
  }

  async cacheFile(
    event: IpcMainInvokeEvent,
    fileName: string,
    buffer: Buffer<ArrayBufferLike>,
  ): Promise<void> {
    const filePath = path.join(CacheFileTasks.cacheFolder, fileName);

    await CacheFileTasks.creteCacheFolderIfNeed();
    await fs.appendFile(filePath, Buffer.from(buffer));

    console.log(`[CACHE] Saved file in: ${filePath}`);
  }

  async findCachedFile(
    event: IpcMainInvokeEvent,
    fileName: string,
  ): Promise<Buffer<ArrayBufferLike> | null> {
    const filePath = path.join(CacheFileTasks.cacheFolder, fileName);

    await CacheFileTasks.creteCacheFolderIfNeed();

    try {
      const buffer = await fs.readFile(filePath);

      console.log(`[CACHE] Loaded file in: ${filePath}`);

      return buffer;
    } catch {
      return null;
    }
  }

  private static async creteCacheFolderIfNeed() {
    try {
      await fs.access(
        CacheFileTasks.cacheFolder,
        fs.constants.R_OK | fs.constants.W_OK,
      );
    } catch {
      await fs.mkdir(CacheFileTasks.cacheFolder);
    }
  }

  private static get cacheFolder() {
    return path.join(app.getPath("temp"), "freecharts");
  }

  private async cacheClean() {
    if (!CacheFileTasks.cacheFolder.includes("freecharts")) {
      throw new Error("Missing freecharts temp directory");
    }

    const files = await fs.readdir(CacheFileTasks.cacheFolder);

    for (const file of files) {
      await fs.unlink(path.join(CacheFileTasks.cacheFolder, file));
    }

    console.log(`[CACHE] Temp data cleaned`);
  }
}
