import { NextResponse } from 'next/server';
import { getFilmesEmCartaz, getFilmeById } from '@/lib/dados';

export async function GET() {
  const filmes = await getFilmesEmCartaz();
  return NextResponse.json(filmes);
}
