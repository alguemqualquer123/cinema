'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Filme } from '@/lib/dados';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';

interface FilmeCardProps {
  filme: Filme;
}

export default function FilmeCard({ filme }: FilmeCardProps) {
  const posterUrl = filme.imagem || PLACEHOLDER_IMAGE;
  return (
    <Link
      href={`/filmes/${filme.id}`}
      aria-label={`Ver mais sobre o filme ${filme.titulo}. Duração: ${filme.duracao} minutos. Gênero: ${filme.genero}.`}
      className="group block bg-[var(--card)] rounded-xl overflow-hidden card-hover border border-[var(--border)]"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-zinc-800">
        <img
          src={posterUrl}
          alt={filme.titulo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 right-4 bg-[var(--primary)] text-white text-xs font-bold px-3 py-1 rounded-full">
          {filme.classificacao}
        </div>
        <div className="absolute inset-0 bg-[var(--primary)]/0 group-hover:bg-[var(--primary)]/20 transition-colors duration-300 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold mb-3 truncate group-hover:text-[var(--primary)] transition-colors">{filme.titulo}</h3>
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {filme.duracao} min
          </span>
          <span className="bg-[var(--background)] px-3 py-1 rounded-full text-xs">{filme.genero}</span>
        </div>
      </div>
    </Link>
  );
}
