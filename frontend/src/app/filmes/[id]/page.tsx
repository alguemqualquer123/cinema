import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFilmeById, getSessoesByFilme } from '@/lib/dados';
import FadeIn from '@/components/FadeIn';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const filme = await getFilmeById(id);

  if (!filme) {
    return { title: 'Filme nao encontrado | Cinemark' };
  }

  return {
    title: `${filme.titulo} | Cinemark`,
    description: `${filme.descricao} - ${filme.duracao} minutos. Classificacao: ${filme.classificacao}.`,
    openGraph: {
      title: filme.titulo,
      description: filme.descricao,
      images: [filme.imagem],
    },
  };
}

export default async function FilmeDetalhesPage({ params }: Props) {
  const { id } = await params;
  const filme = await getFilmeById(id);

  if (!filme) {
    notFound();
  }

  const sessoes = await getSessoesByFilme(id);
  
  const sessoesAgrupadas = sessoes.reduce((acc, sessao) => {
    const data = sessao.data;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(sessao);
    return acc;
  }, {} as Record<string, typeof sessoes>);

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

const posterUrl = filme.imagem || PLACEHOLDER_IMAGE;
  const backdropUrl = filme.imagem ? filme.imagem.replace('/w500/', '/original/') : PLACEHOLDER_IMAGE;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="relative h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 via-transparent to-[var(--background)]/80" />
        <img 
          src={backdropUrl} 
          alt={filme.titulo}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 pb-20">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <FadeIn delay={0.1}>
            <div className="flex-shrink-0">
              <div className="relative">
                <img 
                  src={posterUrl} 
                  alt={filme.titulo}
                  className="w-64 md:w-80 rounded-2xl shadow-2xl border-4 border-[var(--card)]"
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--primary)] to-transparent opacity-30 rounded-2xl -z-10 blur-xl" />
              </div>
            </div>
          </FadeIn>
          
          <div className="flex-1">
            <FadeIn delay={0.2}>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-[var(--primary)] text-white text-sm font-bold px-4 py-1.5 rounded-full">
                  {filme.classificacao}
                </span>
                <span className="bg-[var(--card)] text-zinc-400 text-sm px-4 py-1.5 rounded-full border border-[var(--border)]">
                  {filme.genero}
                </span>
                {filme.emCartaz && (
                  <span className="bg-green-500/10 text-green-500 text-sm font-medium px-4 py-1.5 rounded-full border border-green-500/30">
                    Em Cartaz
                  </span>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{filme.titulo}</h1>
            </FadeIn>
            
            <FadeIn delay={0.4}>
              <div className="flex flex-wrap items-center gap-6 text-zinc-400 mb-8">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {filme.duracao} minutos
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(filme.dataLancamento).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="text-zinc-300 text-lg leading-relaxed mb-10 max-w-2xl">
                {filme.descricao}
              </p>
            </FadeIn>

            {filme.emCartaz && sessoes.length > 0 && (
              <FadeIn delay={0.6}>
                <div className="bg-[var(--card)] rounded-2xl p-6 md:p-8 border border-[var(--border)]">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-[var(--primary)] rounded-full" />
                    Escolha a Sessao
                  </h2>
                  
                  <div className="space-y-6">
                    {Object.entries(sessoesAgrupadas).slice(0, 3).map(([data, sessoesData]) => (
                      <div key={data}>
                        <h3 className="text-lg font-semibold mb-4 text-zinc-300">
                          {formatarData(data)}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                          {sessoesData.map((sessao) => (
                            <a
                              key={sessao.id}
                              href={`/reserva/${sessao.id}`}
                              className="flex flex-col items-center p-4 bg-[var(--background)] hover:bg-[var(--primary)] rounded-xl transition-all duration-300 group border border-[var(--border)] hover:border-[var(--primary)]"
                            >
                              <span className="text-lg font-bold">{sessao.horario}</span>
                              <span className="text-xs text-zinc-500 group-hover:text-zinc-200 mt-1">
                                {sessao.sala?.nome}
                              </span>
                              <span className="text-sm font-medium text-[var(--primary)] group-hover:text-white mt-2">
                                R$ {sessao.preco.toFixed(2)}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {Object.keys(sessoesAgrupadas).length > 3 && (
                    <a 
                      href="/sessoes" 
                      className="inline-block mt-6 text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
                    >
                      Ver todos os horarios &rarr;
                    </a>
                  )}
                </div>
              </FadeIn>
            )}

            {!filme.emCartaz && (
              <FadeIn delay={0.6}>
                <div className="bg-[var(--card)] rounded-2xl p-8 text-center border border-[var(--border)]">
                  <p className="text-zinc-400 text-lg">Em breve nos cinemas</p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
