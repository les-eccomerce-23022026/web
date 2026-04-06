import { useState, useEffect } from 'react';
import { LivroService } from '@/services/livroService';
import type { ILivro } from '@/interfaces/livro';
import { useAppSelector } from '@/store/hooks';

export function useLivrosDestaque() {
  const livros = useAppSelector((state) => state.livro.livrosDestaque);
  const termoBusca = useAppSelector((state) => state.livro.termoBusca).toLowerCase();
  const loading = useAppSelector((state) => state.livro.statusDestaque === 'loading');
  const error = useAppSelector((state) =>
    state.livro.statusDestaque === 'failed' ? new Error(state.livro.errorDestaque || 'Erro') : null,
  );

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

  return { destaques, loading, error };
}

export function useDetalhesLivro(id: string) {
  const [livroBusca, setLivroBusca] = useState<ILivro | null>(null);
  const [loadingBusca, setLoadingBusca] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const livrosDestaque = useAppSelector((state) => state.livro.livrosDestaque);
  const livrosAdmin = useAppSelector((state) => state.livro.livrosAdmin);

  // Derivamos o livro: se estiver no store (destaque ou admin), usamos ele. Caso contrário, fetch.
  const foundInStore =
    livrosDestaque.find((l) => l.uuid === id) || livrosAdmin.find((l) => l.uuid === id);
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
  const livros = useAppSelector((state) => state.livro.livrosAdmin);
  const loading = useAppSelector((state) => state.livro.statusAdmin === 'loading');
  const error = useAppSelector((state) =>
    state.livro.statusAdmin === 'failed' ? new Error(state.livro.errorAdmin || 'Erro') : null,
  );

  return { livros, loading, error };
}
