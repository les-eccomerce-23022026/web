'use client';

import { useEffect } from 'react';
import { useLivrosDestaque } from '@/hooks/useLivros';
import { LoadingState } from '@/components/Comum/LoadingState/LoadingState';
import { ErrorState } from '@/components/Comum/ErrorState/ErrorState';
import { EmptyState } from '@/components/Comum/EmptyState/EmptyState';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchLivros, fetchCategoriasCatalogo } from '@/store/slices/livroSlice';
import { Search } from 'lucide-react';
import { LivroCard } from './LivroCard';
import { CatalogoHeader } from './CatalogoHeader';
import { CatalogoPaginacao } from './CatalogoPaginacao';
import '@/pages-react-router/CadastroLivros/CatalogoLivros/CatalogoLivros.css';
import { ChatFlutuante } from '@/components/ChatRecomendacao/ChatFlutuante';

export const CatalogoLivros = () => {
  const dispatch = useAppDispatch();
  const { destaques, loading, error } = useLivrosDestaque();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const termoBusca = useAppSelector((state) => state.livro.termoBusca);
  const totalCatalogo = useAppSelector((state) => state.livro.totalCatalogo);
  const paginaCatalogo = useAppSelector((state) => state.livro.paginaCatalogo);
  const itensPorPaginaCatalogo = useAppSelector((state) => state.livro.itensPorPaginaCatalogo);

  useEffect(() => {
    void dispatch(fetchLivros({ pagina: 1, itensPorPagina: 10, ordenacao: 'recentes' }));
    void dispatch(fetchCategoriasCatalogo());
  }, [dispatch]);

  const getQuantidadeNoCarrinho = (bookUuid: string) => {
    if (!carrinho) return 0;
    const item = carrinho.itens.find((i) => i.uuid === bookUuid);
    return item ? item.quantidade : 0;
  };

  const totalPaginas = Math.max(1, Math.ceil(totalCatalogo / itensPorPaginaCatalogo) || 1);

  const handlePaginaAnterior = () => {
    if (paginaCatalogo > 1) {
      void dispatch(fetchLivros({ 
        pagina: paginaCatalogo - 1, 
        itensPorPagina: itensPorPaginaCatalogo, 
        ordenacao: 'recentes' 
      }));
    }
  };

  const handleProximaPagina = () => {
    if (paginaCatalogo < totalPaginas) {
      void dispatch(fetchLivros({ 
        pagina: paginaCatalogo + 1, 
        itensPorPagina: itensPorPaginaCatalogo, 
        ordenacao: 'recentes' 
      }));
    }
  };

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
      <CatalogoHeader termoBusca={termoBusca} />
      <ChatFlutuante />

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
            {destaques.map((book) => (
              <LivroCard
                key={book.uuid}
                livro={book}
                quantidadeNoCarrinho={getQuantidadeNoCarrinho(book.uuid)}
              />
            ))}
          </div>

          {totalPaginas > 1 && (
            <CatalogoPaginacao
              paginaAtual={paginaCatalogo}
              totalPaginas={totalPaginas}
              totalItens={totalCatalogo}
              onPaginaAnterior={handlePaginaAnterior}
              onProximaPagina={handleProximaPagina}
            />
          )}
        </>
      )}
    </div>
  );
};
