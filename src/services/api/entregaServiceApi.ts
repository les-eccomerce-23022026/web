import type { 
  IEntregaInputDto,
  IEntregaOutputDto,
  IFreteCalculoInput,
  IFreteCalculoOutput
} from '@/interfaces/entrega';
import type { IEntregaService } from '@/services/contracts/entregaService';
import { ApiClient } from '@/services/apiClient';

/**
 * Serviço de Entrega/Frete - Integração com API Backend
 * Implementa as operações de entrega definidas na Sprint 3
 */
export class EntregaServiceApi implements IEntregaService {
  /**
   * Calcula opções de frete para um CEP
   * POST /api/frete/calcular
   */
  async calcularFrete(dados: IFreteCalculoInput): Promise<IFreteCalculoOutput> {
    // Mock de cálculo de frete (backend não implementado ainda)
    const cepLimpo = dados.cepDestino.replace(/\D/g, '');
    
    // Simular diferentes opções baseadas no CEP
    const opcoes = [
      {
        uuid: `frete-pac-${cepLimpo}`,
        tipo: 'PAC' as const,
        valor: 15.00,
        prazo: '5-7 dias úteis',
        selecionado: false
      },
      {
        uuid: `frete-sedex-${cepLimpo}`,
        tipo: 'SEDEX' as const,
        valor: 30.00,
        prazo: '1-2 dias úteis',
        selecionado: false
      },
      {
        uuid: `frete-loja-${cepLimpo}`,
        tipo: 'RETIRA_EM_LOJA' as const,
        valor: 0.00,
        prazo: 'Retirar em 24h',
        selecionado: false
      }
    ];

    return {
      opcoes,
      cepOrigem: '01000-000',
      pesoTotal: dados.peso || 1
    };
  }

  /**
   * Cadastra entrega para uma venda
   * POST /api/entregas
   */
  async cadastrarEntrega(dados: IEntregaInputDto): Promise<IEntregaOutputDto> {
    return ApiClient.post<IEntregaOutputDto>('/api/entregas', dados);
  }

  /**
   * Consulta entrega por UUID
   * GET /api/entregas/:uuid
   */
  async consultarEntrega(entregaUuid: string): Promise<IEntregaOutputDto | null> {
    try {
      return await ApiClient.get<IEntregaOutputDto>(`/api/entregas/${entregaUuid}`);
    } catch {
      return null;
    }
  }

  /**
   * Lista entregas por venda
   * GET /api/entregas?vendaUuid=:uuid
   */
  async listarPorVenda(vendaUuid: string): Promise<IEntregaOutputDto[]> {
    return ApiClient.get<IEntregaOutputDto[]>(`/api/entregas?vendaUuid=${vendaUuid}`);
  }
}
