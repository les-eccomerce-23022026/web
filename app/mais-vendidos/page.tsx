/**
 * Bestsellers page - Server Component with SSR
 * Displays best-selling books
 */

import { fetchCatalogoLivros } from '../../lib/data/fetchLivro';
import { buildCatalogoPageMeta } from '../../lib/data/buildPageMeta';
import type { Metadata } from 'next';
import type { LivroMetadata } from '../../lib/data/fetchLivro';

export async function generateMetadata(): Promise<Metadata> {
  return buildCatalogoPageMeta({ titulo: 'Mais Vendidos - Barnes & Noble' });
}

export default async function MaisVendidosPage() {
  try {
    const catalogo = await fetchCatalogoLivros({ 
      pagina: 1, 
      itensPorPagina: 10,
      ordenacao: 'mais-vendidos' 
    });

    return (
      <div className="container">
        <h1>Mais Vendidos - Barnes & Noble</h1>
        <p>Os livros mais populares da nossa livraria</p>
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
        <h1>Mais Vendidos - Barnes & Noble</h1>
        <p>Erro ao carregar lista de mais vendidos.</p>
        <p>Erro: {error instanceof Error ? error.message : 'Desconhecido'}</p>
      </div>
    );
  }
}
