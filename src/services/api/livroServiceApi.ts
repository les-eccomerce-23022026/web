import type { ICatalogoLivrosResposta, ICategoriaMenu, IFiltroCatalogoLivros } from '@/interfaces/catalogoLivros';
import type { ILivro } from '@/interfaces/livro';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { ILivroService } from '@/services/contracts/livroService';

function buildCatalogoParams(filtro: IFiltroCatalogoLivros): Record<string, string> {
  const params: Record<string, string> = {};
  if (filtro.pagina != null) params.pagina = String(filtro.pagina);
  if (filtro.itensPorPagina != null) params.itensPorPagina = String(filtro.itensPorPagina);
  if (filtro.categoria) params.categoria = filtro.categoria;
  if (filtro.ordenacao) params.ordenacao = filtro.ordenacao;
  return params;
}

export class LivroServiceApi implements ILivroService {
  async getCatalogo(filtro: IFiltroCatalogoLivros = {}): Promise<ICatalogoLivrosResposta> {
    const merged: IFiltroCatalogoLivros = {
      pagina: filtro.pagina ?? 1,
      itensPorPagina: filtro.itensPorPagina ?? 10,
      categoria: filtro.categoria,
      ordenacao: filtro.ordenacao ?? 'recentes',
    };
    return ApiClient.get<ICatalogoLivrosResposta>(
      API_ENDPOINTS.obterLivrosCatalogo,
      buildCatalogoParams(merged),
    );
  }

  async getCategoriasMenu(): Promise<ICategoriaMenu[]> {
    return ApiClient.get<ICategoriaMenu[]>(API_ENDPOINTS.categoriasCatalogo);
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
