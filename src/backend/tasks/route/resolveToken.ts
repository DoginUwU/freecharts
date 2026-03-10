import type { RouteWaypoint } from "../../../renderer/src/types/route";
import type { RouteOptions } from "../types";
import { resolveAirport } from "./resolveAirport";
import { resolveAirway } from "./resolveAirway";
import { resolveFix } from "./resolveFix";
import { resolveProcedure } from "./resolveProcedure";

/**
 * Resolves a single route token into one or more waypoints.
 *
 * Resolution priority:
 *  1. Airport (ICAO match)
 *  2. SID / STAR procedure at the reference airport
 *  3. Airway traversed via BFS between the surrounding entry/exit tokens
 *  4. Named fix / intersection
 *  5. Invalid placeholder — token is preserved in the output so the user can
 *     see what went unresolved.
 */
export async function resolveToken(
	token: string,
	index: number,
	tokens: string[],
	originIcao: string,
	destIcao: string,
	options: RouteOptions | undefined,
): Promise<RouteWaypoint[]> {
	const airport = await resolveAirport(token);
	if (airport) return [airport];

	// Tokens in the first half of the string are departure-side; second half
	// is arrival-side. This controls which airport and runway are used for
	// procedure resolution.
	const isDeparture = index < tokens.length / 2;
	const refIcao = isDeparture ? originIcao : destIcao;

	// For SIDs the adjacent token after the procedure name is the exit fix
	// (enroute transition). For STARs it is the token before (entry transition).
	const transitionTarget = isDeparture
		? (tokens[index + 1] ?? "")
		: (tokens[index - 1] ?? "");

	const selectedRw = isDeparture
		? options?.departureRunway
		: options?.arrivalRunway;

	const procedure = await resolveProcedure(
		token,
		refIcao,
		isDeparture,
		transitionTarget,
		selectedRw,
	);
	if (procedure) return procedure;

	if (index > 0 && index < tokens.length - 1) {
		const entry = tokens[index - 1];
		const exit = tokens[index + 1];

		const airway = await resolveAirway(token, entry, exit);
		if (airway) return airway;
	}

	const fix = await resolveFix(token);
	if (fix) return [fix];

	return [{ ident: token, type: "invalid", lat: 0, lon: 0 }];
}
