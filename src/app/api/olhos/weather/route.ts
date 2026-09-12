import { NextResponse } from 'next/server';
import { MOZAMBIQUE } from '@/lib/mozambique';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { latitude, longitude } = MOZAMBIQUE.center;
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m');
  url.searchParams.set('timezone', 'Africa/Maputo');

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);
    const data = await response.json();
    return NextResponse.json({
      source: {
        id: 'open-meteo',
        name: 'Open-Meteo',
        url: 'https://open-meteo.com/',
        access: 'public',
        licenseOrTerms: 'CC BY 4.0',
        retrievedAt: new Date().toISOString(),
      },
      location: { latitude, longitude, country: 'MZ' },
      current: data.current ?? null,
      units: data.current_units ?? {},
    });
  } catch (error) {
    return NextResponse.json({
      source: { id: 'open-meteo', name: 'Open-Meteo', access: 'public', retrievedAt: new Date().toISOString() },
      location: { latitude, longitude, country: 'MZ' },
      current: null,
      error: error instanceof Error ? error.message : 'weather feed unavailable',
    }, { status: 502 });
  }
}
