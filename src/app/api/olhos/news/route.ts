import { NextResponse } from 'next/server';
import { getNews } from '@/lib/olhos-feeds';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getNews();
  return NextResponse.json({ project: 'OLHOS DE DEUS', ...result });
}
