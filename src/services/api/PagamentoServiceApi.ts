import type { IPagamentoInfo } from '@/interfaces/IPagamento';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type {
  IPagamentoService,
  IProcessarPagamentoPayload,
  IProcessarPagamentoResponse,
} from '@/services/contracts/IPagamentoService';

export class PagamentoServiceApi implements IPagamentoService {
  async getPagamentoInfo(): Promise<IPagamentoInfo> {
    return ApiClient.get<IPagamentoInfo>(API_ENDPOINTS.obterPagamentoInfo);
  }

  async processarPagamento(
    pedidoPayload: IProcessarPagamentoPayload,
  ): Promise<IProcessarPagamentoResponse> {
    return ApiClient.post<IProcessarPagamentoResponse>(
      API_ENDPOINTS.processarPagamento,
      pedidoPayload,
    );
  }
}
