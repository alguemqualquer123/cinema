import { Metadata } from 'next';
import { getFilmesEmCartaz } from '@/lib/dados';
import FadeIn from '@/components/FadeIn';
import FilmeCard from '@/components/FilmeCard';

export const metadata: Metadata = {
  title: 'Todos os Filmes | Cinemark',
  description: 'Veja todos os filmes em cartaz e em breve. Reserve seus ingressos online.',
};

export default async function FilmesPage() {
  const filmes = await getFilmesEmCartaz();

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-1 bg-[var(--primary)] rounded-full" />
            <h1 className="text-4xl md:text-5xl font-bold">Todos os Filmes</h1>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filmes.map((filme, index) => (
            <FadeIn key={filme.id} delay={index * 0.05} direction="up">
              <FilmeCard filme={filme} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
