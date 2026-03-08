import { relations } from "drizzle-orm";
import { index, int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const waypointsTable = sqliteTable(
	"waypoints",
	{
		id: int().primaryKey({ autoIncrement: true }),
		ident: text(),
		lat: real(),
		lon: real(),
		airport: text(),
		region: text(),
	},
	(table) => [index("ident_idx").on(table.ident)],
);

export const airportsTable = sqliteTable("airports", {
	id: int().primaryKey({ autoIncrement: true }),
	icao: text().unique(),
	name: text(),
	elevation: int(),
	lat: real(),
	lon: real(),
}, 
	(table) => [index("icao_idx").on(table.icao)]
);

export const runwaysTable = sqliteTable("runways", {
	id: int().primaryKey({ autoIncrement: true }),
	widthMetres: real(),
	lat: real(),
	lon: real(),
	number: text(),
	airportIcao: text().references(() => airportsTable.icao),
},
	(table) => [index("airport_icao_idx").on(table.airportIcao)]
);

export const airportsRelations = relations(airportsTable, ({ many }) => ({
	runways: many(runwaysTable),
}));

export const runwaysRelations = relations(runwaysTable, ({ one }) => ({
	airport: one(airportsTable, {
		fields: [runwaysTable.airportIcao],
		references: [airportsTable.icao],
	}),
}));
