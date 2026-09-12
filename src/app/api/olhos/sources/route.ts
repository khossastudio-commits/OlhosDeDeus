import { NextResponse } from 'next/server';
import { OLHOS_SOURCE_REGISTRY } from '@/lib/olhos-sources';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    project: 'OLHOS DE DEUS',
    mode: 'public-and-authorized-data',
    generatedAt: new Date().toISOString(),
    sources: OLHOS_SOURCE_REGISTRY,
  });
}
