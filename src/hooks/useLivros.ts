import { useState, useEffect } from 'react';
import { LivroService } from '@/services/livroService';
import type { ILivro } from '@/interfaces/livro';
import { useAppSelector } from '@/store/hooks';

export function useLivrosDestaque() {
  const livros = useAppSelector((state) => state.livro.livrosDestaque);
  const termoBusca = useAppSelector((state) => state.livro.termoBusca).toLowerCase();
  const isLoading = useAppSelector((state) => state.livro.statusDestaque === 'loading');
  const error = useAppSelector((state) =>
    state.livro.statusDestaque === 'failed' ? new Error(state.livro.errorDestaque || 'Erro') : null,
  );

  const hasError = error !== null;

  // Ocultamos apenas livros explicitamente inativos; ausência de `status` (ex.: mock legado) conta como ativo
  const destaques = livros
    .filter((l) => l.status !== 'Inativo')
    .filter(l => {
      if (!termoBusca) return true;

      const matchTitulo = l.titulo.toLowerCase().includes(termoBusca);
      const matchAutor = l.autor.toLowerCase().includes(termoBusca);
      const matchSinopse = l.sinopse?.toLowerCase().includes(termoBusca) || false;

      return matchTitulo || matchAutor || matchSinopse;
    });

  return { destaques, isLoading, hasError, error };
}

export function useDetalhesLivro(id: string) {
  const [livroBusca, setLivroBusca] = useState<ILivro | null>(null);
  const [isLoadingBusca, setIsLoadingBusca] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);

  // Derivamos o livro: se estiver no store (destaque ou admin), usamos ele. Caso contrário, fetch.
  const foundInStore =
    livrosDestaque.find((l) => l.uuid === id) || livrosAdmin.find((l) => l.uuid === id);
  const livro = foundInStore || livroBusca;
  const isLoading = foundInStore ? false : isLoadingBusca;
  const hasError = error !== null;

  useEffect(() => {
    // Se já encontramos no store, não precisamos disparar o fetch
    if (foundInStore) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoadingBusca(true);
    LivroService.getDetalhes(id)
      .then((data) => {
        setLivroBusca(data);
        setIsLoadingBusca(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoadingBusca(false);
      });
  }, [id, foundInStore]);

  return { livro, isLoading, hasError, error };
}

export function useListaLivrosAdmin() {
  const livros = useAppSelector((state) => state.livro.livrosAdmin);
  const isLoading = useAppSelector((state) => state.livro.statusAdmin === 'loading');
  const error = useAppSelector((state) =>
    state.livro.statusAdmin === 'failed' ? new Error(state.livro.errorAdmin || 'Erro') : null,
  );

  const hasError = error !== null;

  return { livros, isLoading, hasError, error };
}
