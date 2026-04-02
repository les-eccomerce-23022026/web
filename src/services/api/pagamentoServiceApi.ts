import type { 
  IPagamentoInfo, 
  IPagamentoSelecionado, 
  IPagamentoDetalhes,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado 
} from '@/interfaces/pagamento';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';

/**
 * Serviço de Pagamento - Integração com API Backend
 * Implementa as operações de pagamento definidas na Sprint 2
 */
export class PagamentoServiceApi implements IPagamentoService {
  /**
   * Obtém informações necessárias para checkout
   * GET /api/pagamento/info
   */
  async obterPagamentoInfo(): Promise<IPagamentoInfo> {
    return ApiClient.get<IPagamentoInfo>(API_ENDPOINTS.obterPagamentoInfo);
  }

  /**
   * Seleciona forma de pagamento para uma venda
   * POST /api/pagamentos/selecionar
   */
  async definirMetodoLiquidacao(dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes> {
    return ApiClient.post<IPagamentoDetalhes>(API_ENDPOINTS.selecionarPagamento, dados);
  }

  /**
   * POST /api/pagamentos/:uuid/processar
   */
  async solicitarAutorizacaoFinanceira(pagamentoUuid: string): Promise<IPagamentoDetalhes> {
    const endpoint = API_ENDPOINTS.solicitarAutorizacaoFinanceira(pagamentoUuid);
    return ApiClient.post<IPagamentoDetalhes>(endpoint, {});
  }

  /**
   * POST /api/pagamento/processar
   */
  async solicitarAutorizacaoFinanceiraCheckout(
    dados: IProcessarPagamentoInput,
  ): Promise<IProcessarPagamentoResultado> {
    return ApiClient.post<IProcessarPagamentoResultado>(
      API_ENDPOINTS.solicitarAutorizacaoFinanceiraCheckout,
      dados,
    );
  }

  /**
   * Consulta pagamento por UUID
   * GET /api/pagamentos/:uuid
   */
  async consultarPagamento(pagamentoUuid: string): Promise<IPagamentoDetalhes> {
    const endpoint = API_ENDPOINTS.consultarPagamento(pagamentoUuid);
    return ApiClient.get<IPagamentoDetalhes>(endpoint);
  }
}
