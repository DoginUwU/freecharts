import { airfieldService } from "../services/AirfieldService";
import type { Chart } from "../types/airfield";

export function createChartFileName(chart: Chart): string {
	return `${chart.id}.pdf`;
}

export async function bufferFromChart(chart: Chart): Promise<Buffer> {
	const pdfFile = createChartFileName(chart);
	let buffer = await window.api.findCachedFile(pdfFile);

	if (!buffer) {
		buffer = await airfieldService.loadChart(chart.icao, chart.id);

		if (!buffer) {
			throw new Error(`Não foi possível carregar a carta ${chart.id} do aeródromo ${chart.icao}.`);
		}

		await window.api.cacheFile(pdfFile, buffer);
	}

	return buffer;
}