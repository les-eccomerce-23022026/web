import type { 
  IPagamentoInfo, 
  IPagamentoSelecionado, 
  IPagamentoDetalhes,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado 
} from '@/interfaces/IPagamento';
import type { IPagamentoService } from '@/services/contracts/IPagamentoService';
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
  async selecionarFormaPagamento(dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes> {
    return ApiClient.post<IPagamentoDetalhes>(API_ENDPOINTS.selecionarPagamento, dados);
  }

  /**
   * Processa pagamento (integra com gateway)
   * POST /api/pagamentos/:uuid/processar
   */
  async processarPagamento(pagamentoUuid: string): Promise<IPagamentoDetalhes> {
    const endpoint = API_ENDPOINTS.processarPagamento(pagamentoUuid);
    return ApiClient.post<IPagamentoDetalhes>(endpoint, {});
  }

  /**
   * Endpoint simplificado para frontend processar pagamento
   * POST /api/pagamento/processar
   */
  async processarPagamentoFront(dados: IProcessarPagamentoInput): Promise<IProcessarPagamentoResultado> {
    return ApiClient.post<IProcessarPagamentoResultado>(API_ENDPOINTS.processarPagamentoFront, dados);
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
