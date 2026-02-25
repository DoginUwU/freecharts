import type { Airfield, Chart } from "../types/airfield";
import { api } from "./api";

class AirfieldService {
	async findByICAO(icao: string) {
		const { data } = await api.get<Airfield>(`/airfields/${icao}`);

		return data;
	}

	async findChartsByICAO(icao: string) {
		const { data } = await api.get<Chart[]>(`/airfields/${icao}/charts`);

		return data;
	}

	async loadChart(icao: string, chartId: string) {
		const { data } = await api.get<Buffer<ArrayBufferLike>>(
			`/airfields/${icao}/charts/${chartId}`,
			{
				responseType: "arraybuffer",
			},
		);

		return data;
	}
}

export const airfieldService = new AirfieldService();
