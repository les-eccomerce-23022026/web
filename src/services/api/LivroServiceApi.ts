import type { ILivro } from '@/interfaces/ILivro';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { ILivroService } from '@/services/contracts/ILivroService';

export class LivroServiceApi implements ILivroService {
  async getDestaques(): Promise<ILivro[]> {
    return ApiClient.get<ILivro[]>(API_ENDPOINTS.obterLivrosDestaque);
  }

  async getDetalhes(uuid: string): Promise<ILivro> {
    return ApiClient.get<ILivro>(API_ENDPOINTS.obterDetalhesLivro(uuid));
  }

  async getListaAdmin(): Promise<ILivro[]> {
    return ApiClient.get<ILivro[]>(API_ENDPOINTS.obterListaLivrosAdmin);
  }

  async darBaixaEstoque(itens: { livroUuid: string; quantidade: number }[]): Promise<void> {
    await ApiClient.post(`${API_ENDPOINTS.obterListaLivrosAdmin}/baixa`, { itens });
  }
}
