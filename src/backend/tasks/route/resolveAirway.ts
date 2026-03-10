import { eq } from "drizzle-orm";
import { db } from "../../../libs/db/client";
import { airwaysTable } from "../../../libs/db/schema";
import type { RouteWaypoint } from "../../../renderer/src/types/route";
import { getCoords } from "./coords";
import type { AirwayNode } from "./types";

/**
 * Builds an adjacency graph from raw airway segment rows.
 *
 * Each row is a directed FROM→TO segment. A reverse edge is added unless the
 * airway is strictly one-way (directionRestriction = "FORWARD").
 */
function buildAirwayGraph(
	segments: {
		fromIdent: string;
		fromLat: number;
		fromLon: number;
		toIdent: string;
		toLat: number;
		toLon: number;
		directionRestriction: "NONE" | "FORWARD" | "BACKWARD";
	}[],
): Map<string, AirwayNode[]> {
	const graph = new Map<string, AirwayNode[]>();

	for (const seg of segments) {
		const from = seg.fromIdent.trim();
		const to = seg.toIdent.trim();

		if (!graph.has(from)) graph.set(from, []);
		graph.get(from)!.push({ next: to, lat: seg.toLat, lon: seg.toLon });

		if (seg.directionRestriction !== "FORWARD") {
			if (!graph.has(to)) graph.set(to, []);
			graph.get(to)!.push({ next: from, lat: seg.fromLat, lon: seg.fromLon });
		}
	}

	return graph;
}

/**
 * BFS through the airway graph from `entry` to `exit`.
 *
 * Returns intermediate fixes only — entry and exit are excluded, since the
 * exit fix will be emitted by the next token's own resolution.
 */
function bfsAirway(
	graph: Map<string, AirwayNode[]>,
	entry: string,
	exit: string,
): RouteWaypoint[] {
	const queue: { current: string; path: RouteWaypoint[] }[] = [
		{ current: entry, path: [] },
	];
	const visited = new Set<string>();

	while (queue.length > 0) {
		const { current, path } = queue.shift()!;

		if (current === exit) {
			// Strip the exit fix if it ended up as the last item in the path.
			return path[path.length - 1]?.ident === exit ? path.slice(0, -1) : path;
		}

		if (visited.has(current)) continue;
		visited.add(current);

		for (const neighbor of graph.get(current) ?? []) {
			queue.push({
				current: neighbor.next,
				path: [
					...path,
					{
						ident: neighbor.next,
						type: "airway" as const,
						lat: neighbor.lat,
						lon: neighbor.lon,
					},
				],
			});
		}
	}

	return [];
}

/**
 * Resolves an airway token into the intermediate fixes between `entry` and
 * `exit` by querying the database and running BFS through the segment graph.
 *
 * Returns null if no segments exist for this airway name.
 * Falls back to a direct fix lookup for the exit when BFS finds no path
 * (e.g. due to incomplete airway data in the database).
 */
export async function resolveAirway(
	token: string,
	entry: string,
	exit: string,
): Promise<RouteWaypoint[] | null> {
	const segments = await db
		.select()
		.from(airwaysTable)
		.where(eq(airwaysTable.airwayName, token));

	if (segments.length === 0) return null;

	const graph = buildAirwayGraph(segments);
	const path = bfsAirway(graph, entry, exit);

	if (path.length === 0) {
		console.warn(
			`BFS found no path on airway ${token} from ${entry} to ${exit}. Falling back to direct fix lookup.`,
		);
		const exitCoords = await getCoords(exit);
		return [
			{
				ident: exit,
				type: "waypoint",
				lat: exitCoords?.lat ?? 0,
				lon: exitCoords?.lon ?? 0,
			},
		];
	}

	return path;
}
