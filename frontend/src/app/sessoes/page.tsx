import { Metadata } from 'next';
import Link from 'next/link';
import { getAllSessoes, getFilmesEmCartaz } from '@/lib/dados';
import FadeIn from '@/components/FadeIn';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sessoes | Cinemark',
  description: 'Veja os horarios de todas as sessoes e reserve seus ingresso online.',
};

export default async function SessoesPage() {
  const sessoes = await getAllSessoes();
  const filmes = await getFilmesEmCartaz();

  const formatarData = (data: string) => {
    const d = new Date(data);
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    if (data === hoje.toISOString().split('T')[0]) {
      return 'Hoje';
    }
    if (data === amanha.toISOString().split('T')[0]) {
      return 'Amanha';
    }
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const tipoSalaLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      normal: '2D',
      '3d': '3D',
      imax: 'IMAX',
      vip: 'VIP'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-1 bg-[var(--primary)] rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold">Todas as Sessoes</h1>
          </div>
        </FadeIn>

        <div className="space-y-8">
          {filmes.map((filme, idx) => {
            const sessoesFilme = sessoes.filter(s => s.filmeId === filme.id);
            if (sessoesFilme.length === 0) return null;

            const sessoesAgrupadas = sessoesFilme.reduce((acc, sessao) => {
              const data = sessao.data;
              if (!acc[data]) {
                acc[data] = [];
              }
              acc[data].push(sessao);
              return acc;
            }, {} as Record<string, typeof sessoesFilme>);

            return (
              <FadeIn key={filme.id} delay={idx * 0.1} direction="up">
                <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)]">
                  <div className="flex items-center gap-6 p-6 border-b border-[var(--border)]">
                    <img 
                      src={filme.imagem || PLACEHOLDER_IMAGE} 
                      alt={filme.titulo}
                      className="w-20 h-28 object-cover rounded-xl shadow-lg"
                    />
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{filme.titulo}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                        <span>{filme.duracao} min</span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                        <span>{filme.genero}</span>
                        <span className="bg-[var(--primary)] text-white text-xs px-2 py-0.5 rounded-full">
                          {filme.classificacao}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {Object.entries(sessoesAgrupadas).map(([data, sessoesData]) => (
                      <div key={data} className="mb-6 last:mb-0">
                        <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                          {formatarData(data)}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {sessoesData.map((sessao) => (
                            <Link
                              key={sessao.id}
                              href={`/reserva/${sessao.id}`}
                              className="flex items-center gap-3 px-5 py-3 bg-[var(--background)] hover:bg-[var(--primary)] rounded-xl transition-all duration-300 group border border-[var(--border)] hover:border-[var(--primary)]"
                            >
                              <span className="font-bold text-lg">{sessao.horario}</span>
                              <span className="text-xs text-zinc-500 bg-[var(--card)] px-2 py-1 rounded group-hover:bg-white/20">
                                {tipoSalaLabel(sessao.sala?.tipo || 'normal')}
                              </span>
                              <span className="text-sm font-medium text-[var(--primary)] group-hover:text-white">
                                R$ {sessao.preco.toFixed(2)}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
