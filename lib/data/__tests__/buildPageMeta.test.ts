/**
 * Vitest tests for metadata builders (TDD approach)
 * Pure functions that transform data into SEO metadata objects
 */

import { describe, it, expect } from 'vitest';
import { buildLivroPageMeta, buildCatalogoPageMeta, buildCategoriaPageMeta } from '../buildPageMeta';
import type { LivroMetadata } from '../fetchLivro';

describe('buildLivroPageMeta', () => {
  it('should build metadata for a book with all fields', () => {
    const livro: LivroMetadata = {
      uuid: '123',
      titulo: 'O Senhor dos Anéis',
      autor: 'J.R.R. Tolkien',
      sinopse: 'Uma épica fantasia sobre a jornada para destruir o Um Anel.',
      preco: 49.9,
      imagem: 'https://example.com/capa.jpg',
      categorias: ['Fantasia', 'Aventura'],
      isbn: '978-0-261-10221-7',
      estoque: 10,
    };

    const meta = buildLivroPageMeta(livro);

    expect(meta.title).toBe('O Senhor dos Anéis - Barnes & Noble');
    expect(meta.description).toContain('Uma épica fantasia');
    expect(meta.openGraph).toBeDefined();
    expect(meta.openGraph?.title).toBe('O Senhor dos Anéis - Barnes & Noble');
    expect(meta.openGraph?.images).toHaveLength(1);
    expect(meta.openGraph?.images?.[0].url).toBe('https://example.com/capa.jpg');
    expect(meta.twitter).toBeDefined();
    expect(meta.alternates?.canonical).toBe('/livro/123');
  });

  it('should build metadata for a book without sinopse', () => {
    const livro: LivroMetadata = {
      uuid: '456',
      titulo: 'Livro Sem Sinopse',
      autor: 'Autor Desconhecido',
      preco: 29.9,
      isbn: '978-0-000-00000-0',
      estoque: 5,
    };

    const meta = buildLivroPageMeta(livro);

    expect(meta.title).toBe('Livro Sem Sinopse - Barnes & Noble');
    expect(meta.description).toContain('Compre Livro Sem Sinopse');
    expect(meta.openGraph?.images).toHaveLength(0);
  });

  it('should truncate sinopse to 160 characters', () => {
    const longSinopse = 'A '.repeat(200);
    const livro: LivroMetadata = {
      uuid: '789',
      titulo: 'Livro Longo',
      autor: 'Autor',
      sinopse: longSinopse,
      preco: 39.9,
      isbn: '978-0-111-11111-1',
      estoque: 3,
    };

    const meta = buildLivroPageMeta(livro);

    expect(meta.description?.length).toBeLessThanOrEqual(160);
  });
});

describe('buildCatalogoPageMeta', () => {
  it('should build metadata for home page', () => {
    const meta = buildCatalogoPageMeta();

    expect(meta.title).toBe('Barnes & Noble - Livraria Online');
    expect(meta.description).toContain('Descubra milhares de livros');
    expect(meta.alternates?.canonical).toBe('/');
  });

  it('should build metadata for category page', () => {
    const meta = buildCatalogoPageMeta({ categoria: 'Fantasia' });

    expect(meta.title).toBe('Fantasia - Barnes & Noble');
    expect(meta.description).toContain('Fantasia');
    expect(meta.alternates?.canonical).toBe('/categoria/Fantasia');
  });

  it('should use custom title when provided', () => {
    const meta = buildCatalogoPageMeta({ titulo: 'Promoções' });

    expect(meta.title).toBe('Promoções');
  });
});

describe('buildCategoriaPageMeta', () => {
  it('should build metadata from slug', () => {
    const meta = buildCategoriaPageMeta('ficcao-cientifica');

    expect(meta.title).toBe('Ficcao Cientifica - Barnes & Noble');
    expect(meta.description).toContain('Ficcao Cientifica');
    expect(meta.alternates?.canonical).toBe('/categoria/ficcao-cientifica');
  });

  it('should use provided nome when available', () => {
    const meta = buildCategoriaPageMeta('tech', 'Tecnologia');

    expect(meta.title).toBe('Tecnologia - Barnes & Noble');
    expect(meta.description).toContain('Tecnologia');
  });
});
