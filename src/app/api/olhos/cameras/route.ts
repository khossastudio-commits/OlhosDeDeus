import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_CCTV_API = 'https://osirisai.live/api/cctv?region=all';

export async function GET() {
  const endpoint = process.env.OSIRIS_CCTV_API_URL || DEFAULT_CCTV_API;

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 60 },
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`CCTV catalogue ${response.status}`);
    }

    const payload = await response.json();
    const cameras = Array.isArray(payload?.cameras) ? payload.cameras : [];

    const normalized = cameras
      .map((camera: any) => ({
        id: String(camera.id ?? `cctv-${camera.lat}-${camera.lng}`),
        lat: Number(camera.lat),
        lng: Number(camera.lng),
        name: String(camera.name ?? 'Public camera'),
        city: String(camera.city ?? ''),
        country: String(camera.country ?? ''),
        source: String(camera.source ?? 'Public source'),
        feed_url: camera.feed_url ? String(camera.feed_url) : undefined,
        stream_url: camera.stream_url ? String(camera.stream_url) : undefined,
        stream_type: camera.stream_type ? String(camera.stream_type) : undefined,
        external_url: camera.external_url ? String(camera.external_url) : undefined,
        publisher: camera.publisher ? String(camera.publisher) : undefined,
      }))
      .filter((camera: any) => Number.isFinite(camera.lat) && Number.isFinite(camera.lng));

    return NextResponse.json({
      source: 'OSIRIS public CCTV catalogue',
      access: 'public',
      retrievedAt: new Date().toISOString(),
      cameras: normalized,
      count: normalized.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: 'OSIRIS public CCTV catalogue',
        access: 'public',
        cameras: [],
        count: 0,
        status: 'error',
        reason: error instanceof Error ? error.message : 'camera catalogue unavailable',
      },
      { status: 502 },
    );
  }
}
