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

export const airportsTable = sqliteTable(
	"airports",
	{
		id: int().primaryKey({ autoIncrement: true }),
		icao: text().unique().notNull(),
		name: text().default("").notNull(),
		elevation: int().default(0).notNull(),
		lat: real().notNull(),
		lon: real().notNull(),
		rank: int().default(0).notNull(),
	},
	(table) => [index("icao_idx").on(table.icao)],
);

export const runwaysTable = sqliteTable(
	"runways",
	{
		id: int().primaryKey({ autoIncrement: true }),
		widthMetres: real().notNull(),
		lat: real().notNull(),
		lon: real().notNull(),
		number: text().notNull(),
		airportIcao: text().references(() => airportsTable.icao),
	},
	(table) => [index("airport_icao_idx").on(table.airportIcao)],
);

export const gatesTable = sqliteTable(
	"gates",
	{
		id: int().primaryKey({ autoIncrement: true }),
		name: text().notNull(),
		airportIcao: text().references(() => airportsTable.icao),
		lat: real().notNull(),
		lon: real().notNull(),
	},
	(table) => [index("gate_airport_icao_idx").on(table.airportIcao)],
);

export const procedureLegsTable = sqliteTable("procedure_legs", {
	id: int().primaryKey({ autoIncrement: true }),
	icao: text()
		.notNull()
		.references(() => airportsTable.icao),
	type: text({ enum: ["SID", "STAR", "APPCH"] }).notNull(),
	sequence: int().notNull(),
	procName: text().notNull(),
	transitionIdent: text().notNull(),
	fixIdent: text().notNull(),
	legType: text().notNull(),
});

export const airportsRelations = relations(airportsTable, ({ many }) => ({
	runways: many(runwaysTable),
	gates: many(gatesTable),
	procedureLegs: many(procedureLegsTable),
}));

export const procedureLegsRelations = relations(
	procedureLegsTable,
	({ one }) => ({
		airport: one(airportsTable, {
			fields: [procedureLegsTable.icao],
			references: [airportsTable.icao],
		}),
	}),
);

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

export const airwaysTable = sqliteTable("airways", {
	id: int().primaryKey({ autoIncrement: true }),
	fromIdent: text().notNull(),
	fromLat: real().notNull(),
	fromLon: real().notNull(),
	fromType: text({ enum: ["fix", "ndb", "vor"] }).notNull(),
	toIdent: text().notNull(),
	toLat: real().notNull(),
	toLon: real().notNull(),
	toType: text({ enum: ["fix", "ndb", "vor"] }).notNull(),
	airwayName: text().notNull(),
	directionRestriction: text({ enum: ["none", "forward", "backward"] })
		.default("none")
		.notNull(),
	level: text({ enum: ["high", "low"] })
		.default("high")
		.notNull(),
	baseAltitude: int().default(0).notNull(),
	topAltitude: int().default(0).notNull(),
	distanceNm: real().default(0).notNull(),
});
