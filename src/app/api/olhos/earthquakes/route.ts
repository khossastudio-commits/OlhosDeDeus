import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MZ = { west: 30.2, south: -26.9, east: 41.9, north: -10.3 };

export async function GET() {
  try {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', { next: { revalidate: 60 } });
    if (!response.ok) throw new Error(`USGS ${response.status}`);
    const feed = await response.json();
    const events = (feed.features ?? []).filter((f: any) => {
      const [lng, lat] = f.geometry?.coordinates ?? [];
      return Number.isFinite(lat) && Number.isFinite(lng) && lng >= MZ.west && lng <= MZ.east && lat >= MZ.south && lat <= MZ.north;
    }).map((f: any) => ({
      id: `usgs-${f.id}`,
      layer: 'earthquakes',
      title: `Sismo M${f.properties?.mag ?? '?'}`,
      summary: f.properties?.place ?? 'Evento sísmico',
      severity: Number(f.properties?.mag ?? 0) >= 5 ? 'warning' : 'info',
      observedAt: new Date(f.properties?.time ?? Date.now()).toISOString(),
      location: { latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] },
      confidence: 1,
      source: { id: 'usgs-earthquakes', name: 'USGS Earthquakes', url: 'https://earthquake.usgs.gov/earthquakes/feed/', access: 'public', retrievedAt: new Date().toISOString() },
      tags: ['USGS', 'GeoJSON'],
    }));
    return NextResponse.json({ source: 'USGS Earthquakes', events });
  } catch (error) {
    return NextResponse.json({ source: 'USGS Earthquakes', events: [], error: error instanceof Error ? error.message : 'feed unavailable' }, { status: 502 });
  }
}
