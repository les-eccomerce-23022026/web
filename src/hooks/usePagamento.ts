import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PagamentoService } from '@/services/PagamentoService';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { limparCarrinho } from '@/store/slices/carrinhoSlice';
import { adicionarPedido } from '@/store/slices/pedidoSlice';
import type {
  IPagamentoInfo,
  ICupom,
  IPagamentoCartao,
  StatusPagamento,
} from '@/interfaces/IPagamento';
import type { IPedido, IFormaPagamentoPedido } from '@/interfaces/IPedido';

const VALOR_MINIMO_CARTAO = 10;

export function usePagamento() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const user = useAppSelector((state) => state.auth.user);

  // Dados de referência (endereços, cartões, cupons, frete)
  const [info, setInfo] = useState<IPagamentoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Estado do wizard (steps)
  const [stepAtual, setStepAtual] = useState(0);
  const [tentouAvancarStep0, setTentouAvancarStep0] = useState(false);
  const [tentouAvancarStep1, setTentouAvancarStep1] = useState(false);

  // Seleções do usuário
  const [enderecoSelecionadoUuid, setEnderecoSelecionadoUuid] = useState<string | null>(null);
  const [freteSelecionadoUuid, setFreteSelecionadoUuid] = useState<string | null>(null);
  const [cuponsAplicados, setCuponsAplicados] = useState<ICupom[]>([]);
  const [codigoCupom, setCodigoCupom] = useState('');
  const [erroCupom, setErroCupom] = useState('');
  const [pagamentosCartao, setPagamentosCartao] = useState<IPagamentoCartao[]>([]);
  const [cartaoSelecionadoUuid, setCartaoSelecionadoUuid] = useState('');
  const [valorCartao, setValorCartao] = useState('');
  const [erroCartao, setErroCartao] = useState('');

  // Status do processamento
  const [statusPagamento, setStatusPagamento] = useState<StatusPagamento>('idle');
  const [pedidoUuid, setPedidoUuid] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    PagamentoService.getPagamentoInfo()
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Cálculos derivados
  const subtotal = carrinho?.resumo.subtotal ?? 0;
  const freteOpcaoSelecionada = info?.freteOpcoes.find((f) => f.uuid === freteSelecionadoUuid);
  const valorFrete = freteOpcaoSelecionada?.valor ?? 0;

  // RN0035: Cupons são considerados primeiro
  const totalCupons = cuponsAplicados.reduce((acc, c) => acc + c.valor, 0);
  const totalBruto = subtotal + valorFrete;
  const totalAposCupons = Math.max(0, totalBruto - totalCupons);

  // Valor já alocado em cartões
  const totalAlocadoCartoes = pagamentosCartao.reduce((acc, p) => acc + p.valor, 0);
  const valorRestanteCartao = Math.max(0, totalAposCupons - totalAlocadoCartoes);

  // RN0036: Se cupons superam o valor, gera cupom de troca (indicamos isso)
  const gerarCupomTroca = totalCupons > totalBruto;
  const valorCupomTroca = gerarCupomTroca ? totalCupons - totalBruto : 0;

  // Validações de step
  const podeAvancarStep0 = !!enderecoSelecionadoUuid && !!freteSelecionadoUuid;
  const pagamentoCompleto =
    totalAposCupons === 0 || Math.abs(totalAlocadoCartoes - totalAposCupons) < 0.01;

  // --- Ações ---

  const avancarStep = useCallback(() => {
    if (stepAtual === 0) {
      setTentouAvancarStep0(true);
      if (!podeAvancarStep0) return;
    }
    if (stepAtual === 1) {
      setTentouAvancarStep1(true);
      if (!pagamentoCompleto && totalAposCupons > 0) return;
    }
    setStepAtual((prev) => Math.min(prev + 1, 2));
  }, [stepAtual, podeAvancarStep0, pagamentoCompleto, totalAposCupons]);

  const voltarStep = useCallback(() => {
    setStepAtual((prev) => Math.max(prev - 1, 0));
  }, []);

  // RN0033: Apenas 1 cupom promocional por compra
  const aplicarCupom = useCallback(() => {
    setErroCupom('');
    if (!codigoCupom.trim()) return;

    const cupom = info?.cuponsDisponiveis.find(
      (c) => c.codigo.toUpperCase() === codigoCupom.trim().toUpperCase(),
    );

    if (!cupom) {
      setErroCupom('Cupom inválido ou não encontrado.');
      return;
    }

    if (cuponsAplicados.find((c) => c.uuid === cupom.uuid)) {
      setErroCupom('Este cupom já foi aplicado.');
      return;
    }

    // RN0033: Apenas 1 cupom promocional
    if (cupom.tipo === 'promocional') {
      const jaTemPromocional = cuponsAplicados.some((c) => c.tipo === 'promocional');
      if (jaTemPromocional) {
        setErroCupom('Apenas 1 cupom promocional é permitido por compra (RN0033).');
        return;
      }
    }

    setCuponsAplicados((prev) => [...prev, cupom]);
    setCodigoCupom('');
  }, [codigoCupom, info, cuponsAplicados]);

  const removerCupom = useCallback((cupomUuid: string) => {
    setCuponsAplicados((prev) => prev.filter((c) => c.uuid !== cupomUuid));
  }, []);

  // RN0034: Múltiplos cartões, mín R$10 por cartão
  // RN0035: Se houver cupom, saldo no cartão pode ser < R$10
  const adicionarPagamentoCartao = useCallback(() => {
    setErroCartao('');

    if (!cartaoSelecionadoUuid) {
      setErroCartao('Selecione um cartão.');
      return;
    }

    const valor = parseFloat(valorCartao.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      setErroCartao('Informe um valor válido.');
      return;
    }

    // RN0034: Valor mínimo R$10 por cartão
    // RN0035: A menos que cupons cubram parte e saldo restante seja < R$10
    const saldoRestante = totalAposCupons - totalAlocadoCartoes;
    if (valor < VALOR_MINIMO_CARTAO && saldoRestante >= VALOR_MINIMO_CARTAO) {
      setErroCartao(`Valor mínimo por cartão: R$ ${VALOR_MINIMO_CARTAO},00 (RN0034).`);
      return;
    }

    if (valor > saldoRestante + 0.01) {
      setErroCartao(`Valor excede o restante de R$ ${saldoRestante.toFixed(2).replace('.', ',')}.`);
      return;
    }

    // Verificar se é o mesmo cartão
    if (pagamentosCartao.find((p) => p.cartaoUuid === cartaoSelecionadoUuid)) {
      setErroCartao('Este cartão já foi adicionado. Remova-o primeiro para alterar o valor.');
      return;
    }

    setPagamentosCartao((prev) => [
      ...prev,
      { cartaoUuid: cartaoSelecionadoUuid, valor },
    ]);
    setCartaoSelecionadoUuid('');
    setValorCartao('');
  }, [cartaoSelecionadoUuid, valorCartao, totalAposCupons, totalAlocadoCartoes, pagamentosCartao]);

  const removerPagamentoCartao = useCallback((cartaoUuid: string) => {
    setPagamentosCartao((prev) => prev.filter((p) => p.cartaoUuid !== cartaoUuid));
  }, []);

  // RF0037: Finalizar Compra → Status EM PROCESSAMENTO
  // RN0037: Validar pagamento final
  // RN0038: Sucesso → APROVADA, Falha → REPROVADA
  const finalizarCompra = useCallback(async () => {
    if (!carrinho || !enderecoSelecionadoUuid || !freteSelecionadoUuid) return;
    if (!pagamentoCompleto && totalAposCupons > 0) return;

    setStatusPagamento('processando');

    try {
      // Segue Frontend Responsibility: envia apenas ID do produto + quantidade
      const resultado = await PagamentoService.processarPagamento({
        enderecoUuid: enderecoSelecionadoUuid,
        freteUuid: freteSelecionadoUuid,
        cupons: cuponsAplicados.map((c) => c.uuid),
        pagamentosCartao: pagamentosCartao.map((p) => ({
          cartaoUuid: p.cartaoUuid,
          valor: p.valor,
        })),
        itens: carrinho.itens.map((item) => ({
          livroUuid: item.uuid,
          quantidade: item.quantidade,
        })),
      });

      if (resultado.sucesso) {
        setStatusPagamento('aprovada');
        setPedidoUuid(resultado.pedidoUuid);

        // Montar formas de pagamento para persistir no pedido
        const formasPagamento: IFormaPagamentoPedido[] = [
          ...cuponsAplicados.map((c) => ({
            tipo: 'cupom' as const,
            codigo: c.codigo,
            valor: c.valor,
          })),
          ...pagamentosCartao.map((p) => {
            const cartao = info?.cartoesCliente.find((c) => c.uuid === p.cartaoUuid);
            return {
              tipo: 'cartao' as const,
              cartaoFinal: cartao?.final,
              bandeira: cartao?.bandeira,
              valor: p.valor,
            };
          }),
        ];

        // Criar pedido completo no Redux (fica disponível em Meus Pedidos)
        const novoPedido: IPedido = {
          uuid: resultado.pedidoUuid,
          data: new Date().toISOString(),
          clienteUuid: user?.uuid || '',
          status: 'Em Processamento',
          total: totalAposCupons,
          enderecoUuid: enderecoSelecionadoUuid,
          freteUuid: freteSelecionadoUuid,
          formaPagamento: formasPagamento,
          itens: carrinho.itens.map((item) => ({
            livroUuid: item.uuid,
            titulo: item.titulo,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            categoria: 'Geral',
          })),
        };

        dispatch(adicionarPedido(novoPedido));
        dispatch(limparCarrinho());
        navigate(`/pedido-confirmado?pedido=${resultado.pedidoUuid}`);
      }
    } catch {
      setStatusPagamento('reprovada');
    }
  }, [
    carrinho,
    enderecoSelecionadoUuid,
    freteSelecionadoUuid,
    cuponsAplicados,
    pagamentosCartao,
    pagamentoCompleto,
    totalAposCupons,
    info,
    user,
    dispatch,
    navigate,
  ]);

  return {
    // Dados
    info,
    loading,
    error,
    carrinho,

    // Steps
    stepAtual,
    avancarStep,
    voltarStep,
    tentouAvancarStep0,
    tentouAvancarStep1,

    // Endereço e Frete
    enderecoSelecionadoUuid,
    setEnderecoSelecionadoUuid,
    freteSelecionadoUuid,
    setFreteSelecionadoUuid,
    podeAvancarStep0,

    // Cupons
    codigoCupom,
    setCodigoCupom,
    erroCupom,
    cuponsAplicados,
    aplicarCupom,
    removerCupom,

    // Cartões
    cartaoSelecionadoUuid,
    setCartaoSelecionadoUuid,
    valorCartao,
    setValorCartao,
    erroCartao,
    pagamentosCartao,
    adicionarPagamentoCartao,
    removerPagamentoCartao,
    pagamentoCompleto,

    // Cálculos
    subtotal,
    valorFrete,
    totalCupons,
    totalBruto,
    totalAposCupons,
    totalAlocadoCartoes,
    valorRestanteCartao,
    gerarCupomTroca,
    valorCupomTroca,

    // Processar
    statusPagamento,
    pedidoUuid,
    finalizarCompra,
  };
}
