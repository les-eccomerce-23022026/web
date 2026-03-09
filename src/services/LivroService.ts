import homeCatalogoMock from '@/mocks/homeCatalogoMock.json';
import detalhesLivroMock from '@/mocks/detalhesLivroMock.json';
import listaLivrosAdminMock from '@/mocks/listaLivrosAdminMock.json';
import type { ILivro } from '@/interfaces/ILivro';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';
import { ApiClient } from './apiClient';

/** Store compartilhado em memória para que baixas de estoque reflitam em toda a sessão */
const livrosMemoria: ILivro[] = [...(listaLivrosAdminMock.livros as ILivro[])];

function delayFn<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export class LivroService {
  static async getDestaques(): Promise<ILivro[]> {
    if (USE_MOCK) {
      if (typeof window !== 'undefined' && window.location.search.includes('forceError=true')) {
        return Promise.reject(new Error('Simulated Error'));
      }
      if (typeof window !== 'undefined' && window.location.search.includes('forceEmpty=true')) {
        return Promise.resolve([]);
      }
      let delayMs = 300;
      if (typeof window !== 'undefined') {
        const match = window.location.search.match(/delay=(\d+)/);
        if (match) delayMs = parseInt(match[1], 10);
      }
      console.log('[Mock] Buscando destaques.');
      return new Promise((resolve) => setTimeout(() => resolve(homeCatalogoMock.destaques as ILivro[]), delayMs));
    }

    return ApiClient.get<ILivro[]>(API_ENDPOINTS.obterLivrosDestaque);
  }

  static async getDetalhes(uuid: string): Promise<ILivro> {
    if (USE_MOCK) {
      console.log(`[Mock] Buscando detalhes do livro ${uuid}.`);
      return new Promise((resolve) => {
        setTimeout(() => {
          const livroBase = livrosMemoria.find((l) => l.uuid === uuid)
            ?? (homeCatalogoMock.destaques as ILivro[]).find((l) => l.uuid === uuid);

          if (livroBase) {
            resolve({ ...detalhesLivroMock, ...livroBase } as ILivro);
          } else {
            resolve(detalhesLivroMock as ILivro);
          }
        }, 300);
      });
    }

    return ApiClient.get<ILivro>(API_ENDPOINTS.obterDetalhesLivro(uuid));
  }

  static async getListaAdmin(): Promise<ILivro[]> {
    if (USE_MOCK) {
      if (typeof window !== 'undefined' && window.location.search.includes('forceError=true')) {
        return Promise.reject(new Error('Simulated Error'));
      }
      if (typeof window !== 'undefined' && window.location.search.includes('forceEmpty=true')) {
        return Promise.resolve([]);
      }
      console.log('[Mock] Buscando lista admin de livros.');
      return delayFn([...livrosMemoria]);
    }

    return ApiClient.get<ILivro[]>(API_ENDPOINTS.obterListaLivrosAdmin);
  }

  /**
   * RF0053 — Dar baixa no estoque após venda processada.
   * Reduz a quantidade de cada item do pedido no estoque em memória.
   */
  static async darBaixaEstoque(itens: { livroUuid: string; quantidade: number }[]): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Dando baixa no estoque para itens:', itens);
      for (const item of itens) {
        const livro = livrosMemoria.find((l) => l.uuid === item.livroUuid);
        if (!livro) continue;
        livro.estoque = Math.max(0, livro.estoque - item.quantidade);
        console.log(`[Mock] Estoque de "${livro.titulo}" atualizado: ${livro.estoque} un.`);
      }
      return delayFn(undefined as unknown as void, 200);
    }

    await ApiClient.post(`${API_ENDPOINTS.obterListaLivrosAdmin}/baixa`, { itens });
  }
}
