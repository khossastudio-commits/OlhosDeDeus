import { NextResponse } from 'next/server';
import { getDisasters } from '@/lib/olhos-feeds';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getDisasters();
  return NextResponse.json({ project: 'OLHOS DE DEUS', ...result });
}
