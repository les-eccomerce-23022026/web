import { useState, useCallback, useEffect } from 'react';
import { estoqueServiceApi } from '@/services/api/estoqueServiceApi';
import type { IItemEstoque, IKpisEstoque, IEntradaEstoque } from '@/services/contracts/estoqueService';
import { LIMITE_ESTOQUE_CRITICO } from '@/config/constantesNegocio';

interface UseEstoqueReturn {
  estoque: IItemEstoque[];
  estoqueCritico: IItemEstoque[];
  kpis: IKpisEstoque | null;
  loading: boolean;
  error: Error | null;
  carregarDados: () => Promise<void>;
  registrarEntrada: (dados: IEntradaEstoque) => Promise<void>;
}

export function useEstoque(): UseEstoqueReturn {
  const [estoque, setEstoque] = useState<IItemEstoque[]>([]);
  const [estoqueCritico, setEstoqueCritico] = useState<IItemEstoque[]>([]);
  const [kpis, setKpis] = useState<IKpisEstoque | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[useEstoque] Iniciando carregamento de dados do estoque...');
      
      const [dadosEstoque, dadosCritico, dadosKpis] = await Promise.all([
        estoqueServiceApi.listarEstoque(),
        estoqueServiceApi.listarEstoqueCritico(LIMITE_ESTOQUE_CRITICO),
        estoqueServiceApi.obterKpis(LIMITE_ESTOQUE_CRITICO),
      ]);

      console.log('[useEstoque] Dados carregados com sucesso:', {
        estoque: dadosEstoque.length,
        critico: dadosCritico.length,
        kpis: dadosKpis,
      });

      setEstoque(dadosEstoque);
      setEstoqueCritico(dadosCritico);
      setKpis(dadosKpis);
    } catch (err) {
      console.error('[useEstoque] Erro ao carregar dados:', err);
      
      // Tratamento específico para erros de parsing JSON
      if (err instanceof SyntaxError) {
        setError(new Error('Erro ao processar dados do servidor. Formato inválido recebido.'));
      } else if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Erro desconhecido ao carregar estoque.'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados automaticamente ao montar o hook
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const registrarEntrada = useCallback(async (dados: IEntradaEstoque) => {
    try {
      console.log('[useEstoque] Registrando entrada de estoque:', dados);
      
      await estoqueServiceApi.registrarEntrada(dados);
      
      console.log('[useEstoque] Entrada registrada com sucesso, recarregando dados...');
      await carregarDados();
    } catch (err) {
      console.error('[useEstoque] Erro ao registrar entrada:', err);
      
      if (err instanceof SyntaxError) {
        throw new Error('Erro ao processar resposta do servidor. Formato inválido.');
      } else if (err instanceof Error) {
        throw err;
      } else {
        throw new Error('Erro desconhecido ao registrar entrada.');
      }
    }
  }, [carregarDados]);

  return {
    estoque,
    estoqueCritico,
    kpis,
    loading,
    error,
    carregarDados,
    registrarEntrada,
  };
}
