import type { RouteWaypoint } from "../../../renderer/src/types/route";

/**
 * Removes consecutive duplicate points from the route.
 *
 * A point is considered a duplicate when both its ident and coordinates match
 * the previous point (within a small epsilon). This prevents artefacts at
 * procedure/airway boundaries where the same fix can appear as the last leg of
 * one segment and the first leg of the next.
 */
export function deduplicateRoute(route: RouteWaypoint[]): RouteWaypoint[] {
	return route.filter((point, index, array) => {
		if (index === 0) return true;
		const prev = array[index - 1];

		return !(
			point.ident === prev.ident &&
			Math.abs(point.lat - prev.lat) < 0.001 &&
			Math.abs(point.lon - prev.lon) < 0.001
		);
	});
}
