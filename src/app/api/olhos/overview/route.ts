import { NextResponse } from 'next/server';
import { OLHOS_LAYERS, MOZAMBIQUE } from '@/lib/mozambique';
import { OLHOS_SOURCES } from '@/lib/olhos-source-registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  const generatedAt = new Date().toISOString();
  const result = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/olhos/earthquakes`, { cache: 'no-store' }).catch(() => null);
  const earthquakes = result?.ok ? await result.json().catch(() => ({ events: [] })) : { events: [] };
  const events = earthquakes.events ?? [];
  return NextResponse.json({
    project: 'OLHOS DE DEUS',
    country: MOZAMBIQUE,
    generatedAt,
    mode: 'public-and-authorized-data',
    layers: OLHOS_LAYERS,
    sources: OLHOS_SOURCES,
    events,
    counts: { total: events.length, earthquakes: events.length },
  });
}
