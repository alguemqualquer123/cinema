'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ValidationResult {
  success: boolean;
  message: string;
  data?: {
    ticketId: string;
    seatInfo: string;
    movie?: string;
    sessionTime?: string;
    validatedAt?: string;
  };
}

export default function ValidarIngressoPage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ValidationResult[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin' && user.role !== 'staff') {
      router.push('/');
    }
  }, [router]);

  const validateTicket = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:3001/validation/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode: code }),
      });

      const data = await res.json();
      setResult(data);
      setHistory(prev => [data, ...prev].slice(0, 10));
    } catch (error) {
      setResult({
        success: false,
        message: 'Erro ao conectar com o servidor',
      });
    } finally {
      setIsLoading(false);
      setQrCode('');
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateTicket(qrCode);
  };

  const handleManualInput = (code: string) => {
    setQrCode(code);
    if (code.length >= 8) {
      validateTicket(code);
    }
  };

  const getStatusColor = (success: boolean | undefined) => {
    if (success === undefined) return 'border-zinc-500';
    return success ? 'border-green-500' : 'border-red-500';
  };

  const getStatusBg = (success: boolean | undefined) => {
    if (success === undefined) return 'bg-zinc-800';
    return success ? 'bg-green-900/30' : 'bg-red-900/30';
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Validação de Ingressos</h1>
            <p className="text-zinc-400 mt-1">Escaneie ou digite o código do ingresso</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-[var(--card)] text-zinc-300 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          >
            Voltar
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className={`bg-[var(--card)] rounded-xl p-6 border-2 ${getStatusColor(result?.success)}`}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Código do Ingresso / QR Code
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={qrCode}
                    onChange={(e) => handleManualInput(e.target.value)}
                    placeholder="Digite ou cole o código..."
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-lg text-center font-mono"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !qrCode.trim()}
                  className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Validando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Validar Ingresso
                    </>
                  )}
                </button>
              </form>
            </div>

            {result && (
              <div className={`rounded-xl p-6 border-2 ${getStatusColor(result.success)} ${getStatusBg(result.success)}`}>
                <div className="text-center">
                  {result.success ? (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}

                  <h2 className={`text-2xl font-bold mb-2 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? 'ACESSO PERMITIDO' : 'ACESSO NEGADO'}
                  </h2>
                  
                  <p className="text-lg text-zinc-300 mb-4">{result.message}</p>

                  {result.data && (
                    <div className="bg-[var(--background)] rounded-lg p-4 text-left space-y-2">
                      {result.data.movie && (
                        <p className="text-white">
                          <span className="text-zinc-400">Filme:</span> {result.data.movie}
                        </p>
                      )}
                      <p className="text-white">
                        <span className="text-zinc-400">Assento:</span> {result.data.seatInfo}
                      </p>
                      {result.data.sessionTime && (
                        <p className="text-white">
                          <span className="text-zinc-400">Sessão:</span> {new Date(result.data.sessionTime).toLocaleString('pt-BR')}
                        </p>
                      )}
                      {result.data.validatedAt && (
                        <p className="text-yellow-400">
                          <span className="text-zinc-400">Validado em:</span> {new Date(result.data.validatedAt).toLocaleString('pt-BR')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-white mb-4">Últimas Validações</h3>
            
            {history.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Nenhuma validação ainda</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      item.success
                        ? 'border-green-500/30 bg-green-900/10'
                        : 'border-red-500/30 bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={item.success ? 'text-green-400' : 'text-red-400'}>
                        {item.success ? '✓ Validado' : '✕ Recusado'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date().toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-1">{item.message}</p>
                    {item.data?.seatInfo && (
                      <p className="text-xs text-zinc-400">Assento: {item.data.seatInfo}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-white mb-4">Instruções</h3>
          <ul className="space-y-2 text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">1.</span>
              Escaneie o QR Code do ingresso ou digite o código manualmente
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">2.</span>
              O sistema verificará se o ingresso é válido e não foi utilizado
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">3.</span>
              <span className="text-green-400">Verde</span> = Acesso permitido (primeira validação)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)]">4.</span>
              <span className="text-red-400">Vermelho</span> = Acesso negado (já utilizado ou inválido)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
