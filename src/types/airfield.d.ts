export interface Airfield {
  icao: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export interface Chart {
  id: string;
  type: ChartType;
  subType: ChartSubType;
  name: string;
  icao: string;
}

export type ChartType = "GRD" | "APP" | "SID" | "STAR" | "VAC";
export type ChartSubType = string | null;
