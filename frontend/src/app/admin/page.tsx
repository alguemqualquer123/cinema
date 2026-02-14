import { Metadata } from 'next';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';

export const metadata: Metadata = {
  title: 'Painel Administrativo | Cinemark',
  description: 'Gerencie filmes, salas e sessoes.',
};

export default function AdminPage() {
  const cards = [
    {
      title: 'Filmes',
      description: 'Gerencie os filmes em cartaz',
      href: '/admin/filmes',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      color: 'bg-[var(--primary)]'
    },
    {
      title: 'Salas',
      description: 'Gerencie as salas de exibicao',
      href: '/admin/salas',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'bg-blue-600'
    },
    {
      title: 'Sessoes',
      description: 'Gerencie os horarios das sessoes',
      href: '/admin/sessoes',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-1 bg-[var(--primary)] rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold">Painel de Administracao</h1>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, idx) => (
            <FadeIn key={card.href} delay={idx * 0.1} direction="up">
              <Link
                href={card.href}
                className="group bg-[var(--card)] rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 border border-[var(--border)] hover:border-[var(--primary)]"
              >
                <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h2 className="text-2xl font-bold mb-3">{card.title}</h2>
                <p className="text-zinc-500">{card.description}</p>
              </Link>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)]">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-[var(--primary)] rounded-full" />
              Estatisticas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-[var(--background)] rounded-xl">
                <div className="text-4xl font-bold text-[var(--primary)]">6</div>
                <div className="text-zinc-500 mt-2">Filmes</div>
              </div>
              <div className="text-center p-6 bg-[var(--background)] rounded-xl">
                <div className="text-4xl font-bold text-blue-500">5</div>
                <div className="text-zinc-500 mt-2">Salas</div>
              </div>
              <div className="text-center p-6 bg-[var(--background)] rounded-xl">
                <div className="text-4xl font-bold text-green-500">168</div>
                <div className="text-zinc-500 mt-2">Sessoes</div>
              </div>
              <div className="text-center p-6 bg-[var(--background)] rounded-xl">
                <div className="text-4xl font-bold text-yellow-500">0</div>
                <div className="text-zinc-500 mt-2">Reservas</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
