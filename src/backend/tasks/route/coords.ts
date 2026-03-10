import { eq } from "drizzle-orm";
import { db } from "../../../libs/db/client";
import {
	airportsTable,
	fixesTable,
	navaidsTable,
} from "../../../libs/db/schema";

/**
 * Looks up coordinates for a fix identifier by checking navaids, airports,
 * and fixes (in that priority order).
 */
export async function getCoords(
	ident: string,
): Promise<{ lat: number; lon: number; type: string } | null> {
	const cleanIdent = ident.trim();

	const [nav] = await db
		.select()
		.from(navaidsTable)
		.where(eq(navaidsTable.ident, cleanIdent))
		.limit(1);
	if (nav) return { lat: nav.lat, lon: nav.lon, type: "navaid" };

	const [apt] = await db
		.select()
		.from(airportsTable)
		.where(eq(airportsTable.icao, cleanIdent))
		.limit(1);
	if (apt) return { lat: apt.lat, lon: apt.lon, type: "airport" };

	const [fix] = await db
		.select()
		.from(fixesTable)
		.where(eq(fixesTable.ident, cleanIdent))
		.limit(1);
	if (fix) return { lat: fix.lat, lon: fix.lon, type: "waypoint" };

	return null;
}
