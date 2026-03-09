import { api } from "./api";

class GeoService {
	async loadAirportOSM(icao: string) {
		const { data } = await api.get<any>(`/geo/airports/${icao}`);

		return data;
	}
}

export const geoService = new GeoService();
