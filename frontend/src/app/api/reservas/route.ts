import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { sessaoId, nomeCliente, emailCliente, poltronas, total } = body;

  if (!sessaoId || !nomeCliente || !emailCliente || !poltronas || poltronas.length === 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  const reserva = {
    id: Math.floor(Math.random() * 10000),
    sessaoId,
    nomeCliente,
    emailCliente,
    poltronas,
    total,
    status: 'confirmada' as const,
    createdAt: new Date().toISOString()
  };

  return NextResponse.json(reserva);
}
