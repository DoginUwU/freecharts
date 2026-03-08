import { and, desc, gte, type InferSelectModel, lte, sql } from "drizzle-orm";
import { db } from "../../libs/db/client";
import { airportsTable, gatesTable } from "../../libs/db/schema";
import type { ImplementedAirportTasks } from "./types";

export class AirportTasks implements ImplementedAirportTasks {
	async getAirportsInBounds(
		_event: any,
		bounds: { south: number; north: number; west: number; east: number },
	): Promise<InferSelectModel<typeof airportsTable>[]> {
		return await db
			.select()
			.from(airportsTable)
			.where(
				and(
					gte(airportsTable.lat, bounds.south),
					lte(airportsTable.lat, bounds.north),
					gte(airportsTable.lon, bounds.west),
					lte(airportsTable.lon, bounds.east),
				),
			)
			.orderBy(desc(airportsTable.rank))
			.limit(250);
	}

	async getGatesInBounds(
		_event: any,
		bounds: { south: number; north: number; west: number; east: number; }
	): Promise<InferSelectModel<typeof gatesTable>[]> {
		return await db.select().from(gatesTable).where(
			and(
				gte(gatesTable.lat, bounds.south),
				lte(gatesTable.lat, bounds.north),
				gte(gatesTable.lon, bounds.west),
				lte(gatesTable.lon, bounds.east)
			)
		).limit(500);
	}
}
