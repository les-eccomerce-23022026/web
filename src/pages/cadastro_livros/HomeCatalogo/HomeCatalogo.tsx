import { Link, useNavigate } from 'react-router-dom';
import './HomeCatalogo.css';
import { useLivrosDestaque } from '@/hooks/useLivros';
import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/comum/ErrorState/ErrorState';
import { useAppSelector } from '@/store/hooks';
import { ShoppingCart, AlertCircle } from 'lucide-react';
import { CapaLivro } from '@/components/comum/CapaLivro/CapaLivro';
import { ControlesCompra } from '@/components/comum/ControlesCompra/ControlesCompra';

export function HomeCatalogo() {
  const { destaques, loading, error } = useLivrosDestaque();
  const navigate = useNavigate();
  const carrinho = useAppSelector((state) => state.carrinho.data);

  const getQuantidadeNoCarrinho = (bookUuid: string) => {
    if (!carrinho) return 0;
    const item = carrinho.itens.find(i => i.uuid === bookUuid);
    return item ? item.quantidade : 0;
  };

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
        {destaques.map((book) => {
          const quantidadeNoCarrinho = getQuantidadeNoCarrinho(book.uuid);
          return (
            <div 
              key={book.uuid} 
              className="cartao-livro"
              onClick={() => navigate(`/livro/${book.uuid}`)}
            >
              {quantidadeNoCarrinho > 0 && (
                <div className="cartao-livro__badge-carrinho" title={`${quantidadeNoCarrinho} no carrinho`}>
                  <ShoppingCart size={14} />
                  <span>{quantidadeNoCarrinho}</span>
                  {quantidadeNoCarrinho > 1 && (
                    <span title="Múltiplas unidades no carrinho">
                      <AlertCircle size={14} className="cartao-livro__alerta-quantidade" />
                    </span>
                  )}
                </div>
              )}
              <div className="cartao-livro__capa-container">
                <CapaLivro src={book.imagem} alt={book.titulo} titulo={book.titulo} className="cartao-livro__capa" />
              </div>
              <div className="cartao-livro__info">
                <h4 className="cartao-livro__titulo">{book.titulo}</h4>
                <p className="cartao-livro__autor">{book.autor}</p>
                <div className="cartao-livro__avaliacao">{'★'.repeat(book.estrelas || 0)}{'☆'.repeat(5 - (book.estrelas || 0))}</div>
                <div className="cartao-livro__preco-container">
                  <p className="cartao-livro__preco">R$ {book.preco.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              <div className="cartao-livro__acao" onClick={(e) => e.stopPropagation()}>
                <Link to={`/livro/${book.uuid}`} className="botao btn-secondary">Ver Detalhes</Link>
                <ControlesCompra livro={book} variant="card" className="cartao-livro__linha-compra" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
