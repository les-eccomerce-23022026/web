import type {
  IEntregaInputDto,
  IEntregaOutputDto,
  IFreteCalculoInput,
  IFreteCalculoOutput,
  IFreteOpcao,
} from '@/interfaces/entrega';
import type { IEntregaService } from '@/services/contracts/entregaService';
import { ApiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/apiConfig';

/** Resposta de POST /frete/cotar */
interface IFreteCotarResponse {
  provedor: string;
  cepOrigem: string;
  cepDestino: string;
  pesoTotal: number;
  opcoes: Array<{
    uuid: string;
    cotacaoUuid: string;
    tipo: IFreteOpcao['tipo'];
    valor: number;
    prazo: string;
    selecionado?: boolean;
  }>;
}

/**
 * Serviço de Entrega/Frete - Integração com API Backend
 */
export class EntregaServiceApi implements IEntregaService {
  /**
   * Calcula opções de frete para um CEP (POST /api/frete/cotar)
   */
  async calcularFrete(dados: IFreteCalculoInput): Promise<IFreteCalculoOutput> {
    const body = {
      cepDestino: dados.cepDestino,
      pesoKg: dados.peso ?? 1,
      valorTotalItens: dados.valorTotal,
    };

    const res = await ApiClient.post<IFreteCotarResponse>(API_ENDPOINTS.cotarFrete, body);

    const opcoes: IFreteOpcao[] = res.opcoes.map((o) => ({
      uuid: o.uuid,
      tipo: o.tipo,
      valor: o.valor,
      prazo: o.prazo,
      selecionado: o.selecionado ?? false,
    }));

    return {
      opcoes,
      cepOrigem: res.cepOrigem,
      pesoTotal: res.pesoTotal,
    };
  }

  /**
   * Cadastra entrega para uma venda
   * POST /api/entregas
   */
  async cadastrarEntrega(dados: IEntregaInputDto): Promise<IEntregaOutputDto> {
    return ApiClient.post<IEntregaOutputDto>(API_ENDPOINTS.entregas, dados);
  }

  /**
   * Consulta entrega por UUID
   * GET /api/entregas/:uuid
   */
  async consultarEntrega(entregaUuid: string): Promise<IEntregaOutputDto | null> {
    try {
      return await ApiClient.get<IEntregaOutputDto>(`${API_ENDPOINTS.entregas}/${entregaUuid}`);
    } catch {
      return null;
    }
  }

  /**
   * Lista entregas por venda
   * GET /api/entregas?vendaUuid=:uuid
   */
  async listarPorVenda(vendaUuid: string): Promise<IEntregaOutputDto[]> {
    return ApiClient.get<IEntregaOutputDto[]>(`${API_ENDPOINTS.entregas}?vendaUuid=${vendaUuid}`);
  }
}
