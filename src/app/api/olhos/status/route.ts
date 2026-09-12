import { NextResponse } from 'next/server';
import { MOZAMBIQUE, OLHOS_LAYERS } from '@/lib/mozambique';
import type { NationalSituationSnapshot } from '@/lib/olhos-intelligence';

export const dynamic = 'force-dynamic';

/**
 * Lightweight national status contract.
 *
 * This endpoint intentionally returns configuration/status only. Live feeds
 * should be added as individually sourced adapters rather than hidden inside
 * the route.
 */
export async function GET() {
  const snapshot: NationalSituationSnapshot = {
    country: 'MZ',
    generatedAt: new Date().toISOString(),
    events: [],
    activeLayers: OLHOS_LAYERS.map((layer) => layer.id),
  };

  return NextResponse.json({
    project: 'OLHOS DE DEUS',
    status: 'operational',
    area: {
      country: MOZAMBIQUE.name,
      code: MOZAMBIQUE.countryCode,
      center: MOZAMBIQUE.center,
      bounds: MOZAMBIQUE.bounds,
    },
    governance: {
      mode: 'public-and-authorized-data',
      privateDataAccess: false,
      unauthorizedMonitoring: false,
    },
    snapshot,
  });
}
