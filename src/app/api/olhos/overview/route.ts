import { NextResponse } from 'next/server';
import { OLHOS_LAYERS, MOZAMBIQUE } from '@/lib/mozambique';
import { OLHOS_SOURCES } from '@/lib/olhos-source-registry';

export const dynamic = 'force-dynamic';

async function readJson(path: string) {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${base}${path}`, { cache: 'no-store' });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const generatedAt = new Date().toISOString();
  const [earthquakeData, weatherData] = await Promise.all([
    readJson('/api/olhos/earthquakes'),
    readJson('/api/olhos/weather'),
  ]);

  const earthquakeEvents = earthquakeData?.events ?? [];
  const weatherCurrent = weatherData?.current ?? null;
  const weatherEvent = weatherCurrent
    ? [{
        id: 'weather-national-center',
        layer: 'weather',
        title: 'Condições meteorológicas nacionais',
        summary: `${weatherCurrent.temperature_2m ?? '—'}°C · vento ${weatherCurrent.wind_speed_10m ?? '—'} km/h`,
        severity: 'info',
        observedAt: weatherCurrent.time ?? generatedAt,
        location: { latitude: MOZAMBIQUE.center.latitude, longitude: MOZAMBIQUE.center.longitude, region: 'Moçambique' },
        confidence: 1,
        source: weatherData.source,
        tags: ['weather', 'national-center'],
      }]
    : [];

  const events = [...earthquakeEvents, ...weatherEvent];
  const counts = Object.fromEntries(OLHOS_LAYERS.map((layer) => [layer.id, events.filter((event: { layer?: string }) => event.layer === layer.id).length]));
  const availableSources = [earthquakeData?.source, weatherData?.source].filter(Boolean);

  return NextResponse.json({
    project: 'OLHOS DE DEUS',
    country: MOZAMBIQUE,
    generatedAt,
    mode: 'public-and-authorized-data',
    layers: OLHOS_LAYERS,
    sources: OLHOS_SOURCES,
    availableSources,
    events,
    counts: { total: events.length, ...counts },
    health: {
      status: events.length > 0 ? 'live' : 'degraded',
      feeds: {
        earthquakes: earthquakeData ? 'live' : 'unavailable',
        weather: weatherData?.current ? 'live' : 'unavailable',
      },
    },
  });
}
