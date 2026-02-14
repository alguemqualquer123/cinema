'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { getSessaoById, gerarPoltronasMock, Sessao, Poltrona } from '@/lib/dados';
import { api } from '@/lib/api';
import FadeIn from '@/components/FadeIn';
import { useToast } from '@/context/NotificationContext';
import { PLACEHOLDER_IMAGE } from '@/lib/constants';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ReservaPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const sessaoId = id;
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [etapa, setEtapa] = useState<'poltronas' | 'pagamento' | 'sucesso'>('poltronas');
  const [dadosCliente, setDadosCliente] = useState({ nome: '', email: '', telefone: '' });
  const [cartao, setCartao] = useState({ numero: '', nome: '', validade: '', cvv: '' });
  const [metodoPagamento, setMetodoPagamento] = useState<'cartao' | 'pix'>('cartao');
  const [pixCopiado, setPixCopiado] = useState(false);
  const [pixValue, setPixValue] = useState('');
  const [erro, setErro] = useState('');
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [poltronasSelecionadasInfo, setPoltronasSelecionadasInfo] = useState<{ fileira: string; numero: number }[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSessaoById(sessaoId);
      setSessao(data || null);
      setLoading(false);
    };
    fetchData();
  }, [sessaoId]);

  const [poltronas, setPoltronas] = useState<Poltrona[]>([]);
  const [poltronasSelecionadas, setPoltronasSelecionadas] = useState<string[]>([]);

  useEffect(() => {
    if (sessao) {
      gerarPoltronasMock(sessao.salaId, sessao.sala?.capacidade || 100).then(setPoltronas);
    }
  }, [sessao]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setDadosCliente({
        nome: user.name || '',
        email: user.email || '',
        telefone: user.phone || '',
      });
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!sessao || !sessao.filme || !sessao.sala) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sessao nao encontrada</h1>
          <Link href="/sessoes" className="text-[var(--primary)] hover:underline">
            Voltar as sessoes
          </Link>
        </div>
      </div>
    );
  }

  const togglePoltrona = (poltronaId: string) => {
    setPoltronasSelecionadas(prev =>
      prev.includes(poltronaId)
        ? prev.filter(id => id !== poltronaId)
        : [...prev, poltronaId]
    );
  };

  const total = poltronasSelecionadas.length * sessao.preco;

  const handleContinuar = () => {
    if (poltronasSelecionadas.length === 0) {
      setErro('Selecione pelo menos uma poltrona');
      return;
    }
    const info = poltronasSelecionadas.map(id => {
      const p = poltronas.find(p => p.id === id);
      return p ? { fileira: p.fileira, numero: p.numero } : { fileira: '', numero: id };
    });
    setPoltronasSelecionadasInfo(info);
    setOrderTotal(total);
    setErro('');
    setEtapa('pagamento');
  };

  const handlePagamento = async () => {
    if (!dadosCliente.nome || !dadosCliente.email) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }
    if (metodoPagamento === 'cartao') {
      if (!cartao.numero || !cartao.nome || !cartao.validade || !cartao.cvv) {
        setErro('Preencha os dados do cartão');
        return;
      }
    }

    setProcessing(true);
    setErro('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Faça login para continuar');
        router.push('/login');
        return;
      }

      const order = await api.createOrder(sessaoId, poltronasSelecionadas, token);
      
      await api.confirmPayment(order.id, token);

      const tickets = await api.getMyTickets(token);
      const qrcodes = tickets.slice(-poltronasSelecionadas.length).map((t: any) => t.qrCode);
      setQrCodes(qrcodes);

      showSuccess('Pagamento realizado com sucesso!');
      setEtapa('sucesso');
    } catch (err) {
      console.error('Erro:', err);
      setErro('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const copiarPix = () => {
    const pixCode = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}5204000053039865802BR5925CINEMA DIGITAL LTDA6009SAO PAULO61080540900062260521PIX${orderTotal.toFixed(2)}6304`;
    navigator.clipboard.writeText(pixCode).then(() => {
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2000);
    }).catch(() => {
      setPixCopiado(true);
      setTimeout(() => setPixCopiado(false), 2000);
    });
  };

  const fileiras = [...new Set(poltronas.map(p => p.fileira))];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header com botões de fechar e voltar */}
        <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" aria-label="Voltar">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Escolha seus assentos</h1>
          <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors" aria-label="Fechar">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>

        <div className="grid lg:grid-cols-[350px_1fr] gap-12">
          {/* Sidebar - Resumo da Compra */}
          <aside className="space-y-8">
            <section>
              <h2 className="text-lg font-bold mb-6 text-zinc-100 uppercase tracking-tight">Resumo da Compra</h2>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-24 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={sessao.filme?.imagem || PLACEHOLDER_IMAGE}
                      alt={sessao.filme?.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white uppercase">{sessao.filme?.titulo}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <span className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center text-[10px] font-bold">14</span>
                      <span>166 MIN | FICÇÃO CIENTÍFICA</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <div className="w-8 h-8 rounded bg-zinc-800/50 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold uppercase">
                      {new Date(sessao.data).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-300">
                    <div className="w-8 h-8 rounded bg-zinc-800/50 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold uppercase">{sessao.sala?.nome} - ELDORADO</span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-300">
                    <div className="w-8 h-8 rounded bg-zinc-800/50 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold uppercase">{sessao.horario}, 2D, {sessao.sala?.tipo} - LEGENDADO</span>
                  </div>
                </div>
              </div>
            </section>

            {poltronasSelecionadas.length > 0 && (
              <section className="border-t border-zinc-800 pt-6">
                <h3 className="text-lg font-bold mb-6 text-zinc-100 uppercase tracking-tight">Detalhes da Reserva</h3>
                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="flex justify-between">
                    <span>Poltronas:</span>
                    <span className="text-white">
                      {poltronasSelecionadas
                        .map(id => {
                          const p = poltronas.find(p => p.id === id);
                          return p ? `${p.fileira}${p.numero}` : id;
                        })
                        .join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quantidade:</span>
                    <span className="text-white">{poltronasSelecionadas.length} x R$ {sessao.preco.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t border-zinc-800">
                    <span>Total:</span>
                    <span className="text-red-600">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </section>
            )}
          </aside>

          {/* Área Principal (Mapa de Assentos) */}
          <main className="space-y-12">
            <AnimatePresence mode="wait">
              {etapa === 'poltronas' ? (
                <motion.div
                  key="poltronas"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-zinc-900/40 p-12 rounded-3xl border border-zinc-800/50"
                >
                  <h2 className="text-xl font-bold mb-12 uppercase tracking-wide">Escolha seus assentos</h2>

                  <div className="relative mb-20 overflow-x-auto pb-8">
                    <div className="min-w-[700px] flex flex-col items-center gap-2">
                      {fileiras.map(fileira => (
                        <div key={fileira} className="flex items-center gap-4">
                          <span className="w-6 text-zinc-600 text-xs font-bold text-right">{fileira}</span>
                          <div className="flex gap-2">
                            {poltronas
                              .filter(p => p.fileira === fileira)
                              .map(poltrona => {
                                const isSelected = poltronasSelecionadas.includes(poltrona.id);
                                const isReserved = poltrona.status === 'reservada';

                                // Lógica de ícones baseada no tipo (mocked por enquanto)
                                let content = null;
                                if (poltrona.numero === 1 && fileira === 'A') {
                                  // Deficiente físico
                                  content = (
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM19 13v-2c0-1.1-.9-2-2-2h-5V7h2V5h-6v2h2v5H7l-2 3v5h2v-4l2-3h5v7h2v-8h3z" />
                                    </svg>
                                  );
                                }

                                return (
                                  <button
                                    key={poltrona.id}
                                    disabled={isReserved}
                                    onClick={() => togglePoltrona(poltrona.id)}
                                    className={`w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-300 ${isReserved
                                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                        : isSelected
                                          ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] scale-110'
                                          : 'bg-white hover:bg-zinc-200'
                                      }`}
                                  >
                                    {content ? content : (
                                      isReserved ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      ) : null
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        </div>
                      ))}

                      {/* Tela no rodapé do mapa como na imagem */}
                      <div className="mt-16 w-full max-w-2xl text-center">
                        <div className="h-2 w-full bg-gradient-to-b from-zinc-700 to-transparent rounded-full mb-2 opacity-50" />
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Tela</span>
                        <div className="mt-8 flex justify-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-white rounded-sm" />
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Disponível</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-zinc-800 rounded-sm flex items-center justify-center">
                              <svg className="w-2 h-2 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Indisponível</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-600 rounded-sm" />
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Selecionado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 border-t border-zinc-800 pt-12">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-widest">Capacidade da Sala</h3>
                      <p className="text-xl font-bold">{sessao.sala?.capacidade} Assentos</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 tracking-widest">Detalhes de Assentos</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-400">
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white rounded-sm" /> Disponível</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-sm" /> Selecionado</div>
                        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-zinc-800 rounded-sm flex items-center justify-center text-zinc-600"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div> Indisponível</div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-zinc-700 rounded-lg flex items-center justify-center text-white">
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM19 13v-2c0-1.1-.9-2-2-2h-5V7h2V5h-6v2h2v5H7l-2 3v5h2v-4l2-3h5v7h2v-8h3z" /></svg>
                          </div> Deficiente Físico
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : etapa === 'pagamento' ? (
                <motion.div
                  key="pagamento"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-[var(--card)] rounded-2xl p-8 border border-[var(--border)]"
                >
                  <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <div className="w-1 h-8 bg-[var(--primary)] rounded-full" />
                    Pagamento
                  </h2>

                  <div className="space-y-6">
                    <div className="bg-zinc-800/50 p-4 rounded-xl mb-6">
                      <p className="text-sm text-zinc-400">Total a pagar</p>
                      <p className="text-3xl font-bold text-red-600">R$ {orderTotal.toFixed(2)}</p>
                    </div>

                    <div className="flex gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => setMetodoPagamento('cartao')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${metodoPagamento === 'cartao' ? 'bg-[var(--primary)] text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Cartão
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetodoPagamento('pix')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${metodoPagamento === 'pix' ? 'bg-[var(--primary)] text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                        PIX
                      </button>
                    </div>

                    {metodoPagamento === 'cartao' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-3 text-zinc-400">Número do cartão</label>
                          <input
                            type="text"
                            value={cartao.numero}
                            onChange={e => setCartao({ ...cartao, numero: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary)] transition-colors"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-3 text-zinc-400">Nome no cartão</label>
                          <input
                            type="text"
                            value={cartao.nome}
                            onChange={e => setCartao({ ...cartao, nome: e.target.value })}
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary)] transition-colors"
                            placeholder="NOME DO TITULAR"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-3 text-zinc-400">Validade</label>
                            <input
                              type="text"
                              value={cartao.validade}
                              onChange={e => setCartao({ ...cartao, validade: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary)] transition-colors"
                              placeholder="MM/AA"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-3 text-zinc-400">CVV</label>
                            <input
                              type="text"
                              value={cartao.cvv}
                              onChange={e => setCartao({ ...cartao, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-5 py-4 focus:outline-none focus:border-[var(--primary)] transition-colors"
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                          <QRCodeSVG 
                            value={`00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}5204000053039865802BR5925CINEMA DIGITAL LTDA6009SAO PAULO61080540900062260521PIX${orderTotal.toFixed(2)}6304`}
                            size={180}
                            level="M"
                            includeMargin={false}
                          />
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">Escaneie o QR Code com seu banco</p>
                        <div className="flex items-center justify-center gap-2 bg-zinc-800/50 py-3 px-4 rounded-xl">
                          <code className="text-zinc-300 text-xs">PIX copia e cola</code>
                          <button
                            onClick={copiarPix}
                            className="text-[var(--primary)] text-sm font-semibold hover:underline"
                          >
                            {pixCopiado ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {erro && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl mt-6">
                      {erro}
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEtapa('poltronas')}
                      disabled={processing}
                      className="flex-1 bg-[var(--border)] hover:bg-[var(--background)] text-white py-4 rounded-xl font-semibold transition-colors"
                    >
                      Voltar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePagamento}
                      disabled={processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                      {processing ? 'Processando...' : metodoPagamento === 'pix' ? `Pagar R$ ${orderTotal.toFixed(2)} com PIX` : `Pagar R$ ${orderTotal.toFixed(2)}`}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="sucesso"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[var(--card)] rounded-2xl p-8 border border-green-500/30 text-center"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Pagamento Confirmado!</h2>
                  <p className="text-zinc-400 mb-8">Seu ingresso foi gerado com sucesso.</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {poltronasSelecionadasInfo.map((info, idx) => (
                      <div key={idx} className="bg-zinc-800/50 p-4 rounded-xl">
                        <p className="text-sm text-zinc-400">Poltrona</p>
                        <p className="text-xl font-bold">{info.fileira}{info.numero}</p>
                        {qrCodes[idx] && (
                          <div className="mt-2 bg-white p-2 rounded">
                            <p className="text-xs text-black font-mono">{qrCodes[idx].slice(0, 20)}...</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/tickets"
                    className="inline-block bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-8 py-4 rounded-xl font-semibold transition-colors"
                  >
                    Ver Meus Ingressos
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {etapa === 'poltronas' && (
              <div className="flex justify-center">
                <button
                  onClick={handleContinuar}
                  className={`px-12 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-500 ${poltronasSelecionadas.length > 0
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_30px_rgba(220,38,38,0.3)]'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                  {poltronasSelecionadas.length > 0
                    ? `Continuar (R$ ${total.toFixed(2)})`
                    : 'Escolha um assento para continuar'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
