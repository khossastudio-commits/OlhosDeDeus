import { NextResponse } from 'next/server';
import { OLHOS_LAYERS, MOZAMBIQUE } from '@/lib/mozambique';
import { OLHOS_SOURCES } from '@/lib/olhos-source-registry';
import { getAviation, getDisasters, getEarthquakes, getFires, getNews, getOptionalFeedStatus, getWeather } from '@/lib/olhos-feeds';

export const dynamic = 'force-dynamic';

function buildAlerts(events: any[]) {
  return events.filter((event) => event.severity === 'critical' || event.severity === 'warning').map((event) => ({
    ...event,
    layer: 'alerts',
    id: `alert-${event.id}`,
    title: `ALERTA · ${event.title}`,
    tags: [...(event.tags ?? []), 'derived-alert'],
  }));
}

export async function GET() {
  const generatedAt = new Date().toISOString();
  const [earthquakes, weather, fires, aviation, disasters, news] = await Promise.all([
    getEarthquakes(), getWeather(), getFires(), getAviation(), getDisasters(), getNews(),
  ]);

  const primaryEvents = [
    ...earthquakes.events,
    ...weather.events,
    ...fires.events,
    ...aviation.events,
    ...disasters.events,
    ...news.events,
  ];
  const alerts = buildAlerts(primaryEvents);
  const events = [...primaryEvents, ...alerts];
  const counts = Object.fromEntries(OLHOS_LAYERS.map((layer) => [layer.id, events.filter((event) => event.layer === layer.id).length]));
  const feeds = {
    earthquakes: earthquakes.status,
    weather: weather.status,
    fires: fires.status,
    aviation: aviation.status,
    disasters: disasters.status,
    news: news.status,
  };
  const liveFeedCount = Object.values(feeds).filter((value) => value === 'live').length;

  return NextResponse.json({
    project: 'OLHOS DE DEUS', country: MOZAMBIQUE, generatedAt,
    mode: 'public-and-authorized-data',
    layers: OLHOS_LAYERS,
    sources: OLHOS_SOURCES,
    availableSources: [earthquakes.source, weather.source, fires.source, aviation.source, disasters.source, news.source].filter(Boolean),
    optionalIntegrations: getOptionalFeedStatus(),
    events,
    counts: { total: events.length, ...counts },
    health: { status: liveFeedCount > 0 ? 'live' : 'degraded', feeds, liveFeedCount, totalFeeds: Object.keys(feeds).length },
    governance: {
      privateDataAccess: false,
      unauthorizedMonitoring: false,
      derivedAlerts: 'machine-generated from public feed observations; human verification required for operational decisions',
    },
  });
}
