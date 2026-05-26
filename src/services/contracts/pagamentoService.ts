import type {
  IPagamentoInfo,
  IPagamentoSelecionado,
  IPagamentoDetalhes,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado,
  IIntencaoPagamentoResultado,
  ISelecionarPagamentoLiquidaBody,
  IResumoPagamentosVenda,
} from '@/interfaces/pagamento';

/**
 * Contrato para o serviço de Pagamento
 * Define os métodos que devem ser implementados
 */
export interface IPagamentoService {
  /**
   * Obtém informações necessárias para checkout
   * (endereços, cartões, cupons, opções de frete)
   */
  obterPagamentoInfo(): Promise<IPagamentoInfo>;

  /**
   * Registra intenção de pagamento no provedor (valor travado antes da confirmação).
   */
  registrarIntencaoPagamento(valorTotal: number): Promise<IIntencaoPagamentoResultado>;

  /**
   * Define método de liquidação para uma venda
   */
  definirMetodoLiquidacao(dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes>;

  /**
   * Liquidação explícita por venda (corpo compatível com `POST /pagamentos/selecionar`).
   */
  selecionarPagamentoLiquida(dados: ISelecionarPagamentoLiquidaBody): Promise<IPagamentoDetalhes>;

  /**
   * Solicita autorização financeira ao gateway (pagamento já registrado)
   */
  solicitarAutorizacaoFinanceira(pagamentoUuid: string): Promise<IPagamentoDetalhes>;

  /**
   * Fluxo de checkout: autorização financeira simplificada (payload agregado)
   */
  solicitarAutorizacaoFinanceiraCheckout(dados: IProcessarPagamentoInput): Promise<IProcessarPagamentoResultado>;

  /**
   * Consulta pagamento por UUID
   */
  consultarPagamento(pagamentoUuid: string): Promise<IPagamentoDetalhes>;

  /** Polling: status da venda e PIX pendentes. */
  obterResumoPagamentosVenda(vendaUuid: string): Promise<IResumoPagamentosVenda>;

  /** Simula webhook do PSP confirmando PIX (sem JWT). */
  confirmarWebhookPixSimulado(payload: {
    pagamentoUuid: string;
    segredoConfirmacao: string;
  }): Promise<void>;
}
