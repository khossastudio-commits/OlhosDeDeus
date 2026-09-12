import { NextResponse } from 'next/server';
import { getAviation } from '@/lib/olhos-feeds';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getAviation();
  return NextResponse.json({ project: 'OLHOS DE DEUS', ...result });
}
