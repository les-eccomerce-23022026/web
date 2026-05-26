/**
 * Metadata builders for Next.js generateMetadata.
 * Pure functions that transform data into SEO metadata objects.
 */

import type { LivroMetadata } from './fetchLivro';

// Local type definition compatible with Next.js Metadata interface
// This allows the code to work in both Vite (current) and Next.js (future) environments
export interface Metadata {
  title?: string;
  description?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    locale?: string;
    siteName?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    images?: string[];
  };
  alternates?: {
    canonical?: string;
  };
}

/**
 * Build metadata for book detail page
 */
export function buildLivroPageMeta(livro: LivroMetadata): Metadata {
  const title = `${livro.titulo} - Barnes & Noble`;
  const description = livro.sinopse
    ? livro.sinopse.substring(0, 160).replace(/\s+/g, ' ').trim()
    : `Compre ${livro.titulo} por ${livro.autor}.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Barnes & Noble',
      images: livro.imagem
        ? [
            {
              url: livro.imagem,
              width: 1200,
              height: 630,
              alt: `${livro.titulo} - capa`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: livro.imagem ? [livro.imagem] : [],
    },
    alternates: {
      canonical: `/livro/${livro.uuid}`,
    },
  };
}

/**
 * Build metadata for catalog/home page
 */
export function buildCatalogoPageMeta(params?: {
  categoria?: string;
  titulo?: string;
}): Metadata {
  const categoria = params?.categoria;
  const customTitle = params?.titulo;

  const title = customTitle || (categoria ? `${categoria} - Barnes & Noble` : 'Barnes & Noble - Livraria Online');
  const description = categoria
    ? `Explore nossa coleção de livros de ${categoria}. Os melhores títulos com os melhores preços.`
    : 'Descubra milhares de livros em nossa livraria online. Ficção, não-ficção, técnicos e muito mais.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Barnes & Noble',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: categoria ? `/categoria/${categoria}` : '/',
    },
  };
}

/**
 * Build metadata for category page
 */
export function buildCategoriaPageMeta(slug: string, nome?: string): Metadata {
  const categoriaNome = nome || slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const title = `${categoriaNome} - Barnes & Noble`;
  const description = `Explore nossa coleção de livros de ${categoriaNome}. Os melhores títulos com os melhores preços.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Barnes & Noble',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/categoria/${slug}`,
    },
  };
}
