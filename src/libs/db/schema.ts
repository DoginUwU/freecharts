import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const waypointsTable = sqliteTable("waypoints", {
	id: int().primaryKey({ autoIncrement: true }),
	ident: text(),
	lat: real(),
	lon: real(),
	airport: text(),
	region: text(),
});
