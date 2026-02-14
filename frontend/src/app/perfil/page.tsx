'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FadeIn from '@/components/FadeIn';
import { useToast } from '@/context/NotificationContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
}

const formatCPF = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const validateCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  if (Number(digits[9]) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  return Number(digits[10]) === digit2;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

export default function PerfilPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setProfile(prev => ({
      ...prev,
      id: user.id,
      name: user.name || '',
      email: user.email || '',
    }));

    fetchProfile(token);
  }, [router]);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch('http://localhost:3001/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || '',
          cpf: data.cpf || '',
          birthDate: data.birthDate || '',
        }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.name || profile.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (profile.cpf && !validateCPF(profile.cpf)) {
      newErrors.cpf = 'CPF invalido';
    }

    if (profile.phone && !validatePhone(profile.phone)) {
      newErrors.phone = 'Telefone invalido';
    }

    if (profile.email && !validateEmail(profile.email)) {
      newErrors.email = 'Email invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldsToTouch = ['name', 'cpf', 'phone'];
    setTouched(fieldsToTouch.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    
    if (!validateForm()) {
      showError('Por favor, corrija os erros antes de salvar');
      return;
    }

    setSaving(true);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone?.replace(/\D/g, ''),
          cpf: profile.cpf?.replace(/\D/g, ''),
          birthDate: profile.birthDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      const data = await res.json();
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      const updatedUser = { 
        ...JSON.parse(localStorage.getItem('user') || '{}'), 
        ...profile,
        phone: profile.phone,
        cpf: profile.cpf,
        birthDate: profile.birthDate,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user-updated'));
      router.refresh();
      
      showSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      showError('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setProfile(prev => ({ ...prev, cpf: formatted }));
    if (touched.cpf) {
      if (formatted && !validateCPF(formatted)) {
        setErrors(prev => ({ ...prev, cpf: 'CPF invalido' }));
      } else {
        setErrors(prev => ({ ...prev, cpf: '' }));
      }
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setProfile(prev => ({ ...prev, phone: formatted }));
    if (touched.phone) {
      if (formatted && !validatePhone(formatted)) {
        setErrors(prev => ({ ...prev, phone: 'Telefone invalido' }));
      } else {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12">
      <div className="max-w-2xl mx-auto px-4">
        <FadeIn>
          <h1 className="text-3xl font-bold text-white mb-8">Meu Perfil</h1>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value });
                    if (touched.name) {
                      if (!e.target.value || e.target.value.trim().length < 2) {
                        setErrors(prev => ({ ...prev, name: 'Nome deve ter pelo menos 2 caracteres' }));
                      } else {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }
                  }}
                  onBlur={(e) => setTouched(prev => ({ ...prev, name: true }))}
                  className={`w-full px-4 py-3 bg-[var(--background)] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                    errors.name && touched.name ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                  placeholder="Seu nome completo"
                  required
                />
                {errors.name && touched.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-zinc-400 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-zinc-500 mt-1">O e-mail nao pode ser alterado</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
                  className={`w-full px-4 py-3 bg-[var(--background)] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                    errors.phone && touched.phone ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && touched.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-zinc-300 mb-2">
                  CPF
                </label>
                <input
                  id="cpf"
                  type="text"
                  value={profile.cpf || ''}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, cpf: true }))}
                  className={`w-full px-4 py-3 bg-[var(--background)] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                    errors.cpf && touched.cpf ? 'border-red-500' : 'border-[var(--border)]'
                  }`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && touched.cpf && (
                  <p className="text-red-400 text-sm mt-1">{errors.cpf}</p>
                )}
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-zinc-300 mb-2">
                  Data de Nascimento
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={profile.birthDate || ''}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alteracoes'}
              </button>
            </form>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
