import './HomeCatalogo.css';
import { useLivrosDestaque } from '@/hooks/useLivros';
import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/comum/ErrorState/ErrorState';

export function HomeCatalogo() {
  const { destaques, loading, error } = useLivrosDestaque();

  if (loading) {
    return <LoadingState message="Buscando os melhores destaques para você..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message="Ops, não foi possível carregar os destaques no momento."
        onRetry={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="home-catalogo page-transition-enter">
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
