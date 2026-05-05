/**
 * Book detail page - Server Component with SSR
 * MVP route for SEO testing
 */

import { fetchLivroByUuid } from '../../../lib/data/fetchLivro';
import { buildLivroPageMeta } from '../../../lib/data/buildPageMeta';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { uuid } = await params;
    const livro = await fetchLivroByUuid(uuid);
    return buildLivroPageMeta(livro);
  } catch (error) {
    return {
      title: 'Livro não encontrado - Barnes & Noble',
    };
  }
}

export default async function LivroPage({ params }: PageProps) {
  try {
    const { uuid } = await params;
    const livro = await fetchLivroByUuid(uuid);

    return (
      <div className="container">
        <h1>{livro.titulo}</h1>
        <p>por {livro.autor}</p>
        <p>Preço: R$ {livro.preco.toFixed(2)}</p>
        {livro.sinopse && <p>Sinopse: {livro.sinopse}</p>}
        {livro.imagem && <img src={livro.imagem} alt={livro.titulo} />}
        <p>ISBN: {livro.isbn}</p>
        <p>Estoque: {livro.estoque}</p>
        {livro.categorias && (
          <p>
            Categorias: {livro.categorias.join(', ')}
          </p>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching livro:', error);
    notFound();
  }
}
