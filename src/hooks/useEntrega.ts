import { useState, useCallback, useMemo } from 'react';
import { EntregaServiceApi } from '@/services/api/entregaServiceApi';
import type { 
  IEntregaInputDto,
  IEntregaOutputDto,
  IFreteCalculoInput,
  IFreteCalculoOutput,
  IFreteOpcao
} from '@/interfaces/entrega';

/**
 * Valida CEP (deve ter 8 dígitos)
 */
export function validarCep(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
}

/**
 * Formata CEP para o formato 00000-000
 */
export function formatarCep(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length <= 5) {
    return cepLimpo;
  }
  
  return cepLimpo.slice(0, 5) + '-' + cepLimpo.slice(5, 8);
}

/**
 * Hook para gerenciamento de entrega/frete no checkout
 */
export function useEntrega() {
  const [freteCalculado, setFreteCalculado] = useState<IFreteCalculoOutput | null>(null);
  const [freteSelecionado, setFreteSelecionado] = useState<IFreteOpcao | null>(null);
  const [cepDestino, setCepDestino] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [entregaCadastrada, setEntregaCadastrada] = useState<IEntregaOutputDto | null>(null);

  const service = useMemo(() => new EntregaServiceApi(), []);

  /**
   * Calcula frete para um CEP
   */
  const calcularFrete = useCallback(async (cep: string, peso?: number, valorTotal?: number) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!validarCep(cep)) {
        throw new Error('CEP inválido');
      }
      
      const dados: IFreteCalculoInput = {
        cepDestino: cep,
        peso,
        valorTotal
      };
      
      const resultado = await service.calcularFrete(dados);
      setFreteCalculado(resultado);
      setCepDestino(cep);
      
      return resultado;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao calcular frete'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [service]);

  /**
   * Seleciona opção de frete
   */
  const selecionarFrete = useCallback((frete: IFreteOpcao) => {
    setFreteSelecionado(frete);
  }, []);

  /**
   * Cadastra entrega para uma venda
   */
  const cadastrarEntrega = useCallback(async (
    vendaUuid: string,
    endereco: IEntregaInputDto['endereco']
  ): Promise<IEntregaOutputDto | null> => {
    if (!freteSelecionado) {
      setError(new Error('Selecione uma opção de frete'));
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const dados: IEntregaInputDto = {
        vendaUuid,
        tipoFrete: freteSelecionado.tipo,
        endereco,
        custo: freteSelecionado.valor
      };
      
      const entrega = await service.cadastrarEntrega(dados);
      setEntregaCadastrada(entrega);
      
      return entrega;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao cadastrar entrega'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, freteSelecionado]);

  /**
   * Limpa estado de frete
   */
  const limparFrete = useCallback(() => {
    setFreteCalculado(null);
    setFreteSelecionado(null);
    setCepDestino('');
    setError(null);
  }, []);

  return {
    // Estado
    freteCalculado,
    freteSelecionado,
    cepDestino,
    loading,
    error,
    entregaCadastrada,
    
    // Ações
    calcularFrete,
    selecionarFrete,
    cadastrarEntrega,
    limparFrete,
    
    // Utilitários
    validarCep,
    formatarCep
  };
}
