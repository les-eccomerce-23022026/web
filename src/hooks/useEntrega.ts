import { useState, useCallback, useMemo } from 'react';
import { EntregaServiceApi } from '../services/api/entregaServiceApi';
import type { 
  IEntregaInputDto,
  IEntregaOutputDto,
  IFreteCalculoOutput,
  IFreteOpcao
} from '../interfaces/entrega';
import {
  criarDadosCalculoFrete,
  criarDadosEntrega,
  normalizarCepHidratado,
  normalizarErroEntrega,
} from './useEntregaHelpers';

export function validarCep(cep: string): boolean {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.length === 8;
}

export function formatarCep(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length <= 5) {
    return cepLimpo;
  }
  return cepLimpo.slice(0, 5) + '-' + cepLimpo.slice(5, 8);
}

export function useEntrega() {
  const [freteCalculado, setFreteCalculado] = useState<IFreteCalculoOutput | null>(null);
  const [freteSelecionado, setFreteSelecionado] = useState<IFreteOpcao | null>(null);
  const [cepDestino, setCepDestino] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [entregaCadastrada, setEntregaCadastrada] = useState<IEntregaOutputDto | null>(null);

  const service = useMemo(() => new EntregaServiceApi(), []);

  const calcularFrete = useCallback(async (cep: string, peso?: number, valorTotal?: number) => {
    setLoading(true);
    setError(null);
    try {
      if (!validarCep(cep)) {
        throw new Error('CEP inválido');
      }
      const dados = criarDadosCalculoFrete(cep, peso, valorTotal);
      const resultado = await service.calcularFrete(dados);
      setFreteCalculado(resultado);
      setCepDestino(cep);
      return resultado;
    } catch (err) {
      setError(normalizarErroEntrega(err, 'Erro ao calcular frete'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const selecionarFrete = useCallback((frete: IFreteOpcao) => {
    setFreteSelecionado(frete);
  }, []);

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
      const dados = criarDadosEntrega(
        vendaUuid,
        freteSelecionado.tipo,
        endereco,
        freteSelecionado.valor,
      );
      const entrega = await service.cadastrarEntrega(dados);
      setEntregaCadastrada(entrega);
      return entrega;
    } catch (err) {
      setError(normalizarErroEntrega(err, 'Erro ao cadastrar entrega'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [service, freteSelecionado]);

  const limparFrete = useCallback(() => {
    setFreteCalculado(null);
    setFreteSelecionado(null);
    setCepDestino('');
    setError(null);
  }, []);

  /** Restaura cotação vinda do carrinho (Redux) no checkout. */
  const hidratarFrete = useCallback(
    (payload: { freteCalculado: IFreteCalculoOutput; opcao: IFreteOpcao; cep: string }) => {
      setFreteCalculado(payload.freteCalculado);
      setFreteSelecionado(payload.opcao);
      setCepDestino(normalizarCepHidratado(payload.cep));
      setError(null);
    },
    [],
  );

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
    hidratarFrete,

    // Utilitários
    validarCep,
    formatarCep
  };
}
