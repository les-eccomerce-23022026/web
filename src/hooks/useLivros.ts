import { useState, useEffect } from 'react';
import { LivroService } from '@/services/LivroService';
import type { ILivro } from '@/interfaces/ILivro';
import { useAppSelector } from '@/store/hooks';

export function useLivrosDestaque() {
  const livros = useAppSelector((state) => state.livro.livros);
  const termoBusca = useAppSelector((state) => state.livro.termoBusca).toLowerCase();
  const loading = useAppSelector((state) => state.livro.status === 'loading');
  const error = useAppSelector((state) => state.livro.status === 'failed' ? new Error(state.livro.error || 'Erro') : null);

  // Consideramos como "destaques" os livros que estão Ativos no catálogo centralizado
  // E filtramos pelo termo de busca dinâmico (título, autor ou sinopse)
  const destaques = livros
    .filter(l => l.status === 'Ativo')
    .filter(l => {
      if (!termoBusca) return true;
      
      const matchTitulo = l.titulo.toLowerCase().includes(termoBusca);
      const matchAutor = l.autor.toLowerCase().includes(termoBusca);
      const matchSinopse = l.sinopse?.toLowerCase().includes(termoBusca) || false;
      
      return matchTitulo || matchAutor || matchSinopse;
    });

  return { destaques, loading, error };
}

export function useDetalhesLivro(id: string) {
  const [livroBusca, setLivroBusca] = useState<ILivro | null>(null);
  const [loadingBusca, setLoadingBusca] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const livrosStore = useAppSelector((state) => state.livro.livros);

  // Derivamos o livro: se estiver no store, usamos ele. Caso contrário, usamos o da busca (fetch)
  const foundInStore = livrosStore.find((l) => l.uuid === id);
  const livro = foundInStore || livroBusca;
  const loading = foundInStore ? false : loadingBusca;

  useEffect(() => {
    // Se já encontramos no store, não precisamos disparar o fetch
    if (foundInStore) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingBusca(true);
    LivroService.getDetalhes(id)
      .then((data) => {
        setLivroBusca(data);
        setLoadingBusca(false);
      })
      .catch((err) => {
        setError(err);
        setLoadingBusca(false);
      });
  }, [id, foundInStore]);

  return { livro, loading, error };
}

export function useListaLivrosAdmin() {
  const livros = useAppSelector(state => state.livro.livros);
  const loading = useAppSelector(state => state.livro.status === 'loading');
  const error = useAppSelector(state => state.livro.status === 'failed' ? new Error(state.livro.error || 'Erro') : null);

  return { livros, loading, error };
}
