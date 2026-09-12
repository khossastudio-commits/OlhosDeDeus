/** Public/authorized source registry for OLHOS DE DEUS. */
export const OLHOS_SOURCES = [
  { id: 'usgs-earthquakes', name: 'USGS Earthquakes', layer: 'earthquakes', access: 'public', url: 'https://earthquake.usgs.gov/earthquakes/feed/' },
  { id: 'open-meteo', name: 'Open-Meteo', layer: 'weather', access: 'public', url: 'https://open-meteo.com/' },
  { id: 'nasa-firms', name: 'NASA FIRMS', layer: 'fires', access: 'public', url: 'https://firms.modaps.eosdis.nasa.gov/' },
] as const;

export type OlhosSourceId = (typeof OLHOS_SOURCES)[number]['id'];
