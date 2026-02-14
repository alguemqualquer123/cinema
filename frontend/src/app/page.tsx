import Link from 'next/link';
import { Metadata } from 'next';
import { getFilmesEmCartaz } from '@/lib/dados';
import FadeIn from '@/components/FadeIn';
import FilmeCard from '@/components/FilmeCard';

export const metadata: Metadata = {
  title: 'Cinemark - Filmes em Cartaz',
  description: 'Assista aos melhores filmes em cartaz. Reserve seus ingressos online na Cinemark.',
};

export default async function Home() {
  const filmes = await getFilmesEmCartaz();

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)] z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/80 via-transparent to-[var(--background)]/80" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <FadeIn>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-gradient">Cinemark</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-xl md:text-2xl text-zinc-300 mb-10 font-light">
              A melhor experiencia cinematografica espera por voce
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Link 
              href="/filmes" 
              className="inline-flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30"
            >
              Ver Filmes em Cartaz
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <FadeIn>
          <div className="flex items-center gap-4 mb-12">
            <div className="h-8 w-1 bg-[var(--primary)] rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold">Em Cartaz</h2>
          </div>
        </FadeIn>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filmes.map((filme, index) => (
            <FadeIn key={filme.id} delay={index * 0.1} direction="up">
              <FilmeCard filme={filme} />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="bg-[var(--card)] py-24">
        <div className="max-w-7xl mx-auto px-4">
          <FadeIn>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center p-8 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Reserve Online</h3>
                <p className="text-zinc-500">Compre seus ingressos sem sair de casa</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Escolha seu Assento</h3>
                <p className="text-zinc-500">Selecione exatamente onde quer sentar</p>
              </div>
              <div className="text-center p-8 rounded-2xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors duration-300">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Horarios Flexiveis</h3>
                <p className="text-zinc-500">Multiplas sessoes todos os dias</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
