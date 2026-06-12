import type { ILoja } from '@/interfaces/loja';
import { BASE_URL } from '@/config/apiConfig';
import { ApiClient } from '../apiClient';
import type { ILojaService } from '../contracts/lojaService';

export class LojaServiceApi implements ILojaService {
  async listarLojas(): Promise<ILoja[]> {
    return ApiClient.get<ILoja[]>(`${BASE_URL}/admin/lojas`);
  }

  async obterLoja(uuid: string): Promise<ILoja> {
    return ApiClient.get<ILoja>(`${BASE_URL}/admin/lojas/${uuid}`);
  }

  async criarLoja(loja: Omit<ILoja, 'uuid'>): Promise<ILoja> {
    return ApiClient.post<ILoja>(`${BASE_URL}/admin/lojas`, loja);
  }

  async atualizarLoja(uuid: string, loja: Partial<ILoja>): Promise<ILoja> {
    return ApiClient.patch<ILoja>(`${BASE_URL}/admin/lojas/${uuid}`, loja);
  }

  async inativarLoja(uuid: string): Promise<void> {
    return ApiClient.patch<void>(`${BASE_URL}/admin/lojas/${uuid}/inativar`);
  }

  async verificarSlugDisponivel(slug: string, uuidAtual?: string): Promise<boolean> {
    const url = uuidAtual
      ? `${BASE_URL}/admin/lojas/verificar-slug?slug=${encodeURIComponent(slug)}&uuid=${uuidAtual}`
      : `${BASE_URL}/admin/lojas/verificar-slug?slug=${encodeURIComponent(slug)}`;
    const response = await ApiClient.get<{ disponivel: boolean }>(url);
    return response.disponivel;
  }
}
