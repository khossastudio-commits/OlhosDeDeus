import { NextResponse } from 'next/server';
import { OLHOS_LAYERS, MOZAMBIQUE } from '@/lib/mozambique';
import { OLHOS_SOURCES } from '@/lib/olhos-source-registry';

export const dynamic = 'force-dynamic';

const MZ = MOZAMBIQUE.bounds;

async function earthquakes() {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', { next: { revalidate: 60 } });
    if (!response.ok) return { events: [], source: null };
    const feed = await response.json();
    const events = (feed.features ?? []).filter((feature: any) => {
      const [longitude, latitude] = feature.geometry?.coordinates ?? [];
      return Number.isFinite(latitude) && Number.isFinite(longitude) && longitude >= MZ.west && longitude <= MZ.east && latitude >= MZ.south && latitude <= MZ.north;
    }).map((feature: any) => ({
      id: `usgs-${feature.id}`,
      layer: 'earthquakes',
      title: `Sismo M${feature.properties?.mag ?? '?'}`,
      summary: feature.properties?.place ?? 'Evento sísmico',
      severity: Number(feature.properties?.mag ?? 0) >= 5 ? 'warning' : 'info',
      observedAt: new Date(feature.properties?.time ?? Date.now()).toISOString(),
      location: { latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] },
      confidence: 1,
      source: { id: 'usgs-earthquakes', name: 'USGS Earthquakes', url: 'https://earthquake.usgs.gov/earthquakes/feed/', access: 'public', retrievedAt: new Date().toISOString() },
      tags: ['USGS', 'GeoJSON'],
    }));
    return { events, source: { id: 'usgs-earthquakes', name: 'USGS Earthquakes', access: 'public' } };
  } catch {
    return { events: [], source: null };
  }
}

async function weather() {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(MOZAMBIQUE.center.latitude));
    url.searchParams.set('longitude', String(MOZAMBIQUE.center.longitude));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m');
    url.searchParams.set('timezone', 'Africa/Maputo');
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return { current: null, source: null };
    const data = await response.json();
    return {
      current: data.current ?? null,
      source: { id: 'open-meteo', name: 'Open-Meteo', url: 'https://open-meteo.com/', access: 'public', licenseOrTerms: 'CC BY 4.0', retrievedAt: new Date().toISOString() },
    };
  } catch {
    return { current: null, source: null };
  }
}

export async function GET() {
  const generatedAt = new Date().toISOString();
  const [earthquakeData, weatherData] = await Promise.all([earthquakes(), weather()]);
  const weatherEvent = weatherData.current ? [{
    id: 'weather-national-center',
    layer: 'weather',
    title: 'Condições meteorológicas nacionais',
    summary: `${weatherData.current.temperature_2m ?? '—'}°C · vento ${weatherData.current.wind_speed_10m ?? '—'} km/h`,
    severity: 'info',
    observedAt: weatherData.current.time ?? generatedAt,
    location: { latitude: MOZAMBIQUE.center.latitude, longitude: MOZAMBIQUE.center.longitude, region: 'Moçambique' },
    confidence: 1,
    source: weatherData.source,
    tags: ['weather', 'national-center'],
  }] : [];
  const events = [...earthquakeData.events, ...weatherEvent];
  const counts = Object.fromEntries(OLHOS_LAYERS.map((layer) => [layer.id, events.filter((event: { layer?: string }) => event.layer === layer.id).length]));
  const feeds = {
    earthquakes: earthquakeData.source ? 'live' : 'unavailable',
    weather: weatherData.source ? 'live' : 'unavailable',
  };
  const liveFeedCount = Object.values(feeds).filter((value) => value === 'live').length;

  return NextResponse.json({
    project: 'OLHOS DE DEUS',
    country: MOZAMBIQUE,
    generatedAt,
    mode: 'public-and-authorized-data',
    layers: OLHOS_LAYERS,
    sources: OLHOS_SOURCES,
    availableSources: [earthquakeData.source, weatherData.source].filter(Boolean),
    events,
    counts: { total: events.length, ...counts },
    health: { status: liveFeedCount > 0 ? 'live' : 'degraded', feeds },
  });
}
