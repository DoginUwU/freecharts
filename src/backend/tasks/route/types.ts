export interface ProcedureLegRow {
	ident: string;
	transition: string | null;
	sequence: number;
}

export interface AirwayNode {
	next: string;
	lat: number;
	lon: number;
}
