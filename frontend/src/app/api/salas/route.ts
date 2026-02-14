import { NextResponse } from 'next/server';
import { getSalas } from '@/lib/dados';

export async function GET() {
  const salas = await getSalas();
  return NextResponse.json(salas);
}
