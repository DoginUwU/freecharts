export interface RouteWaypoint {
	ident: string;
	type: "airport" | "waypoint" | "procedure" | "airway" | "invalid";
	lat: number;
	lon: number;
}
