import pagamentoMock from '@/mocks/pagamentoMock.json';
import type { IPagamentoInfo } from '@/interfaces/IPagamento';
import type {
  IPagamentoService,
  IProcessarPagamentoPayload,
  IProcessarPagamentoResponse,
} from '@/services/contracts/IPagamentoService';

export class PagamentoServiceMock implements IPagamentoService {
  async getPagamentoInfo(): Promise<IPagamentoInfo> {
    console.log('[Mock] Buscando dados de pagamento.');
    return new Promise((resolve) =>
      setTimeout(() => resolve(pagamentoMock as IPagamentoInfo), 300),
    );
  }

  async processarPagamento(
    pedidoPayload: IProcessarPagamentoPayload,
  ): Promise<IProcessarPagamentoResponse> {
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
}
