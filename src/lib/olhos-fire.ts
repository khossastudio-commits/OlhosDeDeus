export interface FireDetection {
  latitude: number;
  longitude: number;
  observedAt: string;
  confidence?: number;
  source: string;
}

/** FIRMS requires a MAP_KEY for its programmatic area endpoint. Keep the key server-side. */
export function firmsAreaUrl(mapKey: string, area = '30.2,-26.9,41.9,-10.3', days = 1) {
  return `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${encodeURIComponent(mapKey)}/VIIRS_SNPP_NRT/${area}/${days}`;
}
