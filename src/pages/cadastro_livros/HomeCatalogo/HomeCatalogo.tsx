import { Link, useNavigate } from 'react-router-dom';
import './HomeCatalogo.css';
import { useLivrosDestaque } from '@/hooks/useLivros';
import { LoadingState } from '@/components/comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/comum/ErrorState/ErrorState';
import { EmptyState } from '@/components/comum/EmptyState/EmptyState';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setTermoBusca } from '@/store/slices/livroSlice';
import { ShoppingCart, AlertCircle, X, Search } from 'lucide-react';
import { CapaLivro } from '@/components/comum/CapaLivro/CapaLivro';
import { ControlesCompra } from '@/components/comum/ControlesCompra/ControlesCompra';

export function HomeCatalogo() {
  const { destaques, loading, error } = useLivrosDestaque();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const termoBusca = useAppSelector((state) => state.livro.termoBusca);

  const getQuantidadeNoCarrinho = (bookUuid: string) => {
    if (!carrinho) return 0;
    const item = carrinho.itens.find(i => i.uuid === bookUuid);
    return item ? item.quantidade : 0;
  };

  const handleLimparBusca = () => {
    dispatch(setTermoBusca(''));
  };

  if (loading) {
    return <LoadingState message="Buscando os melhores destaques para você..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Oops! Tivemos um problema"
        message="Não foi possível carregar os destaques da livraria no momento. Nossa equipe já foi notificada."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="home-catalogo page-transition-enter">
      {!termoBusca && (
        <div className="pagina-inicio__banner">
          <h2 className="pagina-inicio__banner-titulo">Ofertas de Inverno - Até 50% em Ficção</h2>
        </div>
      )}

      <div className="catalogo-header">
        {termoBusca ? (
          <div className="search-results-info">
            <h3>Resultados para: <span>"{termoBusca}"</span></h3>
            <button className="btn-clear-search" onClick={handleLimparBusca} title="Limpar busca">
              <X size={16} /> Limpar Filtros
            </button>
          </div>
        ) : (
          <h3>Lançamentos Destacados</h3>
        )}
      </div>

      {destaques.length === 0 ? (
        <EmptyState 
          title="Nenhum livro por aqui?" 
          message={termoBusca 
            ? `Não encontramos resultados para "${termoBusca}". Tente termos mais genéricos ou verifique a ortografia.`
            : "No momento não temos livros cadastrados nesta categoria. Volte em breve para novos lançamentos!"
          }
          icon={<Search size={80} strokeWidth={1} color="var(--bn-primary)" />}
        />
      ) : (
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
                  <div className="cartao-livro__info">
                    <h4 className="cartao-livro__titulo">{book.titulo}</h4>
                    <p className="cartao-livro__autor">{book.autor}</p>
                    <div className="cartao-livro__avaliacao">{'★'.repeat(book.estrelas || 0)}{'☆'.repeat(5 - (book.estrelas || 0))}</div>
                  </div>
                </div>
                <div className="cartao-livro__preco-container">
                  <p className="cartao-livro__preco">R$ {book.preco.toFixed(2).replace('.', ',')}</p>
                </div>
                <div className="cartao-livro__acao" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/livro/${book.uuid}`} className="botao btn-secondary">Ver Detalhes</Link>
                  <ControlesCompra livro={book} variant="card" className="cartao-livro__linha-compra" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
