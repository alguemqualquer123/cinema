'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getFilmesEmCartaz, getAllSessoes, getSalas, Sessao, Filme, Sala } from '@/lib/dados';
import FadeIn from '@/components/FadeIn';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';

export default function AdminSessoesPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllSessoes(),
      getFilmesEmCartaz(),
      getSalas()
    ]).then(([s, f, sa]) => {
      setSessoes(s);
      setFilmes(f);
      setSalas(sa);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const [modalAberto, setModalAberto] = useState(false);
  const [sessaoEditando, setSessaoEditando] = useState<Sessao | null>(null);
  const [formData, setFormData] = useState({
    filmeId: '',
    salaId: '',
    horario: '14:00',
    data: new Date().toISOString().split('T')[0],
    preco: '30'
  });

  const abrirModal = (sessao?: Sessao) => {
    if (sessao) {
      setSessaoEditando(sessao);
      setFormData({
        filmeId: sessao.filmeId,
        salaId: sessao.salaId,
        horario: sessao.horario,
        data: sessao.data,
        preco: sessao.preco.toString()
      });
    } else {
      setSessaoEditando(null);
      setFormData({
        filmeId: filmes[0]?.id.toString() || '',
        salaId: salas[0]?.id.toString() || '',
        horario: '14:00',
        data: new Date().toISOString().split('T')[0],
        preco: '30'
      });
    }
    setModalAberto(true);
  };

  const salvarSessao = () => {
    if (!formData.filmeId || !formData.salaId || !formData.horario || !formData.data) return;

    const filme = filmes.find(f => f.id === formData.filmeId);
    const sala = salas.find(s => s.id === formData.salaId);

    if (sessaoEditando) {
      setSessoes(sessoes.map(s => s.id === sessaoEditando.id ? {
        ...s,
        filmeId: formData.filmeId,
        salaId: formData.salaId,
        horario: formData.horario,
        data: formData.data,
        preco: parseFloat(formData.preco),
        filme,
        sala
      } : s));
    } else {
      const novaSessao: Sessao = {
        id: String(Date.now()),
        filmeId: formData.filmeId,
        salaId: formData.salaId,
        horario: formData.horario,
        data: formData.data,
        preco: parseFloat(formData.preco),
        filme,
        sala
      };
      setSessoes([...sessoes, novaSessao]);
    }
    setModalAberto(false);
  };

  const excluirSessao = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta sessao?')) {
      setSessoes(sessoes.filter(s => s.id !== id));
    }
  };

  const sessoesAgrupadas = sessoes.reduce((acc, sessao) => {
    const data = sessao.data;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(sessao);
    return acc;
  }, {} as Record<string, Sessao[]>);

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
                Gerenciar Sessoes
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => abrirModal()}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              + Nova Sessao
            </motion.button>
          </div>
        </FadeIn>

        <div className="space-y-8">
          {Object.entries(sessoesAgrupadas).slice(0, 7).map(([data, sessoesData], idx) => (
            <FadeIn key={data} delay={idx * 0.05} direction="up">
              <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)]">
                <div className="bg-[var(--background)] px-6 py-4 border-b border-[var(--border)]">
                  <h3 className="font-semibold text-lg">{new Date(data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--background)]/50">
                      <tr>
                        <th className="text-left p-4 text-zinc-500 font-medium">Filme</th>
                        <th className="text-left p-4 text-zinc-500 font-medium">Sala</th>
                        <th className="text-left p-4 text-zinc-500 font-medium">Horario</th>
                        <th className="text-left p-4 text-zinc-500 font-medium">Preco</th>
                        <th className="text-left p-4 text-zinc-500 font-medium">Acoes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessoesData.map(sessao => (
                        <tr key={sessao.id} className="border-t border-[var(--border)]">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={sessao.filme?.imagem || PLACEHOLDER_IMAGE} alt="" className="w-10 h-14 object-cover rounded-lg" />
                              <span className="font-medium">{sessao.filme?.titulo}</span>
                            </div>
                          </td>
                          <td className="p-4">{sessao.sala?.nome}</td>
                          <td className="p-4 font-mono">{sessao.horario}</td>
                          <td className="p-4">R$ {sessao.preco.toFixed(2)}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => abrirModal(sessao)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                              >
                                Editar
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => excluirSessao(sessao.id)}
                                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg text-sm"
                              >
                                Excluir
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

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
                className="bg-[var(--card)] rounded-2xl p-8 w-full max-w-md border border-[var(--border)]"
              >
                <h2 className="text-2xl font-bold mb-6">{sessaoEditando ? 'Editar Sessao' : 'Nova Sessao'}</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Filme *</label>
                    <select
                      value={formData.filmeId}
                      onChange={e => setFormData({ ...formData, filmeId: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      {filmes.map(filme => (
                        <option key={filme.id} value={filme.id}>{filme.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Sala *</label>
                    <select
                      value={formData.salaId}
                      onChange={e => setFormData({ ...formData, salaId: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      {salas.map(sala => (
                        <option key={sala.id} value={sala.id}>{sala.nome} ({sala.tipo})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Data *</label>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={e => setFormData({ ...formData, data: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Horario *</label>
                    <select
                      value={formData.horario}
                      onChange={e => setFormData({ ...formData, horario: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      <option value="14:00">14:00</option>
                      <option value="16:30">16:30</option>
                      <option value="19:00">19:00</option>
                      <option value="21:30">21:30</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Preco (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={e => setFormData({ ...formData, preco: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
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
                    onClick={salvarSessao}
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
