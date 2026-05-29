/**
 * Server/client agnostic fetch functions for livro data.
 * These functions work in both Next.js Server Components and client-side React.
 * They avoid Redux dependencies and browser-only APIs for SSR compatibility.
 */

import { headers } from 'next/headers';

export interface LivroMetadata {
  uuid: string;
  titulo: string;
  autor: string;
  sinopse?: string;
  preco: number;
  imagem?: string;
  categorias?: string[];
  isbn: string;
  estoque: number;
}

export interface CatalogoLivrosResposta {
  livros: LivroMetadata[];
  total: number;
  pagina: number;
  itensPorPagina: number;
}

export interface CategoriaMenu {
  nome: string;
  slug: string;
}

/**
 * Get the base URL for API calls
 * In server-side context, use the backend URL directly
 * In client-side context, use relative URL for Next.js rewrites
 */
function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL for Next.js rewrites
    return '/api';
  }
  // Server-side: use backend URL directly
  const backend = process.env.BACKEND_URL || 'http://localhost:5001';
  return `${backend.replace(/\/$/, '')}/api`;
}

/**
 * Get headers for API calls, including x-loja-id for multi-tenancy
 * In SSR, reads headers from the original Next.js request
 * In client-side, uses browser headers and window flag
 */
async function getApiHeaders(): Promise<Record<string, string>> {
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window === 'undefined') {
    // Server-side: read headers from the original Next.js request
    try {
      const requestHeaders = await headers();
      const lojaId = requestHeaders.get('x-loja-id');
      const useTestDb = requestHeaders.get('x-use-test-db');
      
      if (lojaId) {
        baseHeaders['x-loja-id'] = lojaId;
      } else {
        // Fallback to environment variable if header not set
        const defaultLojaId = process.env.DEFAULT_LOJA_ID || '1';
        baseHeaders['x-loja-id'] = defaultLojaId;
      }
      
      if (useTestDb) {
        baseHeaders['x-use-test-db'] = useTestDb;
      }
    } catch {
      // Headers not available in some contexts, use defaults
      const defaultLojaId = process.env.DEFAULT_LOJA_ID || '1';
      baseHeaders['x-loja-id'] = defaultLojaId;
    }
  } else {
    // Client-side: add x-use-test-db if flag is set
    if ((window as Window & { __USE_TEST_DB__?: boolean }).__USE_TEST_DB__) {
      baseHeaders['x-use-test-db'] = 'true';
    }
  }

  return baseHeaders;
}

/**
 * Fetch book details by UUID - works on server and client
 */
export async function fetchLivroByUuid(
  uuid: string,
  baseUrl?: string
): Promise<LivroMetadata> {
  const apiBaseUrl = baseUrl || getApiBaseUrl();
  const url = `${apiBaseUrl}/livros/${uuid}`;
  const response = await fetch(url, {
    headers: await getApiHeaders(),
    cache: 'no-store', // Disable cache for real-time data
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch livro: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch catalog books with optional filters - works on server and client
 */
export async function fetchCatalogoLivros(
  params: {
    pagina?: number;
    itensPorPagina?: number;
    categoria?: string;
    ordenacao?: string;
  } = {},
  baseUrl?: string
): Promise<CatalogoLivrosResposta> {
  const apiBaseUrl = baseUrl || getApiBaseUrl();
  const queryParams = new URLSearchParams();
  if (params.pagina) queryParams.append('pagina', String(params.pagina));
  if (params.itensPorPagina) queryParams.append('itensPorPagina', String(params.itensPorPagina));
  if (params.categoria) queryParams.append('categoria', params.categoria);
  if (params.ordenacao) queryParams.append('ordenacao', params.ordenacao);

  const url = `${apiBaseUrl}/livros?${queryParams.toString()}`;
  
  const response = await fetch(url, {
    headers: await getApiHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch catalogo: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch categories for menu - works on server and client
 */
export async function fetchCategoriasMenu(
  baseUrl?: string
): Promise<CategoriaMenu[]> {
  const apiBaseUrl = baseUrl || getApiBaseUrl();
  const url = `${apiBaseUrl}/categorias/catalogo`;
  const response = await fetch(url, {
    headers: await getApiHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categorias: ${response.status}`);
  }

  return response.json();
}
