'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [userMenuAberto, setUserMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userStr && token) {
        setUsuario(JSON.parse(userStr));
      } else {
        setUsuario(null);
      }
    };

    checkUser();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUser();
      }
    };

    const handleUserLoggedIn = () => {
      checkUser();
    };

    const handleUserUpdated = () => {
      checkUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-logged-in', handleUserLoggedIn);
    window.addEventListener('user-updated', handleUserUpdated);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-logged-in', handleUserLoggedIn);
      window.removeEventListener('user-updated', handleUserUpdated);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuario(null);
    router.push('/');
  };

  const links = [
    { href: '/', label: 'Início' },
    { href: '/filmes', label: 'Filmes' },
    { href: '/sessoes', label: 'Sessões' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav role="navigation" aria-label="Menu principal" className="glass border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" aria-label="Voltar para o início" className="flex items-center gap-3 group">
              <div className="relative">
                <svg viewBox="0 0 120 50" className="h-10 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M15 5C8.373 5 3 10.373 3 17C3 23.627 8.373 29 15 29C21.627 29 27 23.627 27 17C27 10.373 21.627 5 15 5Z" fill="#E50914" />
                  <path d="M35 10H45V40H35V10Z" fill="white" />
                  <path d="M55 10H80C85.523 10 90 14.477 90 20C90 25.523 85.523 30 80 30H75V40H55V10Z" fill="white" />
                  <path d="M100 10H110C115.523 10 120 14.477 120 20C120 25.523 115.523 30 110 30H105V40H95V10H100Z" fill="white" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight hidden sm:block">Cinemark</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.href)
                      ? 'bg-[var(--primary)] text-white shadow-lg shadow-red-500/30'
                      : 'text-zinc-300 hover:bg-[var(--card)] hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {usuario?.role === 'admin' && (
                <Link
                  href="/admin"
                  aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pathname.startsWith('/admin')
                      ? 'bg-[var(--primary)] text-white shadow-lg shadow-red-500/30'
                      : 'text-zinc-300 hover:bg-[var(--card)] hover:text-white'
                    }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {usuario ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuAberto(!userMenuAberto)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--card)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold">
                    {usuario.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">{usuario.name}</span>
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuAberto && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-white text-sm font-medium">{usuario.name}</p>
                      <p className="text-zinc-500 text-xs">{usuario.email}</p>
                    </div>
                    <Link href="/tickets" className="block px-4 py-2 text-zinc-300 hover:bg-[var(--card-hover)] transition-colors">
                      Meus Ingressos
                    </Link>
                    <Link href="/perfil" className="block px-4 py-2 text-zinc-300 hover:bg-[var(--card-hover)] transition-colors">
                      Editar Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-[var(--card-hover)] transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-zinc-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-full text-sm font-medium transition-colors"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              aria-expanded={menuAberto}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
              className="text-zinc-300 hover:text-white p-2 rounded-lg hover:bg-[var(--card)] transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {menuAberto ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuAberto && (
        <div className="md:hidden bg-[var(--card)] border-t border-[var(--border)]">
          <div className="px-4 py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuAberto(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive(link.href)
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-zinc-300 hover:bg-[var(--border)] hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            {usuario?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMenuAberto(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${pathname.startsWith('/admin')
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-zinc-300 hover:bg-[var(--border)] hover:text-white'
                  }`}
              >
                Admin
              </Link>
            )}
            {usuario ? (
              <>
                <Link
                  href="/tickets"
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-zinc-300 hover:bg-[var(--border)] hover:text-white transition-colors"
                >
                  Meus Ingressos
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuAberto(false); }}
                  className="w-full text-left block px-4 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-[var(--border)] transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-zinc-300 hover:bg-[var(--border)] hover:text-white transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 rounded-lg text-base font-medium bg-[var(--primary)] text-white text-center"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
