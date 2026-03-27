import type { 
  IPagamentoInfo, 
  IPagamentoSelecionado, 
  IPagamentoDetalhes,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado 
} from '@/interfaces/IPagamento';

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
   * Seleciona forma de pagamento para uma venda
   */
  selecionarFormaPagamento(dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes>;

  /**
   * Processa pagamento (integra com gateway)
   */
  processarPagamento(pagamentoUuid: string): Promise<IPagamentoDetalhes>;

  /**
   * Endpoint simplificado para frontend processar pagamento
   */
  processarPagamentoFront(dados: IProcessarPagamentoInput): Promise<IProcessarPagamentoResultado>;

  /**
   * Consulta pagamento por UUID
   */
  consultarPagamento(pagamentoUuid: string): Promise<IPagamentoDetalhes>;
}
