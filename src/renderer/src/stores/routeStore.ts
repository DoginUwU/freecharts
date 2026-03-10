import { defineStore } from "pinia";
import type { RouteWaypoint } from "../types/route";

export const useRouteStore = defineStore("route", {
	state: () => ({
		currentRawRoute: "SBLO AKRA1A AKTIT UZ65 ANSOK UZ42 ZARES MOLE1A SBGR",
		currentWaypoints: [] as RouteWaypoint[],
		departureRunway: "",
		arrivalRunway: "",
		currentLoadedRouteKey: "",
	}),
	getters: {},
	actions: {
		async computeCurrentRoute() {
			if (!this.currentRawRoute) {
				this.currentWaypoints = [];
				return;
			}

			const currentKey =
				this.currentRawRoute + this.departureRunway + this.arrivalRunway;

			if (currentKey === this.currentLoadedRouteKey) {
				return;
			}

			const validPoints = await window.api.computeRoute(this.currentRawRoute, {
				departureRunway: this.departureRunway,
				arrivalRunway: this.arrivalRunway,
			});

			this.currentWaypoints = validPoints;
			this.currentLoadedRouteKey = currentKey;
		},
	},
});
