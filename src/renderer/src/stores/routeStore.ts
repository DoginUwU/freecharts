import { defineStore } from "pinia";

interface RouteWaypoint {
	ident: string;
	type: "airport" | "waypoint" | "invalid";
	lat: number;
	lon: number;
}

export const useRouteStore = defineStore("route", {
	state: () => ({
		currentRawRoute: "SBRJ PUMS3C ISRIN EPKAX DAKDA SBCF",
		currentWaypoints: [] as RouteWaypoint[],
		latestLoadedRawRoute: "",
	}),
	actions: {
		async computeCurrentRoute() {
			if (!this.currentRawRoute) {
				this.currentWaypoints = [];
				return;
			}

			if (this.currentRawRoute === this.latestLoadedRawRoute) {
				return;
			}

			const fixes = this.currentRawRoute.toUpperCase().trim().split(" ");

			if (fixes.length === 0) {
				this.currentWaypoints = [];
				return;
			}

			const RMKS_WAYPOINTS = ["DCT"];

			const data = fixes.map<Promise<RouteWaypoint | null>>(async (fix) => {
				if (RMKS_WAYPOINTS.includes(fix) || fix.trim() === "") {
					return null;
				}

				const airport = await window.api
					.getAirportByIcao(fix)
					.catch(() => null);
				if (airport) {
					return {
						ident: fix,
						type: "airport",
						lat: airport.lat,
						lon: airport.lon,
					};
				}

				const waypoint = await window.api
					.getWaypointByIdent(fix)
					.catch(() => null);
				if (waypoint) {
					return {
						ident: fix,
						type: "waypoint",
						lat: waypoint.lat,
						lon: waypoint.lon,
					};
				}

				return {
					ident: fix,
					type: "invalid",
					lat: 0,
					lon: 0,
				};
			});

			const resolvedData = await Promise.all(data);
			const validPoints = resolvedData.filter(
				(point): point is NonNullable<typeof point> => point !== null,
			);

			this.currentWaypoints = validPoints;
			this.latestLoadedRawRoute = this.currentRawRoute;
		},
	},
});
