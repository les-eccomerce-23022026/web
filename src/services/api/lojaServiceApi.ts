import type { ILoja } from '@/interfaces/loja';
import { API_ENDPOINTS, BASE_URL } from '@/config/apiConfig';
import { ApiClient } from '../apiClient';
import type { ILojaService, IListarLojasParams, IListarLojasResposta, IAtualizarLojaDto } from '../contracts/lojaService';

export class LojaServiceApi implements ILojaService {
  async listarLojas(params?: IListarLojasParams): Promise<IListarLojasResposta> {
    const query = new URLSearchParams();
    if (params?.pagina !== undefined) query.set('pagina', String(params.pagina));
    if (params?.limite !== undefined) query.set('limite', String(params.limite));
    if (params?.nome) query.set('nome', params.nome);
    if (params?.cnpj) query.set('cnpj', params.cnpj);
    if (params?.ativo !== undefined && params.ativo !== null) {
      query.set('ativo', String(params.ativo));
    }

    const qs = query.toString();
    const url = qs ? `${API_ENDPOINTS.listarLojas}?${qs}` : API_ENDPOINTS.listarLojas;

    try {
      const resposta = await ApiClient.get<IListarLojasResposta>(url);
      // Suporta resposta paginada ({ lojas, total, totalPaginas, paginaAtual })
      // e resposta legada (array simples)
      if (Array.isArray(resposta)) {
        const lojas = resposta as unknown as ILoja[];
        return {
          lojas,
          total: lojas.length,
          totalPaginas: 1,
          paginaAtual: 1,
        };
      }
      return resposta;
    } catch {
      // Fallback: tenta como array simples
      const lojas = await ApiClient.get<ILoja[]>(url);
      return {
        lojas: Array.isArray(lojas) ? lojas : [],
        total: Array.isArray(lojas) ? lojas.length : 0,
        totalPaginas: 1,
        paginaAtual: 1,
      };
    }
  }

  async obterLoja(uuid: string): Promise<ILoja> {
    return ApiClient.get<ILoja>(API_ENDPOINTS.obterLoja(uuid));
  }

  async criarLoja(loja: Omit<ILoja, 'uuid'>): Promise<ILoja> {
    return ApiClient.post<ILoja>(API_ENDPOINTS.criarLoja, loja);
  }

  async atualizarLoja(uuid: string, dados: IAtualizarLojaDto): Promise<ILoja> {
    return ApiClient.patch<ILoja>(API_ENDPOINTS.atualizarLoja(uuid), dados);
  }

  async inativarLoja(uuid: string): Promise<void> {
    return ApiClient.patch<void>(API_ENDPOINTS.inativarLoja(uuid), { ativo: false });
  }

  async ativarLoja(uuid: string): Promise<void> {
    return ApiClient.patch<void>(API_ENDPOINTS.ativarLoja(uuid), { ativo: true });
  }

  async verificarSlugDisponivel(slug: string, uuidAtual?: string): Promise<boolean> {
    const query = new URLSearchParams({ slug: encodeURIComponent(slug) });
    if (uuidAtual) query.set('uuid', uuidAtual);
    const url = `${API_ENDPOINTS.verificarSlugLoja}?${query.toString()}`;
    const response = await ApiClient.get<{ disponivel: boolean }>(url);
    return response.disponivel;
  }
}
