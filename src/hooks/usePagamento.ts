import { useState, useCallback, useMemo } from 'react';
import { PagamentoServiceApi } from '@/services/api/PagamentoServiceApi';
import type {
  IPagamentoInfo,
  IPagamentoSelecionado,
  IPagamentoDetalhes,
  ICartaoCreditoInput,
  ICartaoSalvoPagamento,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado,
  ICupomAplicado,
  IFreteOpcao
} from '@/interfaces/IPagamento';

/**
 * Valida número de cartão usando Algoritmo de Luhn
 * @param numero - Número do cartão (apenas dígitos)
 * @returns true se válido, false se inválido
 */
export function validarLuhn(numero: string): boolean {
  const numeros = numero.replace(/\D/g, '');
  
  if (numeros.length < 13 || numeros.length > 19) {
    return false;
  }
  
  let soma = 0;
  let alternar = false;
  
  for (let i = numeros.length - 1; i >= 0; i--) {
    let digito = parseInt(numeros.charAt(i), 10);
    
    if (alternar) {
      digito *= 2;
      if (digito > 9) {
        digito -= 9;
      }
    }
    
    soma += digito;
    alternar = !alternar;
  }
  
  return soma % 10 === 0;
}

/**
 * Detecta bandeira do cartão pelo prefixo (BIN)
 * @param numero - Número do cartão
 * @returns Nome da bandeira ou null se não identificada
 */
export function detectarBandeira(numero: string): string | null {
  const numeros = numero.replace(/\D/g, '');
  
  // Visa: começa com 4
  if (/^4/.test(numeros)) return 'Visa';
  
  // Mastercard: começa com 51-55 ou 2221-2720
  if (/^5[1-5]/.test(numeros) || /^2(2[2-9][1-9]|[3-6]\d{2}|7[0-1]\d|720)/.test(numeros)) {
    return 'Mastercard';
  }
  
  // American Express: começa com 34 ou 37
  if (/^3[47]/.test(numeros)) return 'American Express';
  
  // Elo: faixas específicas
  if (
    /^4011(78|79)/.test(numeros) ||
    /^43(1274|8935)/.test(numeros) ||
    /^45(1274|763(2|3)|769(3|4|5|6|7))/.test(numeros) ||
    /^50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])/.test(numeros) ||
    /^627780/.test(numeros) ||
    /^63(6297|6368)/.test(numeros) ||
    /^65(0(0(3([1-3][0-9]|4[0-9])|4([2-3][0-9]|4[0-9]|5[0-2])|5([0-2][0-9]|3[0-8])|9([0-2][0-9]|3[0-7]))|[1-8][0-9]{3}|9[0-2][0-9]{2}|93[0-7][0-9])|16(5[2-9][0-9]|6[0-3][0-9])|50(0[0-9]|1[0-8][0-9]|19[0-5]))/.test(numeros)
  ) {
    return 'Elo';
  }
  
  // Hipercard: começa com 60
  if (/^60/.test(numeros)) return 'Hipercard';
  
  return null;
}

/**
 * Valida dados de cartão de crédito
 * @param cartao - Dados do cartão
 * @param bandeirasPermitidas - Lista de bandeiras aceitas
 * @returns Objeto com validação e mensagens de erro
 */
export function validarCartao(
  cartao: ICartaoCreditoInput,
  bandeirasPermitidas: string[] = []
): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  
  // Validar número
  const numeroLimpo = cartao.numero.replace(/\D/g, '');
  if (numeroLimpo.length < 13 || numeroLimpo.length > 19) {
    erros.push('Número do cartão inválido (13-19 dígitos)');
  } else if (!validarLuhn(numeroLimpo)) {
    erros.push('Número do cartão inválido (falha na validação)');
  }
  
  // Validar bandeira
  const bandeira = detectarBandeira(cartao.numero) || cartao.bandeira;
  if (bandeirasPermitidas.length > 0 && !bandeirasPermitidas.includes(bandeira)) {
    erros.push(`Bandeira ${bandeira} não é aceita. Permitidas: ${bandeirasPermitidas.join(', ')}`);
  }
  
  // Validar nome do titular
  if (!cartao.nomeTitular || cartao.nomeTitular.trim().length < 2) {
    erros.push('Nome do titular inválido');
  }
  
  // Validar validade (MM/AA)
  const validadeRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!validadeRegex.test(cartao.validade)) {
    erros.push('Validade deve estar no formato MM/AA');
  } else {
    const [mes, ano] = cartao.validade.split('/').map(Number);
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear() % 100;
    const mesAtual = dataAtual.getMonth() + 1;
    
    if (ano < anoAtual || (ano === anoAtual && mes < mesAtual)) {
      erros.push('Cartão expirado');
    }
  }
  
  // Validar CVV (3-4 dígitos)
  const cvvLimpo = cartao.cvv.replace(/\D/g, '');
  if (cvvLimpo.length < 3 || cvvLimpo.length > 4) {
    erros.push('CVV inválido (3-4 dígitos)');
  }
  
  return { valido: erros.length === 0, erros };
}

/**
 * Valida valor de pagamento parcial
 * @param valor - Valor a validar
 * @param minimo - Valor mínimo (padrão: R$ 10,00)
 * @returns true se válido
 */
export function validarValorParcial(valor: number, minimo: number = 10): boolean {
  return valor >= minimo;
}

/**
 * Hook para gerenciamento de pagamento no checkout
 */
export function usePagamento() {
  const [info, setInfo] = useState<IPagamentoInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [processando, setProcessando] = useState<boolean>(false);
  
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<IPagamentoSelecionado | null>(null);
  const [cuponsAplicados, setCuponsAplicados] = useState<ICupomAplicado[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<IFreteOpcao | null>(null);
  const [pagamentosParciais, setPagamentosParciais] = useState<{ cartaoUuid: string; valor: number }[]>([]);

  const service = useMemo(() => new PagamentoServiceApi(), []);
  
  /**
   * Carrega informações de pagamento do backend
   */
  const carregarInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dados = await service.obterPagamentoInfo();
      setInfo(dados);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar informações de pagamento'));
    } finally {
      setLoading(false);
    }
  }, [service]);
  
  /**
   * Seleciona forma de pagamento
   */
  const selecionarPagamento = useCallback(async (dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes | null> => {
    setError(null);
    
    try {
      const resultado = await service.definirMetodoLiquidacao(dados);
      setPagamentoSelecionado(dados);
      return resultado;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao selecionar forma de pagamento'));
      return null;
    }
  }, [service]);
  
  /**
   * Aplica cupom de desconto
   */
  const aplicarCupom = useCallback((cupom: ICupomAplicado) => {
    // Cupom promocional é único
    if (cupom.tipo === 'promocional') {
      const outrosPromocionais = cuponsAplicados.filter(c => c.tipo === 'promocional');
      if (outrosPromocionais.length > 0) {
        setError(new Error('Apenas um cupom promocional é permitido por compra'));
        return false;
      }
    }
    
    setCuponsAplicados(prev => [...prev, cupom]);
    return true;
  }, [cuponsAplicados]);
  
  /**
   * Remove cupom aplicado
   */
  const removerCupom = useCallback((cupomUuid: string) => {
    setCuponsAplicados(prev => prev.filter(c => c.uuid !== cupomUuid));
  }, []);
  
  /**
   * Seleciona opção de frete
   */
  const selecionarFrete = useCallback((frete: IFreteOpcao) => {
    setFreteSelecionado(frete);
  }, []);
  
  /**
   * Adiciona pagamento parcial com cartão
   */
  const adicionarPagamentoParcial = useCallback((cartaoUuid: string, valor: number) => {
    if (!validarValorParcial(valor)) {
      setError(new Error('Valor mínimo por cartão é R$ 10,00'));
      return false;
    }
    
    setPagamentosParciais(prev => [...prev, { cartaoUuid, valor }]);
    return true;
  }, []);
  
  /**
   * Remove pagamento parcial
   */
  const removerPagamentoParcial = useCallback((index: number) => {
    setPagamentosParciais(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  /**
   * Processa pagamento completo
   */
  const solicitarAutorizacaoFinanceiraCheckout = useCallback(async (
    vendaUuid: string,
    valorTotal: number
  ): Promise<IProcessarPagamentoResultado | null> => {
    setProcessando(true);
    setError(null);
    
    try {
      // Preparar dados de pagamento
      const pagamentosCartao = pagamentosParciais.length > 0
        ? pagamentosParciais
        : pagamentoSelecionado?.tipo === 'cartao_credito'
          ? [{ cartaoUuid: 'uuid' in (pagamentoSelecionado.cartao ?? {}) ? (pagamentoSelecionado.cartao as ICartaoSalvoPagamento)?.uuid || 'novo' : 'novo', valor: valorTotal }]
          : [];
      
      const dados: IProcessarPagamentoInput = {
        vendaUuid,
        pagamentosCartao,
        cuponsAplicados,
        valorTotal
      };
      
      const resultado = await service.solicitarAutorizacaoFinanceiraCheckout(dados);
      
      if (resultado.sucesso) {
        // Limpar pagamentos parciais após sucesso
        setPagamentosParciais([]);
      }
      
      return resultado;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao processar pagamento'));
      return null;
    } finally {
      setProcessando(false);
    }
  }, [service, pagamentoSelecionado, cuponsAplicados, pagamentosParciais]);
  
  /**
   * Limpa estado de pagamento
   */
  const limpar = useCallback(() => {
    setInfo(null);
    setPagamentoSelecionado(null);
    setCuponsAplicados([]);
    setFreteSelecionado(null);
    setPagamentosParciais([]);
    setError(null);
  }, []);
  
  return {
    // Estado
    info,
    loading,
    error,
    processando,
    pagamentoSelecionado,
    cuponsAplicados,
    freteSelecionado,
    pagamentosParciais,
    
    // Ações
    carregarInfo,
    selecionarPagamento,
    aplicarCupom,
    removerCupom,
    selecionarFrete,
    adicionarPagamentoParcial,
    removerPagamentoParcial,
    solicitarAutorizacaoFinanceiraCheckout,
    limpar,
    
    // Utilitários
    validarCartao,
    detectarBandeira,
    validarLuhn
  };
}
