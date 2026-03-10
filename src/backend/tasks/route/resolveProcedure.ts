import { and, eq, ne } from "drizzle-orm";
import { db } from "../../../libs/db/client";
import { procedureLegsTable } from "../../../libs/db/schema";
import type { RouteWaypoint } from "../../../renderer/src/types/route";
import { getCoords } from "./coords";
import type { ProcedureLegRow } from "./types";

/**
 * Returns true if a runway transition identifier (e.g. "RW10R") matches the
 * selected runway string. Accepts all suffix variants for the same base number
 * so that runway "10R" matches "RW10", "RW10R", "RW10B", etc.
 */
function matchesRunway(trans: string, selectedRw: string): boolean {
	const baseRw = selectedRw.replace(/[^0-9]/g, "");
	return (
		trans === `RW${selectedRw}` ||
		trans === `RW${baseRw}` ||
		trans === `RW${baseRw}B` ||
		trans === `RW${baseRw}L` ||
		trans === `RW${baseRw}R` ||
		trans === `RW${baseRw}C`
	);
}

/**
 * Splits procedure legs (already sorted by sequence) into three groups:
 *
 * - **transition**: legs for the specific enroute fix transition (e.g. "ZARES").
 * - **common**: legs shared by all transitions (transitionIdent = "" or "ALL").
 * - **runway**: legs for the specific runway transition (e.g. "RW10R").
 *
 * Sequence numbers in nav databases are per-transition, so mixing all legs and
 * sorting globally produces garbled output. Each group must stay separate to
 * preserve its own correct internal order.
 *
 * Legs belonging to unrelated transitions are discarded.
 */
function splitProcedureLegs(
	legs: ProcedureLegRow[],
	transitionTarget: string,
	selectedRw: string | undefined,
): {
	transitionLegs: ProcedureLegRow[];
	commonLegs: ProcedureLegRow[];
	runwayLegs: ProcedureLegRow[];
} {
	const transitionLegs: ProcedureLegRow[] = [];
	const commonLegs: ProcedureLegRow[] = [];
	const runwayLegs: ProcedureLegRow[] = [];

	for (const leg of legs) {
		const trans = leg.transition?.trim() ?? "";

		if (trans === "" || trans === "ALL") {
			commonLegs.push(leg);
		} else if (trans === transitionTarget) {
			transitionLegs.push(leg);
		} else if (
			trans.startsWith("RW") &&
			selectedRw &&
			matchesRunway(trans, selectedRw)
		) {
			runwayLegs.push(leg);
		}
	}

	return { transitionLegs, commonLegs, runwayLegs };
}

/**
 * Resolves a SID or STAR token into an ordered list of procedure waypoints.
 *
 * Flyable leg order:
 * - **SID (departure):**  runway transition → common → enroute transition
 * - **STAR (arrival):**   enroute transition → common → runway transition
 *
 * Returns null if no procedure legs are found for the given token + airport.
 */
export async function resolveProcedure(
	token: string,
	refIcao: string,
	isDeparture: boolean,
	transitionTarget: string,
	selectedRw: string | undefined,
): Promise<RouteWaypoint[] | null> {
	const legs = await db
		.select({
			ident: procedureLegsTable.fixIdent,
			transition: procedureLegsTable.transitionIdent,
			sequence: procedureLegsTable.sequence,
		})
		.from(procedureLegsTable)
		.where(
			and(
				eq(procedureLegsTable.procName, token),
				eq(procedureLegsTable.icao, refIcao),
				ne(procedureLegsTable.fixIdent, ""),
				ne(procedureLegsTable.fixIdent, " "),
			),
		)
		.orderBy(procedureLegsTable.sequence);

	if (legs.length === 0) return null;

	const { transitionLegs, commonLegs, runwayLegs } = splitProcedureLegs(
		legs,
		transitionTarget,
		selectedRw,
	);

	const orderedLegs = isDeparture
		? [...runwayLegs, ...commonLegs, ...transitionLegs]
		: [...transitionLegs, ...commonLegs, ...runwayLegs];

	return Promise.all(
		orderedLegs.map(async (leg) => {
			const coords = await getCoords(leg.ident);
			return {
				ident: leg.ident,
				type: "procedure" as const,
				lat: coords?.lat ?? 0,
				lon: coords?.lon ?? 0,
			};
		}),
	);
}
