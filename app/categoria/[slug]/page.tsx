/**
 * Category page - Server Component with SSR
 * Displays books filtered by category
 */

import { fetchCatalogoLivros } from 'lib/data/fetchLivro';
import { buildCatalogoPageMeta } from 'lib/data/buildPageMeta';
import type { Metadata } from 'next';
import type { LivroMetadata } from 'lib/data/fetchLivro';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildCatalogoPageMeta({ categoria: slug });
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = await params;

  const catalogo = await fetchCatalogoLivros({
    pagina: 1,
    itensPorPagina: 10,
    categoria: slug
  }, 'http://127.0.0.1:3000/api');

  if (!catalogo) {
    return (
      <div className="container">
        <h1>Categoria não encontrada</h1>
        <p>A categoria &quot;{slug}&quot; não existe ou não possui livros.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{slug} - Barnes & Noble</h1>
      <p>Livros na categoria {slug}</p>
      <ul>
        {catalogo.livros.map((livro: LivroMetadata) => (
          <li key={livro.uuid}>
            <a href={`/livro/${livro.uuid}`}>{livro.titulo}</a>
            <span> - R$ {livro.preco.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p>Total: {catalogo.total} livros nesta categoria</p>
    </div>
  );
}
