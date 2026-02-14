'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sala } from '@/lib/dados';
import FadeIn from '@/components/FadeIn';

export default function AdminSalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/salas')
      .then(res => res.json())
      .then(data => setSalas(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const [modalAberto, setModalAberto] = useState(false);
  const [salaEditando, setSalaEditando] = useState<Sala | null>(null);
  const [formData, setFormData] = useState<Partial<Sala>>({
    nome: '',
    capacidade: 100,
    tipo: 'normal'
  });

  const abrirModal = (sala?: Sala) => {
    if (sala) {
      setSalaEditando(sala);
      setFormData(sala);
    } else {
      setSalaEditando(null);
      setFormData({ nome: '', capacidade: 100, tipo: 'normal' });
    }
    setModalAberto(true);
  };

  const salvarSala = () => {
    if (!formData.nome || !formData.capacidade) return;

    if (salaEditando) {
      setSalas(salas.map(s => s.id === salaEditando.id ? { ...s, ...formData } as Sala : s));
    } else {
      const novaSala: Sala = {
        id: Math.max(...salas.map(s => s.id)) + 1,
        nome: formData.nome || '',
        capacidade: formData.capacidade || 100,
        tipo: formData.tipo as 'normal' | 'imax' | '3d' | 'vip' || 'normal'
      };
      setSalas([...salas, novaSala]);
    }
    setModalAberto(false);
  };

  const excluirSala = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta sala?')) {
      setSalas(salas.filter(s => s.id !== id));
    }
  };

  const tipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      normal: '2D Normal',
      '3d': '3D',
      imax: 'IMAX',
      vip: 'VIP'
    };
    return labels[tipo] || tipo;
  };

  const tipoCor = (tipo: string) => {
    const cores: Record<string, string> = {
      normal: 'bg-zinc-700',
      '3d': 'bg-purple-600',
      imax: 'bg-blue-600',
      vip: 'bg-yellow-600'
    };
    return cores[tipo] || 'bg-zinc-700';
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
                Gerenciar Salas
              </h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => abrirModal()}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              + Nova Sala
            </motion.button>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salas.map((sala, idx) => (
            <FadeIn key={sala.id} delay={idx * 0.05} direction="up">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{sala.nome}</h3>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm ${tipoCor(sala.tipo)}`}>
                      {tipoLabel(sala.tipo)}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-2 text-zinc-500 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Capacidade: <strong className="text-white">{sala.capacidade}</strong> lugares</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => abrirModal(sala)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Editar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => excluirSala(sala.id)}
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Excluir
                  </motion.button>
                </div>
              </motion.div>
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
                <h2 className="text-2xl font-bold mb-6">{salaEditando ? 'Editar Sala' : 'Nova Sala'}</h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Nome da Sala *</label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={e => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                      placeholder="Sala 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Capacidade *</label>
                    <input
                      type="number"
                      value={formData.capacidade}
                      onChange={e => setFormData({ ...formData, capacidade: parseInt(e.target.value) })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-400">Tipo de Sala</label>
                    <select
                      value={formData.tipo}
                      onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors"
                    >
                      <option value="normal">2D Normal</option>
                      <option value="3d">3D</option>
                      <option value="imax">IMAX</option>
                      <option value="vip">VIP</option>
                    </select>
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
                    onClick={salvarSala}
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
