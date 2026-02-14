'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Filme } from '@/lib/dados';
import FadeIn from '@/components/FadeIn';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';

export default function AdminFilmesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/filmes')
      .then(res => res.json())
      .then(data => setFilmes(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const [modalAberto, setModalAberto] = useState(false);
  const [filmeEditando, setFilmeEditando] = useState<Filme | null>(null);
  const [formData, setFormData] = useState<Partial<Filme>>({
    titulo: '',
    descricao: '',
    duracao: 120,
    classificacao: 'Livre',
    genero: '',
    imagem: '',
    emCartaz: true,
    dataLancamento: new Date().toISOString().split('T')[0]
  });

  const abrirModal = (filme?: Filme) => {
    if (filme) {
      setFilmeEditando(filme);
      setFormData(filme);
    } else {
      setFilmeEditando(null);
      setFormData({
        titulo: '',
        descricao: '',
        duracao: 120,
        classificacao: 'Livre',
        genero: '',
        imagem: '',
        emCartaz: true,
        dataLancamento: new Date().toISOString().split('T')[0]
      });
    }
    setModalAberto(true);
  };

  const salvarFilme = () => {
    if (!formData.titulo || !formData.genero) return;

    if (filmeEditando) {
      setFilmes(filmes.map(f => f.id === filmeEditando.id ? { ...f, ...formData } as Filme : f));
    } else {
      const novoFilme: Filme = {
        id: Math.max(...filmes.map(f => f.id)) + 1,
        titulo: formData.titulo || '',
        descricao: formData.descricao || '',
        duracao: formData.duracao || 120,
        classificacao: formData.classificacao || 'Livre',
        genero: formData.genero || '',
        imagem: formData.imagem || 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
        emCartaz: formData.emCartaz || true,
        dataLancamento: formData.dataLancamento || new Date().toISOString().split('T')[0]
      };
      setFilmes([...filmes, novoFilme]);
    }
    setModalAberto(false);
  };

  const excluirFilme = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este filme?')) {
      setFilmes(filmes.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <div className="w-1 h-10 bg-[var(--primary)] rounded-full" />
                Gerenciar Filmes
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => abrirModal()}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              + Novo Filme
            </motion.button>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--background)]">
                  <tr>
                    <th className="text-left p-4 text-zinc-500 font-medium">Imagem</th>
                    <th className="text-left p-4 text-zinc-500 font-medium">Titulo</th>
                    <th className="text-left p-4 text-zinc-500 font-medium">Genero</th>
                    <th className="text-left p-4 text-zinc-500 font-medium">Duracao</th>
                    <th className="text-left p-4 text-zinc-500 font-medium">Classificacao</th>
                    <th className="text-left p-4 text-zinc-500 font-medium">Status</th>
                    <th className="text-left p-4 text-zinc-500 font-medium">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filmes.map(filme => (
                    <motion.tr 
                      key={filme.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t border-[var(--border)] hover:bg-[var(--background)]/50"
                    >
                      <td className="p-4">
                        <img src={filme.imagem || PLACEHOLDER_IMAGE} alt={filme.titulo} className="w-12 h-16 object-cover rounded-lg" />
                      </td>
                      <td className="p-4 font-medium">{filme.titulo}</td>
                      <td className="p-4 text-zinc-500">{filme.genero}</td>
                      <td className="p-4 text-zinc-500">{filme.duracao} min</td>
                      <td className="p-4">
                        <span className="bg-[var(--background)] px-3 py-1 rounded-lg text-sm">{filme.classificacao}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-sm ${filme.emCartaz ? 'bg-green-500/10 text-green-500' : 'bg-[var(--background)] text-zinc-500'}`}>
                          {filme.emCartaz ? 'Em Cartaz' : 'Indisponivel'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => abrirModal(filme)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Editar
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => excluirFilme(filme.id)}
                            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Excluir
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        <AnimatePresence>
          {modalAberto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--card)] rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-[var(--border)]"
              >
                <h2 className="text-2xl font-bold mb-6">{filmeEditando ? 'Editar Filme' : 'Novo Filme'}</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Titulo *</label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Descricao</label>
                    <textarea
                      value={formData.descricao}
                      onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                      rows={3}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-400">Duracao (min)</label>
                      <input
                        type="number"
                        value={formData.duracao}
                        onChange={e => setFormData({ ...formData, duracao: parseInt(e.target.value) })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-400">Classificacao</label>
                      <select
                        value={formData.classificacao}
                        onChange={e => setFormData({ ...formData, classificacao: e.target.value })}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                      >
                        <option>Livre</option>
                        <option>10 anos</option>
                        <option>12 anos</option>
                        <option>14 anos</option>
                        <option>16 anos</option>
                        <option>18 anos</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Genero *</label>
                    <input
                      type="text"
                      value={formData.genero}
                      onChange={e => setFormData({ ...formData, genero: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">URL da Imagem</label>
                    <input
                      type="url"
                      value={formData.imagem}
                      onChange={e => setFormData({ ...formData, imagem: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Data de Lancamento</label>
                    <input
                      type="date"
                      value={formData.dataLancamento}
                      onChange={e => setFormData({ ...formData, dataLancamento: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="emCartaz"
                      checked={formData.emCartaz}
                      onChange={e => setFormData({ ...formData, emCartaz: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <label htmlFor="emCartaz" className="text-sm font-medium">Em Cartaz</label>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setModalAberto(false)}
                    className="flex-1 bg-[var(--border)] hover:bg-[var(--background)] text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={salvarFilme}
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-3 rounded-xl font-semibold transition-colors"
                  >
                    Salvar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
