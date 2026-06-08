import { useState, useEffect, useCallback, useRef } from 'react';
import { AnaliseVendasService } from '../services/analiseVendasService';
import type { FiltroAnaliseVendas, RespostaAnaliseVendas } from '../services/contracts/analiseVendasService';

export function useAnaliseVendasCategoria() {
  const [dados, setDados] = useState<RespostaAnaliseVendas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const buscarDados = useCallback(async (filtro: FiltroAnaliseVendas) => {
    if (!filtro.dataInicio || !filtro.dataFim) {
      setError('Data de início e fim são obrigatórias');
      return;
    }

    setLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const resultado = await AnaliseVendasService.obterAnaliseVendasPorCategoria(filtro);
      setDados(resultado);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { dados, loading, error, buscarDados };
}
