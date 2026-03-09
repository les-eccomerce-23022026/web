import pagamentoMock from '@/mocks/pagamentoMock.json';
import type { IPagamentoInfo } from '@/interfaces/IPagamento';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';
import { ApiClient } from './apiClient';

export class PagamentoService {
  static async getPagamentoInfo(): Promise<IPagamentoInfo> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando dados de pagamento.');
      return new Promise((resolve) => setTimeout(() => resolve(pagamentoMock as IPagamentoInfo), 300));
    }

    return ApiClient.get<IPagamentoInfo>(API_ENDPOINTS.obterPagamentoInfo);
  }

  /**
   * RN0037 - Validar pagamento final (simulação)
   * Simula a autorização da operadora de cartão e validação dos cupons.
   * Em produção, enviaria apenas IDs de produto + quantidade (Frontend Responsibility Skill).
   */
  static async processarPagamento(pedidoPayload: {
    enderecoUuid: string;
    freteUuid: string;
    cupons: string[];
    pagamentosCartao: { cartaoUuid: string; valor: number }[];
    itens: { livroUuid: string; quantidade: number }[];
  }): Promise<{ sucesso: boolean; pedidoUuid: string; status: string }> {
    if (USE_MOCK) {
      console.log('[Mock] Processando pagamento...', pedidoPayload);
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              sucesso: true,
              pedidoUuid: `ord-${Date.now()}`,
              status: 'EM PROCESSAMENTO',
            }),
          2000,
        ),
      );
    }

    return ApiClient.post(API_ENDPOINTS.processarPagamento, pedidoPayload);
  }
}
