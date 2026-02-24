import { useState, useEffect } from 'react';
import { LivroService } from '@/services/LivroService';
import type { Livro } from '@/interfaces/Livro';

export function useLivrosDestaque() {
  const [destaques, setDestaques] = useState<Livro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    LivroService.getDestaques()
      .then((data) => {
        setDestaques(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { destaques, loading, error };
}

export function useDetalhesLivro(id: string) {
  const [livro, setLivro] = useState<Livro | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    LivroService.getDetalhes(id)
      .then((data) => {
        setLivro(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  return { livro, loading, error };
}

export function useListaLivrosAdmin() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    LivroService.getListaAdmin()
      .then((data) => {
        setLivros(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { livros, loading, error };
}
