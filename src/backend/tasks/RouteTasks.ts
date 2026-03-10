import type { RouteWaypoint } from "../../renderer/src/types/route";
import { deduplicateRoute } from "./route/deduplicateRoute";
import { resolveToken } from "./route/resolveToken";
import type { ImplementedRouteTasks, RouteOptions } from "./types";

const IGNORED_TOKENS = new Set(["DCT"]);

export class RouteTasks implements ImplementedRouteTasks {
	async computeRoute(
		_event: Electron.CrossProcessExports.IpcMainInvokeEvent,
		rawRoute: string,
		options?: RouteOptions,
	): Promise<RouteWaypoint[]> {
		if (!rawRoute) return [];

		const tokens = rawRoute.toUpperCase().trim().split(" ");
		if (!tokens.length) return [];

		const originIcao = tokens[0];
		const destIcao = tokens[tokens.length - 1];

		const waypointArrays = await Promise.all(
			tokens.map((token, index) => {
				if (IGNORED_TOKENS.has(token) || token.trim() === "") {
					return Promise.resolve([] as RouteWaypoint[]);
				}
				return resolveToken(
					token,
					index,
					tokens,
					originIcao,
					destIcao,
					options,
				);
			}),
		);

		return deduplicateRoute(waypointArrays.flat());
	}
}
