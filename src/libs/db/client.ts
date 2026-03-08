import { join } from "node:path";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { app } from "electron";
import * as schema from "./schema";

const sqlitePath = app.isPackaged
	? join(app.getPath("userData"), "db.sqlite")
	: join(process.cwd(), "db.sqlite");

export const db = drizzle(sqlitePath, { schema });
