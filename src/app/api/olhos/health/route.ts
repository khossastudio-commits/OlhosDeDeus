import { NextResponse } from 'next/server';
import { getOptionalFeedStatus } from '@/lib/olhos-feeds';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    project: 'OLHOS DE DEUS',
    status: 'operational',
    generatedAt: new Date().toISOString(),
    governance: 'public-and-authorized-data',
    optionalIntegrations: getOptionalFeedStatus(),
    checks: {
      overview: '/api/olhos/overview',
      aviation: '/api/olhos/aviation',
      disasters: '/api/olhos/disasters',
      news: '/api/olhos/news',
    },
  });
}
