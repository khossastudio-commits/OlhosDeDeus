/** Public/authorized source registry for OLHOS DE DEUS. */
export const OLHOS_SOURCES = [
  { id: 'usgs-earthquakes', name: 'USGS Earthquakes', layer: 'earthquakes', access: 'public', url: 'https://earthquake.usgs.gov/earthquakes/feed/' },
  { id: 'open-meteo', name: 'Open-Meteo', layer: 'weather', access: 'public', url: 'https://open-meteo.com/' },
  { id: 'nasa-firms', name: 'NASA FIRMS', layer: 'fires', access: 'public', url: 'https://firms.modaps.eosdis.nasa.gov/' },
  { id: 'opensky', name: 'OpenSky Network', layer: 'aviation', access: 'public', url: 'https://opensky-network.org/data/api/' },
  { id: 'gdacs', name: 'Global Disaster Alert and Coordination System', layer: 'disasters', access: 'public', url: 'https://www.gdacs.org/' },
  { id: 'gdelt', name: 'GDELT Project', layer: 'news', access: 'public', url: 'https://www.gdeltproject.org/' },
  { id: 'authorized-ais', name: 'Authorized AIS provider', layer: 'maritime', access: 'authorized', url: '' },
  { id: 'authorized-cameras', name: 'Authorized public camera registry', layer: 'cameras', access: 'authorized', url: '' },
  { id: 'authorized-satellite', name: 'Authorized satellite provider', layer: 'satellites', access: 'authorized', url: '' },
] as const;

export type OlhosSourceId = (typeof OLHOS_SOURCES)[number]['id'];
