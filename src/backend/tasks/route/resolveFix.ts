import { eq } from "drizzle-orm";
import { db } from "../../../libs/db/client";
import { fixesTable } from "../../../libs/db/schema";
import type { RouteWaypoint } from "../../../renderer/src/types/route";

export async function resolveFix(token: string): Promise<RouteWaypoint | null> {
	const [fix] = await db
		.select()
		.from(fixesTable)
		.where(eq(fixesTable.ident, token))
		.limit(1);

	if (!fix) return null;

	return { ident: token, type: "waypoint", lat: fix.lat, lon: fix.lon };
}
