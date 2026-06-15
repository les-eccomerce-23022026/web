/**
 * Category page - Server Component with SSR
 * Displays books filtered by category
 */

import { fetchCatalogoLivros } from 'lib/data/fetchLivro';
import { buildCatalogoPageMeta } from 'lib/data/buildPageMeta';
import type { Metadata } from 'next';
import type { LivroMetadata } from 'lib/data/fetchLivro';
import { LivroCard } from '../../components/CatalogoLivros/LivroCard';
import type { ILivro } from '@/interfaces/livro';
import '@/pages-react-router/CadastroLivros/CatalogoLivros/CatalogoLivros.css';

function livroMetadataParaILivro(livro: LivroMetadata): ILivro {
  return {
    uuid: livro.uuid,
    titulo: livro.titulo,
    autor: livro.autor,
    preco: livro.preco,
    imagem: livro.imagem,
    categorias: livro.categorias,
    sinopse: livro.sinopse,
    isbn: livro.isbn,
    estoque: livro.estoque,
  };
}

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
      <div className="home-catalogo">
        <h1>Categoria não encontrada</h1>
        <p>A categoria &quot;{slug}&quot; não existe ou não possui livros.</p>
      </div>
    );
  }

  return (
    <div className="home-catalogo page-transition-enter">
      <div className="catalogo-header">
        <h1 className="catalogo-header__titulo">{slug}</h1>
        <p className="catalogo-header__subtitulo">Livros na categoria {slug}</p>
      </div>
      <div className="grade grade--produto">
        {catalogo.livros.map((livro: LivroMetadata) => (
          <LivroCard
            key={livro.uuid}
            livro={livroMetadataParaILivro(livro)}
            quantidadeNoCarrinho={0}
          />
        ))}
      </div>
      <p className="catalogo-total">Total: {catalogo.total} livros nesta categoria</p>
    </div>
  );
}
