import { Airfield, Chart } from "../types/airfield";
import { api } from "./api";

export class AirfieldService {
  static async findByICAO(icao: string) {
    const { data } = await api.get<Airfield>(`/airfields/${icao}`);

    return data;
  }

  static async findChartsByICAO(icao: string) {
    const { data } = await api.get<Chart[]>(`/airfields/${icao}/charts`);

    return data;
  }

  static async loadChart(icao: string, chartId: string) {
    const { data } = await api.get<Buffer<ArrayBufferLike>>(
      `/airfields/${icao}/charts/${chartId}`,
      {
        responseType: "arraybuffer",
      },
    );

    return data;
  }
}
