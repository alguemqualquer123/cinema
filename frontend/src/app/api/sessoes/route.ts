import { NextResponse } from 'next/server';
import { getSessoesByFilme, getAllSessoes } from '@/lib/dados';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filmeId = searchParams.get('filmeId');
  
  if (filmeId) {
    const sessoes = await getSessoesByFilme(parseInt(filmeId));
    return NextResponse.json(sessoes);
  }
  
  const sessoes = await getAllSessoes();
  return NextResponse.json(sessoes);
}
