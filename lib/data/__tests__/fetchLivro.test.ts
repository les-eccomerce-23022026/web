/**
 * Vitest tests for fetch functions (TDD approach)
 * These tests use MSW to mock API responses
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchLivroByUuid, fetchCatalogoLivros, fetchCategoriasMenu } from '../fetchLivro';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

describe('fetchLivroByUuid', () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.close();
  });

  it('should fetch livro by UUID', async () => {
    const mockLivro = {
      uuid: '123',
      titulo: 'Test Book',
      autor: 'Test Author',
      preco: 29.9,
      isbn: '978-0-000-00000-0',
      estoque: 10,
    };

    server.use(
      http.get('/api/livros/123', () => {
        return HttpResponse.json(mockLivro);
      })
    );

    const result = await fetchLivroByUuid('123');
    expect(result).toEqual(mockLivro);
  });

  it('should throw error on 404', async () => {
    server.use(
      http.get('/api/livros/999', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    await expect(fetchLivroByUuid('999')).rejects.toThrow('Failed to fetch livro: 404');
  });

  it('should use custom baseUrl', async () => {
    const mockLivro = {
      uuid: '123',
      titulo: 'Test Book',
      autor: 'Test Author',
      preco: 29.9,
      isbn: '978-0-000-00000-0',
      estoque: 10,
    };

    server.use(
      http.get('http://custom.api/livros/123', () => {
        return HttpResponse.json(mockLivro);
      })
    );

    const result = await fetchLivroByUuid('123', 'http://custom.api');
    expect(result).toEqual(mockLivro);
  });
});

describe('fetchCatalogoLivros', () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.close();
  });

  it('should fetch catalogo with default params', async () => {
    const mockResponse = {
      livros: [
        { uuid: '1', titulo: 'Book 1', autor: 'Author 1', preco: 19.9, isbn: '1', estoque: 5 },
        { uuid: '2', titulo: 'Book 2', autor: 'Author 2', preco: 29.9, isbn: '2', estoque: 3 },
      ],
      total: 2,
      pagina: 1,
      itensPorPagina: 10,
    };

    server.use(
      http.get('/api/livros', () => {
        return HttpResponse.json(mockResponse);
      })
    );

    const result = await fetchCatalogoLivros();
    expect(result.livros).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should fetch catalogo with categoria filter', async () => {
    server.use(
      http.get('/api/livros', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('categoria')).toBe('Fantasia');
        return HttpResponse.json({ livros: [], total: 0, pagina: 1, itensPorPagina: 10 });
      })
    );

    await fetchCatalogoLivros({ categoria: 'Fantasia' });
  });

  it('should fetch catalogo with pagination', async () => {
    server.use(
      http.get('/api/livros', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('pagina')).toBe('2');
        expect(url.searchParams.get('itensPorPagina')).toBe('20');
        return HttpResponse.json({ livros: [], total: 0, pagina: 2, itensPorPagina: 20 });
      })
    );

    await fetchCatalogoLivros({ pagina: 2, itensPorPagina: 20 });
  });
});

describe('fetchCategoriasMenu', () => {
  beforeEach(() => {
    server.listen();
  });

  afterEach(() => {
    server.close();
  });

  it('should fetch categorias menu', async () => {
    const mockCategorias = [
      { nome: 'Fantasia', slug: 'fantasia' },
      { nome: 'Ficção Científica', slug: 'ficcao-cientifica' },
    ];

    server.use(
      http.get('/api/categorias/catalogo', () => {
        return HttpResponse.json(mockCategorias);
      })
    );

    const result = await fetchCategoriasMenu();
    expect(result).toHaveLength(2);
    expect(result[0].nome).toBe('Fantasia');
  });

  it('should use custom baseUrl', async () => {
    const mockCategorias = [{ nome: 'Tech', slug: 'tech' }];

    server.use(
      http.get('http://custom.api/categorias/catalogo', () => {
        return HttpResponse.json(mockCategorias);
      })
    );

    const result = await fetchCategoriasMenu('http://custom.api');
    expect(result).toHaveLength(1);
  });
});
