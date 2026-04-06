import type {
  IPagamentoInfo,
  IPagamentoSelecionado,
  IPagamentoDetalhes,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado,
  IIntencaoPagamentoResultado,
  ISelecionarPagamentoLiquidaBody,
  IResumoPagamentosVenda,
  TipoPagamento,
  StatusPagamento,
} from '@/interfaces/pagamento';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';

function mapStatusPagamentoApi(s: string): StatusPagamento {
  const u = s.toUpperCase();
  const map: Record<string, StatusPagamento> = {
    PENDENTE: 'pendente',
    APROVADO: 'aprovado',
    RECUSADO: 'recusado',
    CANCELADO: 'cancelado',
  };
  return map[u] ?? 'pendente';
}

function normalizarPagamentoDetalhes(raw: Record<string, unknown>): IPagamentoDetalhes {
  const forma = raw.formaPagamento as { tipo: string; detalhes?: string };
  const pix = raw.pixCobranca as IPagamentoDetalhes['pixCobranca'] | undefined;
  return {
    id: String(raw.id),
    vendaUuid: String(raw.vendaUuid),
    valor: Number(raw.valor),
    formaPagamento: {
      tipo: forma.tipo as TipoPagamento,
      detalhes: forma.detalhes,
    },
    cartao: raw.cartao as IPagamentoDetalhes['cartao'],
    status: mapStatusPagamentoApi(String(raw.status)),
    criadoEm: new Date(String(raw.criadoEm)),
    processadoEm: raw.processadoEm ? new Date(String(raw.processadoEm)) : undefined,
    pixCobranca: pix,
  };
}

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
   * POST /api/pagamentos/intencao-pagamento
   */
  async registrarIntencaoPagamento(valorTotal: number): Promise<IIntencaoPagamentoResultado> {
    return ApiClient.post<IIntencaoPagamentoResultado>(API_ENDPOINTS.registrarIntencaoPagamento, {
      valorTotal,
    });
  }

  /**
   * Seleciona forma de pagamento para uma venda
   * POST /api/pagamentos/selecionar
   */
  async definirMetodoLiquidacao(dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes> {
    const raw = await ApiClient.post<Record<string, unknown>>(API_ENDPOINTS.selecionarPagamento, dados);
    return normalizarPagamentoDetalhes(raw);
  }

  async selecionarPagamentoLiquida(dados: ISelecionarPagamentoLiquidaBody): Promise<IPagamentoDetalhes> {
    const raw = await ApiClient.post<Record<string, unknown>>(API_ENDPOINTS.selecionarPagamento, dados);
    return normalizarPagamentoDetalhes(raw);
  }

  /**
   * POST /api/pagamentos/:uuid/processar
   */
  async solicitarAutorizacaoFinanceira(pagamentoUuid: string): Promise<IPagamentoDetalhes> {
    const endpoint = API_ENDPOINTS.solicitarAutorizacaoFinanceira(pagamentoUuid);
    const raw = await ApiClient.post<Record<string, unknown>>(endpoint, {});
    return normalizarPagamentoDetalhes(raw);
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
    const raw = await ApiClient.get<Record<string, unknown>>(endpoint);
    return normalizarPagamentoDetalhes(raw);
  }

  async obterResumoPagamentosVenda(vendaUuid: string): Promise<IResumoPagamentosVenda> {
    const raw = await ApiClient.get<{
      vendaStatus: string;
      aguardandoPix: boolean;
      pagamentos: Array<{
        id: string;
        tipo: string;
        status: string;
        valor: number;
        pixExpiraEm?: string;
      }>;
    }>(API_ENDPOINTS.resumoPagamentosVenda(vendaUuid));
    return {
      vendaStatus: raw.vendaStatus,
      aguardandoPix: raw.aguardandoPix,
      pagamentos: raw.pagamentos.map((p) => ({
        id: p.id,
        tipo: p.tipo as TipoPagamento,
        status: mapStatusPagamentoApi(p.status),
        valor: p.valor,
        pixExpiraEm: p.pixExpiraEm,
      })),
    };
  }

  async confirmarWebhookPixSimulado(payload: {
    pagamentoUuid: string;
    segredoConfirmacao: string;
  }): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.webhookPagamentoPixSimulado, payload);
  }
}
