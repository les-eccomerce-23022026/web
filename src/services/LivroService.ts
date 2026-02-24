import homeCatalogoMock from '@/mocks/homeCatalogoMock.json';
import detalhesLivroMock from '@/mocks/detalhesLivroMock.json';
import listaLivrosAdminMock from '@/mocks/listaLivrosAdminMock.json';
import type { ILivro } from '@/interfaces/ILivro';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';

export class LivroService {
  static async getDestaques(): Promise<ILivro[]> {
    if (USE_MOCK) {
      if (typeof window !== 'undefined' && window.location.search.includes('forceError=true')) {
        return Promise.reject(new Error('Simulated Error'));
      }
      if (typeof window !== 'undefined' && window.location.search.includes('forceEmpty=true')) {
        return Promise.resolve([]);
      }
      let delay = 300;
      if (typeof window !== 'undefined') {
        const match = window.location.search.match(/delay=(\d+)/);
        if (match) delay = parseInt(match[1], 10);
      }
      console.log('[Mock] Buscando destaques.');
      return new Promise((resolve) => setTimeout(() => resolve(homeCatalogoMock.destaques as ILivro[]), delay));
    }

    const response = await fetch(API_ENDPOINTS.obterLivrosDestaque);
    if (!response.ok) throw new Error('Erro ao buscar livros em destaque');
    return response.json();
  }

  static async getDetalhes(uuid: string): Promise<ILivro> {
    if (USE_MOCK) {
      console.log(`[Mock] Buscando detalhes do livro ${uuid}.`);
      return new Promise((resolve) => {
        setTimeout(() => {
          const baseDeDados = [
            ...homeCatalogoMock.destaques,
            ...listaLivrosAdminMock.livros
          ];

          const livroBase = baseDeDados.find((l) => l.uuid === uuid);

          if (livroBase) {
            resolve({
              ...detalhesLivroMock,
              ...livroBase,
            } as ILivro);
          } else {
            resolve(detalhesLivroMock as ILivro);
          }
        }, 300);
      });
    }

    const response = await fetch(API_ENDPOINTS.obterDetalhesLivro(uuid));
    if (!response.ok) throw new Error('Erro ao buscar detalhes do livro');
    return response.json();
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
      return new Promise((resolve) => setTimeout(() => resolve(listaLivrosAdminMock.livros as ILivro[]), 300));
    }

    const response = await fetch(API_ENDPOINTS.obterListaLivrosAdmin);
    if (!response.ok) throw new Error('Erro ao buscar lista administrativa de livros');
    return response.json();
  }
}
