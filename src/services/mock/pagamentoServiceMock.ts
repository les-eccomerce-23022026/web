import pagamentoMock from '@/mocks/pagamentoMock.json';
import type {
  IPagamentoInfo,
  IPagamentoSelecionado,
  IPagamentoDetalhes,
  IProcessarPagamentoInput,
  IProcessarPagamentoResultado,
  IIntencaoPagamentoResultado,
} from '@/interfaces/pagamento';
import type { IPagamentoService } from '@/services/contracts/pagamentoService';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export class PagamentoServiceMock implements IPagamentoService {
  async obterPagamentoInfo(): Promise<IPagamentoInfo> {
    console.log('[Mock] Buscando dados de pagamento.');
    // Normalizar dados do mock para remover campos obsoletos
    const mockData = pagamentoMock as unknown as {
      enderecosCliente: Array<{
        uuid: string;
        logradouro: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
        tipo: 'cobranca' | 'entrega' | 'ambos';
      }>;
      cartoesCliente: Array<{
        uuid: string;
        ultimosDigitosCartao: string;
        nomeCliente: string;
        bandeira: string;
      }>;
      cuponsDisponiveis: Array<{
        uuid: string;
        codigo: string;
        tipo: 'promocional' | 'troca';
        valor: number;
        descricao?: string;
      }>;
      bandeirasPermitidas: string[];
      freteOpcoes: Array<{
        uuid: string;
        tipo: 'PAC' | 'SEDEX' | 'RETIRA_EM_LOJA';
        valor: number;
        prazo: string;
      }>;
    };

    const normalizedData: IPagamentoInfo = {
      enderecosCliente: mockData.enderecosCliente.map(end => ({
        ...end,
        tipo: end.tipo || 'ambos',
        principal: false
      })),
      cartoesCliente: mockData.cartoesCliente.map(cartao => ({
        ...cartao,
        nomeImpresso: cartao.nomeCliente, // Adicionando campos obrigatórios
        validade: '12/2028',
        principal: false
      })),
      cuponsDisponiveis: mockData.cuponsDisponiveis.map(cupom => ({
        ...cupom,
        descricao: cupom.descricao ?? 'Cupom de desconto',
        valido: true
      })),
      bandeirasPermitidas: mockData.bandeirasPermitidas,
      freteOpcoes: mockData.freteOpcoes.map(frete => ({
        ...frete,
        selecionado: false
      }))
    };

    return delay(normalizedData);
  }

  async registrarIntencaoPagamento(valorTotal: number): Promise<IIntencaoPagamentoResultado> {
    console.log('[Mock] Intenção de pagamento:', valorTotal);
    return delay({
      idIntencao: `mock-intent-${crypto.randomUUID()}`,
      segredoConfirmacao: `mock-secret-${crypto.randomUUID()}`,
    });
  }

  async definirMetodoLiquidacao(dados: IPagamentoSelecionado): Promise<IPagamentoDetalhes> {
    console.log('[Mock] Selecionando forma de pagamento:', dados);
    return delay({
      id: crypto.randomUUID(),
      vendaUuid: crypto.randomUUID(),
      valor: 0,
      formaPagamento: {
        tipo: dados.tipo,
        detalhes: 'Pagamento selecionado via mock'
      },
      status: 'pendente',
      criadoEm: new Date()
    });
  }

  async solicitarAutorizacaoFinanceira(pagamentoUuid: string): Promise<IPagamentoDetalhes> {
    console.log('[Mock] Processando pagamento:', pagamentoUuid);
    return delay({
      id: pagamentoUuid,
      vendaUuid: crypto.randomUUID(),
      valor: 100,
      formaPagamento: {
        tipo: 'cartao_credito',
        detalhes: 'Processado via mock'
      },
      status: 'aprovado',
      criadoEm: new Date(),
      processadoEm: new Date()
    });
  }

  async solicitarAutorizacaoFinanceiraCheckout(dados: IProcessarPagamentoInput): Promise<IProcessarPagamentoResultado> {
    console.log('[Mock] Processando pagamento (frontend):', dados);
    return delay({
      sucesso: true,
      pedidoUuid: `ord-${Date.now()}`,
      status: 'aprovado'
    });
  }

  async consultarPagamento(pagamentoUuid: string): Promise<IPagamentoDetalhes> {
    console.log('[Mock] Consultando pagamento:', pagamentoUuid);
    return delay({
      id: pagamentoUuid,
      vendaUuid: crypto.randomUUID(),
      valor: 100,
      formaPagamento: {
        tipo: 'cartao_credito',
        detalhes: 'Consultado via mock'
      },
      status: 'aprovado',
      criadoEm: new Date(),
      processadoEm: new Date()
    });
  }
}
