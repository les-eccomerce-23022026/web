import { fetchCatalogoLivros } from 'lib/data/fetchLivro';
import type { LivroMetadata } from 'lib/data/fetchLivro';
import { LivroCard } from '../CatalogoLivros/LivroCard';
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

export const MaisVendidos = async () => {
  const catalogo = await fetchCatalogoLivros({
    pagina: 1,
    itensPorPagina: 10,
    ordenacao: 'mais-vendidos',
  });

  if (!catalogo) {
    return (
      <div className="home-catalogo">
        <h1>Mais Vendidos - Barnes &amp; Noble</h1>
        <p>Erro ao carregar lista de mais vendidos.</p>
      </div>
    );
  }

  return (
    <div className="home-catalogo page-transition-enter">
      <div className="catalogo-header">
        <h1 className="catalogo-header__titulo">Mais Vendidos</h1>
        <p className="catalogo-header__subtitulo">Os livros mais populares da nossa livraria</p>
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
      <p className="catalogo-total">Total: {catalogo.total} livros</p>
    </div>
  );
};
