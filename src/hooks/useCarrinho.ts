import { useState, useEffect } from 'react';
import { CarrinhoService } from '@/services/CarrinhoService';
import type { Carrinho } from '@/interfaces/Carrinho';

export function useCarrinho() {
  const [data, setData] = useState<Carrinho | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    CarrinhoService.getCarrinho()
      .then((carrinhoData) => {
        setData(carrinhoData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
