import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import './CatalogoLivros.css';
import { useLivrosDestaque } from '../../../hooks/useLivros';
import { LoadingState } from '../../../components/Comum/LoadingState/LoadingState.tsx';
import { ErrorState } from '../../../components/Comum/ErrorState/ErrorState.tsx';
import { EmptyState } from '../../../components/Comum/EmptyState/EmptyState.tsx';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { fetchLivros, setTermoBusca } from '../../../store/slices/livroSlice';
import { CapaLivro } from '../../../components/Comum/CapaLivro/CapaLivro.tsx';
import { ControlesCompra } from '../../../components/Comum/ControlesCompra/ControlesCompra.tsx';
import { ShoppingCart, AlertCircle, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const CatalogoLivros = () => {
  const { destaques, loading, error } = useLivrosDestaque();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const carrinho = useAppSelector((state) => state.carrinho.data);
  const termoBusca = useAppSelector((state) => state.livro.termoBusca);
  const categoriasMenu = useAppSelector((state) => state.livro.categoriasMenu);
  const totalCatalogo = useAppSelector((state) => state.livro.totalCatalogo);
  const paginaCatalogo = useAppSelector((state) => state.livro.paginaCatalogo);
  const itensPorPaginaCatalogo = useAppSelector((state) => state.livro.itensPorPaginaCatalogo);

  const isMaisVendidos = pathname === '/mais-vendidos';
  const slug = params.slug as string | undefined;

  const paginaAtual = useMemo(() => {
    const p = parseInt(searchParams.get('pagina') || '1', 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  }, [searchParams]);

  useEffect(() => {
    void dispatch(
      fetchLivros({
        pagina: paginaAtual,
        itensPorPagina: 10,
        categoria: slug,
        ordenacao: isMaisVendidos ? 'mais-vendidos' : 'recentes',
      }),
    );
  }, [dispatch, slug, isMaisVendidos, paginaAtual]);

  const tituloSecao = useMemo(() => {
    if (termoBusca) return null;
    if (isMaisVendidos) return 'Mais vendidos';
    if (slug) {
      return categoriasMenu.find((c) => c.slug === slug)?.nome ?? slug;
    }
    return 'Lançamentos em destaque';
  }, [termoBusca, isMaisVendidos, slug, categoriasMenu]);

  const totalPaginas = Math.max(1, Math.ceil(totalCatalogo / itensPorPaginaCatalogo) || 1);

  const getQuantidadeNoCarrinho = (bookUuid: string) => {
    if (!carrinho) return 0;
    const item = carrinho.itens.find((i) => i.uuid === bookUuid);
    return item ? item.quantidade : 0;
  };

  const handleLimparBusca = () => {
    dispatch(setTermoBusca(''));
  };

  const handlePaginaChange = (novaPagina: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pagina', novaPagina.toString());
    router.push(`?${params.toString()}`);
  };

  const mostrarBanner = !termoBusca && !slug && !isMaisVendidos;

  if (loading) {
    return <LoadingState message="Carregando o catálogo..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Oops! Tivemos um problema"
        message="Não foi possível carregar o catálogo no momento. Nossa equipe já foi notificada."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="home-catalogo page-transition-enter">
      {mostrarBanner && (
        <div className="pagina-inicio__banner">
          <h2 className="pagina-inicio__banner-titulo">Ofertas de Inverno - Até 50% em Ficção</h2>
        </div>
      )}

      <div className="catalogo-header">
        {termoBusca ? (
          <div className="search-results-info">
            <h3>
              Resultados para: <span>&quot;{termoBusca}&quot;</span>
            </h3>
            <button className="btn-clear-search" onClick={handleLimparBusca} title="Limpar busca">
              <X size={16} /> Limpar Filtros
            </button>
          </div>
        ) : (
          <h3>{tituloSecao}</h3>
        )}
      </div>

      {destaques.length === 0 ? (
        <EmptyState
          title="Nenhum livro por aqui?"
          message={
            termoBusca
              ? `Não encontramos resultados para o termo ${termoBusca}. Tente termos mais genéricos ou verifique a ortografia.`
              : 'No momento não temos livros cadastrados nesta categoria. Volte em breve para novos lançamentos!'
          }
          icon={<Search size={80} strokeWidth={1} color="var(--bn-primary)" />}
        />
      ) : (
        <>
          <div className="grade grade--produto">
            {destaques.map((book) => {
              const quantidadeNoCarrinho = getQuantidadeNoCarrinho(book.uuid);
              return (
                <div
                  key={book.uuid}
                  className="cartao-livro"
                  data-cy="livro-card"
                  onClick={() => router.push(`/livro/${book.uuid}`)}
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
                      <div className="cartao-livro__avaliacao">
                        {'★'.repeat(book.estrelas || 0)}
                        {'☆'.repeat(5 - (book.estrelas || 0))}
                      </div>
                    </div>
                  </div>
                  <div className="cartao-livro__preco-container">
                    <p className="cartao-livro__preco">R$ {book.preco.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="cartao-livro__acao" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/livro/${book.uuid}`} className="botao btn-secondary">
                      Ver Detalhes
                    </Link>
                    <ControlesCompra livro={book} variant="card" className="cartao-livro__linha-compra" />
                  </div>
                </div>
              );
            })}
          </div>

          {totalPaginas > 1 && (
            <div className="catalogo-paginacao" role="navigation" aria-label="Paginação do catálogo">
              <button
                type="button"
                className="catalogo-paginacao__btn"
                disabled={paginaCatalogo <= 1}
                onClick={() => handlePaginaChange(paginaCatalogo - 1)}
                aria-label="Página anterior"
              >
                <ChevronLeft size={20} /> Anterior
              </button>
              <span className="catalogo-paginacao__info">
                Página {paginaCatalogo} de {totalPaginas} ({totalCatalogo} livros)
              </span>
              <button
                type="button"
                className="catalogo-paginacao__btn"
                disabled={paginaCatalogo >= totalPaginas}
                onClick={() => handlePaginaChange(paginaCatalogo + 1)}
                aria-label="Próxima página"
              >
                Próxima <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
