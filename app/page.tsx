/**
 * Home page - Server Component with SSR
 * This will be the catalog page
 */

import { fetchCatalogoLivros } from '../lib/data/fetchLivro';
import { buildCatalogoPageMeta } from '../lib/data/buildPageMeta';
import type { Metadata } from 'next';
import type { LivroMetadata } from '../lib/data/fetchLivro';

export async function generateMetadata(): Promise<Metadata> {
  return buildCatalogoPageMeta();
}

export default async function HomePage() {
  try {
    const catalogo = await fetchCatalogoLivros({ pagina: 1, itensPorPagina: 10 });

    return (
      <div className="container">
        <h1>Barnes & Noble - Livraria Online</h1>
        <p>Catálogo de Livros (SSR - MVP)</p>
        <ul>
          {catalogo.livros.map((livro: LivroMetadata) => (
            <li key={livro.uuid}>
              <a href={`/livro/${livro.uuid}`}>{livro.titulo}</a>
              <span> - R$ {livro.preco.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p>Total: {catalogo.total} livros</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="container">
        <h1>Barnes & Noble - Livraria Online</h1>
        <p>Erro ao carregar catálogo. Verifique se o backend está rodando.</p>
        <p>Erro: {error instanceof Error ? error.message : 'Desconhecido'}</p>
      </div>
    );
  }
}
