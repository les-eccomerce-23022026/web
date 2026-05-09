/**
 * Root layout - Server Component
 * Includes Redux Providers for CSR routes (carrinho, checkout, admin)
 * Includes Header and Footer components
 */

import type { Metadata } from 'next';
import { Providers } from '../src/app/providers';
import { Header } from './components/Header/index';
import { Footer } from './components/Footer/index';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Barnes & Noble - Livraria Online',
  description: 'Descubra milhares de livros em nossa livraria online. Ficção, não-ficção, técnicos e muito mais.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <Providers>
          <Header />
          <main className="container">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
