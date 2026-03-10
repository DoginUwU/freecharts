import { eq } from "drizzle-orm";
import { db } from "../../../libs/db/client";
import { airportsTable } from "../../../libs/db/schema";
import type { RouteWaypoint } from "../../../renderer/src/types/route";

export async function resolveAirport(
	token: string,
): Promise<RouteWaypoint | null> {
	const [airport] = await db
		.select()
		.from(airportsTable)
		.where(eq(airportsTable.icao, token))
		.limit(1);

	if (!airport) return null;

	return { ident: token, type: "airport", lat: airport.lat, lon: airport.lon };
}
