'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import { api } from '@/lib/api';

interface Ticket {
  id: number;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
  price: number;
  seatInfo: string;
  validatedAt?: string;
  order?: {
    id: number;
    session: {
      id: number;
      startTime: string;
      movie: {
        title: string;
        posterUrl?: string;
      };
      sala: {
        name: string;
      };
    };
  };
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const data = await api.getMyTickets(token);
        setTickets(data);
      } catch (err) {
        setError('Erro ao carregar tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Válido</span>;
      case 'used':
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">Utilizado</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">Cancelado</span>;
      default:
        return <span className="px-3 py-1 bg-zinc-500/20 text-zinc-400 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const generateBarcode = (code: string) => {
    const bars = code.split('').map((char, i) => {
      const height = 30 + (char.charCodeAt(0) % 35);
      const width = Math.random() > 0.5 ? 2 : 3;
      return (
        <div
          key={i}
          className="bg-black"
          style={{ width: `${width}px`, height: `${height}px`, display: 'inline-block' }}
        />
      );
    });
    return bars;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <FadeIn>
          <h1 className="text-3xl font-bold text-white mb-8">Meus Ingressos</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {tickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[var(--card)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Nenhum ingresso ainda</h2>
              <p className="text-zinc-400 mb-6">Reserve seus filmes favoritos para ver seus ingressos aqui</p>
              <Link href="/filmes" className="inline-block bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Ver filmes em cartaz
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)]">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {ticket.order?.session?.movie?.title || 'Filme'}
                        </h3>
                        <p className="text-zinc-400 text-sm">
                          {ticket.order?.session?.startTime 
                            ? new Date(ticket.order.session.startTime).toLocaleDateString('pt-BR', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </p>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-zinc-400">Sala</p>
                        <p className="text-white font-medium">{ticket.order?.session?.sala?.name || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-zinc-400">Assento</p>
                        <p className="text-white font-bold text-lg">{ticket.seatInfo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900 p-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-3 rounded-lg mb-3">
                        <div className="flex gap-0.5">
                          {generateBarcode(ticket.qrCode)}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">{ticket.qrCode}</p>
                    </div>
                  </div>

                  {ticket.status === 'used' && ticket.validatedAt && (
                    <div className="bg-yellow-900/20 border-t border-yellow-500/30 px-4 py-2">
                      <p className="text-yellow-400 text-sm text-center">
                        ✓ Validado em {new Date(ticket.validatedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
