import { relations } from "drizzle-orm";
import { index, int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const waypointsTable = sqliteTable(
	"waypoints",
	{
		id: int().primaryKey({ autoIncrement: true }),
		ident: text().notNull(),
		lat: real().notNull(),
		lon: real().notNull(),
		airport: text().notNull(),
		region: text().notNull(),
	},
	(table) => [index("ident_idx").on(table.ident)],
);

export const airportsTable = sqliteTable("airports", {
	id: int().primaryKey({ autoIncrement: true }),
	icao: text().unique().notNull(),
	name: text().default("").notNull(),
	elevation: int().default(0).notNull(),
	lat: real().notNull(),
	lon: real().notNull(),
	rank: int().default(0).notNull(),
}, 
	(table) => [index("icao_idx").on(table.icao)]
);

export const runwaysTable = sqliteTable("runways", {
	id: int().primaryKey({ autoIncrement: true }),
	widthMetres: real().notNull(),
	lat: real().notNull(),
	lon: real().notNull(),
	number: text().notNull(),
	airportIcao: text().references(() => airportsTable.icao),
},
	(table) => [index("airport_icao_idx").on(table.airportIcao)]
);

export const gatesTable = sqliteTable("gates", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	airportIcao: text().references(() => airportsTable.icao),
	lat: real().notNull(),
	lon: real().notNull(),
},
	(table) => [index("gate_airport_icao_idx").on(table.airportIcao)]
);

export const airportsRelations = relations(airportsTable, ({ many }) => ({
	runways: many(runwaysTable),
	gates: many(gatesTable),
}));

export const runwaysRelations = relations(runwaysTable, ({ one }) => ({
	airport: one(airportsTable, {
		fields: [runwaysTable.airportIcao],
		references: [airportsTable.icao],
	}),
}));

export const gatesRelations = relations(gatesTable, ({ one }) => ({
	airport: one(airportsTable, {
		fields: [gatesTable.airportIcao],
		references: [airportsTable.icao],
	}),
}));
