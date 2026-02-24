import './HomeCatalogo.css';
import { useLivrosDestaque } from '@/hooks/useLivros';

export function HomeCatalogo() {
  const { destaques, loading, error } = useLivrosDestaque();

  if (loading) {
    return <div className="home-catalogo">Carregando destaques...</div>;
  }

  if (error) {
    return <div className="home-catalogo">Erro ao carregar destaques.</div>;
  }

  return (
    <div className="home-catalogo">
      <div className="pagina-inicio__banner">
        <h2 className="pagina-inicio__banner-titulo">Ofertas de Inverno - Até 50% em Ficção</h2>
      </div>
      
      <h3>Lançamentos Destacados</h3>
      <div className="grade grade--produto">
        {destaques.map((book) => (
          <div key={book.uuid} className="cartao-livro">
            <div className="cartao-livro__capa-container">
              <img src={book.imagem} alt="Capa" className="cartao-livro__capa" />
            </div>
            <div className="cartao-livro__info">
              <h4 className="cartao-livro__titulo">{book.titulo}</h4>
              <p className="cartao-livro__autor">{book.autor}</p>
              <div className="cartao-livro__avaliacao">{'★'.repeat(book.estrelas || 0)}{'☆'.repeat(5-(book.estrelas || 0))}</div>
              <div className="cartao-livro__preco-container">
                 <p className="cartao-livro__preco">R$ {book.preco.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <div className="cartao-livro__acao">
               <a href={`/livro/${book.uuid}`} className="botao btn-secondary">Ver Detalhes</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
