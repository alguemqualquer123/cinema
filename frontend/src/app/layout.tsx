import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import { NotificationProvider } from "@/context/NotificationContext";
import ToastContainer from "@/components/ToastContainer";
import PopupContainer from "@/components/PopupContainer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cinemark - Filmes em Cartaz, Horarios e Ingressos",
  description: "Assista aos melhores filmes em cartaz na Cinemark. Reserve seus ingressos online, escolha seu assento e aproveite a experiencia cinematografica.",
  keywords: ["cinema", "filmes", "ingressos", "reserva", "Cinemark", "em cartaz", "sessoes"],
  authors: [{ name: "Cinemark" }],
  openGraph: {
    title: "Cinemark - Filmes em Cartaz",
    description: "Reserve seusingressos de cinema online",
    type: "website",
    locale: "pt_BR",
    siteName: "Cinemark",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[var(--background)] text-[var(--foreground)] min-h-screen relative`}>
        <NotificationProvider>
          <a href="#main-content" className="skip-link">
            Pular para o conteúdo principal
          </a>
          <Navbar />
          <AccessibilityMenu />
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
          <footer role="contentinfo" className="bg-[var(--card)] border-t border-[var(--border)] py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h4 className="font-bold mb-4 text-white">Cinemark</h4>
                  <p className="text-zinc-500 text-sm">A melhor experiencia cinematografica esta aqui.</p>
                </div>
                <div>
                  <h4 className="font-bold mb-4 text-white">Filmes</h4>
                  <ul className="space-y-2 text-zinc-500 text-sm">
                    <li><Link href="/filmes" className="hover:text-[var(--primary)] transition-colors">Em Cartaz</Link></li>
                    <li><Link href="/sessoes" className="hover:text-[var(--primary)] transition-colors">Horarios</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4 text-white">Institucional</h4>
                  <ul className="space-y-2 text-zinc-500 text-sm">
                    <li><Link href="/admin" className="hover:text-[var(--primary)] transition-colors">Admin</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4 text-white">Contato</h4>
                  <p className="text-zinc-500 text-sm">contato@cinemark.com.br</p>
                </div>
              </div>
              <div className="border-t border-[var(--border)] mt-8 pt-8 text-center text-zinc-500 text-sm">
                <p>&copy; 2024 Cinemark. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
          <ToastContainer />
          <PopupContainer />
        </NotificationProvider>
        <Script
          src="https://vlibras.gov.br/app/vlibras-plugin.js"
          strategy="afterInteractive"
        />
        <Script id="vlibras-init" strategy="afterInteractive">
          {`
            if (window.VLibras) {
              new window.VLibras.Widget('https://vlibras.gov.br/app');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
