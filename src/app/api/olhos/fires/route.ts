import { NextResponse } from 'next/server';
import { firmsAreaUrl } from '@/lib/olhos-fire';
import { MOZAMBIQUE } from '@/lib/mozambique';

export const dynamic = 'force-dynamic';

function parseCsv(csv: string) {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() ?? '']));
  });
}

export async function GET() {
  const key = process.env.FIRMS_API_KEY;
  if (!key) {
    return NextResponse.json({ source: 'NASA FIRMS', events: [], status: 'unavailable', reason: 'FIRMS_API_KEY is not configured' });
  }

  try {
    const response = await fetch(firmsAreaUrl(key), { next: { revalidate: 600 } });
    if (!response.ok) throw new Error(`NASA FIRMS ${response.status}`);
    const rows = parseCsv(await response.text());
    const events = rows.map((row: Record<string, string>, index) => {
      const latitude = Number(row.latitude);
      const longitude = Number(row.longitude);
      const confidence = Number(row.confidence);
      return {
        id: `firms-${row.acq_date ?? 'unknown'}-${row.acq_time ?? 'unknown'}-${index}`,
        layer: 'fires',
        title: 'Detecção de foco de calor',
        summary: `VIIRS · confiança ${Number.isFinite(confidence) ? confidence : '—'}`,
        severity: confidence >= 80 ? 'warning' : 'info',
        observedAt: `${row.acq_date ?? ''}T${String(row.acq_time ?? '0000').padStart(4, '0').slice(0, 2)}:${String(row.acq_time ?? '0000').padStart(4, '0').slice(2)}:00Z`,
        location: { latitude, longitude, region: MOZAMBIQUE.name },
        confidence: Number.isFinite(confidence) ? confidence / 100 : undefined,
        source: {
          id: 'nasa-firms',
          name: 'NASA FIRMS',
          url: 'https://firms.modaps.eosdis.nasa.gov/',
          access: 'public',
          retrievedAt: new Date().toISOString(),
        },
        tags: ['NASA', 'FIRMS', 'VIIRS'],
      };
    }).filter((event) => Number.isFinite(event.location.latitude) && Number.isFinite(event.location.longitude));

    return NextResponse.json({ source: 'NASA FIRMS', events, status: 'live' });
  } catch (error) {
    return NextResponse.json({ source: 'NASA FIRMS', events: [], status: 'error', reason: error instanceof Error ? error.message : 'feed unavailable' }, { status: 502 });
  }
}
