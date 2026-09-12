import { NextResponse } from 'next/server';
import { OLHOS_LAYERS, MOZAMBIQUE } from '@/lib/mozambique';
import { OLHOS_SOURCES } from '@/lib/olhos-source-registry';
import { firmsAreaUrl } from '@/lib/olhos-fire';

export const dynamic = 'force-dynamic';

const MZ = MOZAMBIQUE.bounds;
type FeedResult = { events: any[]; source: any | null; status?: string };

async function earthquakes(): Promise<FeedResult> {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', { next: { revalidate: 60 } });
    if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const feed = await response.json();
    const events = (feed.features ?? []).filter((feature: any) => {
      const [longitude, latitude] = feature.geometry?.coordinates ?? [];
      return Number.isFinite(latitude) && Number.isFinite(longitude) && longitude >= MZ.west && longitude <= MZ.east && latitude >= MZ.south && latitude <= MZ.north;
    }).map((feature: any) => ({
      id: `usgs-${feature.id}`, layer: 'earthquakes', title: `Sismo M${feature.properties?.mag ?? '?'}`,
      summary: feature.properties?.place ?? 'Evento sísmico', severity: Number(feature.properties?.mag ?? 0) >= 5 ? 'warning' : 'info',
      observedAt: new Date(feature.properties?.time ?? Date.now()).toISOString(),
      location: { latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] }, confidence: 1,
      source: { id: 'usgs-earthquakes', name: 'USGS Earthquakes', url: 'https://earthquake.usgs.gov/earthquakes/feed/', access: 'public', retrievedAt: new Date().toISOString() },
      tags: ['USGS', 'GeoJSON'],
    }));
    return { events, source: { id: 'usgs-earthquakes', name: 'USGS Earthquakes', access: 'public' }, status: 'live' };
  } catch { return { events: [], source: null, status: 'error' }; }
}

async function weather() {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(MOZAMBIQUE.center.latitude));
    url.searchParams.set('longitude', String(MOZAMBIQUE.center.longitude));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m');
    url.searchParams.set('timezone', 'Africa/Maputo');
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return { current: null, source: null, status: 'unavailable' };
    const data = await response.json();
    return { current: data.current ?? null, source: { id: 'open-meteo', name: 'Open-Meteo', url: 'https://open-meteo.com/', access: 'public', licenseOrTerms: 'CC BY 4.0', retrievedAt: new Date().toISOString() }, status: 'live' };
  } catch { return { current: null, source: null, status: 'error' }; }
}

function parseCsv(csv: string) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? '']));
  });
}

async function fires(): Promise<FeedResult> {
  const key = process.env.FIRMS_API_KEY;
  if (!key) return { events: [], source: null, status: 'unavailable' };
  try {
    const response = await fetch(firmsAreaUrl(key), { next: { revalidate: 600 } });
    if (!response.ok) return { events: [], source: null, status: 'unavailable' };
    const rows = parseCsv(await response.text());
    const events = rows.map((row: Record<string, string>, index) => {
      const latitude = Number(row.latitude), longitude = Number(row.longitude), confidence = Number(row.confidence);
      const rawTime = String(row.acq_time ?? '0000').padStart(4, '0');
      return {
        id: `firms-${row.acq_date ?? 'unknown'}-${rawTime}-${index}`, layer: 'fires', title: 'Detecção de foco de calor',
        summary: `VIIRS · confiança ${Number.isFinite(confidence) ? confidence : '—'}`,
        severity: confidence >= 80 ? 'warning' : 'info', observedAt: `${row.acq_date ?? ''}T${rawTime.slice(0, 2)}:${rawTime.slice(2)}:00Z`,
        location: { latitude, longitude, region: MOZAMBIQUE.name }, confidence: Number.isFinite(confidence) ? confidence / 100 : undefined,
        source: { id: 'nasa-firms', name: 'NASA FIRMS', url: 'https://firms.modaps.eosdis.nasa.gov/', access: 'public', retrievedAt: new Date().toISOString() },
        tags: ['NASA', 'FIRMS', 'VIIRS'],
      };
    }).filter((event) => Number.isFinite(event.location.latitude) && Number.isFinite(event.location.longitude));
    return { events, source: { id: 'nasa-firms', name: 'NASA FIRMS', access: 'public' }, status: 'live' };
  } catch { return { events: [], source: null, status: 'error' }; }
}

export async function GET() {
  const generatedAt = new Date().toISOString();
  const [earthquakeData, weatherData, fireData] = await Promise.all([earthquakes(), weather(), fires()]);
  const weatherEvent = weatherData.current ? [{ id: 'weather-national-center', layer: 'weather', title: 'Condições meteorológicas nacionais', summary: `${weatherData.current.temperature_2m ?? '—'}°C · vento ${weatherData.current.wind_speed_10m ?? '—'} km/h`, severity: 'info', observedAt: weatherData.current.time ?? generatedAt, location: { latitude: MOZAMBIQUE.center.latitude, longitude: MOZAMBIQUE.center.longitude, region: 'Moçambique' }, confidence: 1, source: weatherData.source, tags: ['weather', 'national-center'] }] : [];
  const events = [...earthquakeData.events, ...weatherEvent, ...fireData.events];
  const counts = Object.fromEntries(OLHOS_LAYERS.map((layer) => [layer.id, events.filter((event: { layer?: string }) => event.layer === layer.id).length]));
  const feeds = { earthquakes: earthquakeData.status ?? 'unavailable', weather: weatherData.status, fires: fireData.status ?? 'unavailable' };
  const liveFeedCount = Object.values(feeds).filter((value) => value === 'live').length;
  return NextResponse.json({ project: 'OLHOS DE DEUS', country: MOZAMBIQUE, generatedAt, mode: 'public-and-authorized-data', layers: OLHOS_LAYERS, sources: OLHOS_SOURCES, availableSources: [earthquakeData.source, weatherData.source, fireData.source].filter(Boolean), events, counts: { total: events.length, ...counts }, health: { status: liveFeedCount > 0 ? 'live' : 'degraded', feeds } });
}
