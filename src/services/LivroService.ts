import homeCatalogoMock from '@/mocks/homeCatalogoMock.json';
import detalhesLivroMock from '@/mocks/detalhesLivroMock.json';
import listaLivrosAdminMock from '@/mocks/listaLivrosAdminMock.json';
import type { ILivro } from '@/interfaces/ILivro';
import { API_ENDPOINTS } from '@/config/apiConfig';

export class LivroService {
  static async getDestaques(): Promise<ILivro[]> {
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
    console.log('[Mock] Buscando destaques. Endpoint real seria:', API_ENDPOINTS.obterLivrosDestaque);
    return new Promise((resolve) => setTimeout(() => resolve(homeCatalogoMock.destaques as ILivro[]), delay));
  }

  static async getDetalhes(uuid: string): Promise<ILivro> {
    console.log(`[Mock] Buscando detalhes do livro ${uuid}. Endpoint real seria:`, API_ENDPOINTS.obterDetalhesLivro(uuid));
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula a busca de um livro pelo seu UUID nos diferentes mocks disponíveis
        const baseDeDados = [
          ...homeCatalogoMock.destaques,
          ...listaLivrosAdminMock.livros
        ];

        const livroBase = baseDeDados.find((l) => l.uuid === uuid);

        if (livroBase) {
          // Mescla os dados básicos encontrados com o mock de detalhes
          resolve({
            ...detalhesLivroMock,
            ...livroBase,
          } as ILivro);
        } else {
          // Fallback para o mock de detalhes caso não encontre nas listas
          resolve(detalhesLivroMock as ILivro);
        }
      }, 300);
    });
  }
  
  static async getListaAdmin(): Promise<ILivro[]> {
    if (typeof window !== 'undefined' && window.location.search.includes('forceError=true')) {
      return Promise.reject(new Error('Simulated Error'));
    }
    if (typeof window !== 'undefined' && window.location.search.includes('forceEmpty=true')) {
      return Promise.resolve([]);
    }
    console.log('[Mock] Buscando lista admin de livros. Endpoint real seria:', API_ENDPOINTS.obterListaLivrosAdmin);
    return new Promise((resolve) => setTimeout(() => resolve(listaLivrosAdminMock.livros as ILivro[]), 300));
  }
}
