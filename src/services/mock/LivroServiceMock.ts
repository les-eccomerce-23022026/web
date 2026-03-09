import homeCatalogoMock from '@/mocks/homeCatalogoMock.json';
import detalhesLivroMock from '@/mocks/detalhesLivroMock.json';
import listaLivrosAdminMock from '@/mocks/listaLivrosAdminMock.json';
import type { ILivro } from '@/interfaces/ILivro';
import type { ILivroService } from '@/services/contracts/ILivroService';

/** Store em memória compartilhado por toda a sessão (mock apenas) */
const livrosMemoria: ILivro[] = [...(listaLivrosAdminMock.livros as ILivro[])];

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export class LivroServiceMock implements ILivroService {
  async getDestaques(): Promise<ILivro[]> {
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
    return new Promise((resolve) =>
      setTimeout(() => resolve(homeCatalogoMock.destaques as ILivro[]), delayMs),
    );
  }

  async getDetalhes(uuid: string): Promise<ILivro> {
    console.log(`[Mock] Buscando detalhes do livro ${uuid}.`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const livroBase =
          livrosMemoria.find((l) => l.uuid === uuid) ??
          (homeCatalogoMock.destaques as ILivro[]).find((l) => l.uuid === uuid);

        if (livroBase) {
          resolve({ ...detalhesLivroMock, ...livroBase } as ILivro);
          return;
        }

        resolve(detalhesLivroMock as ILivro);
      }, 300);
    });
  }

  async getListaAdmin(): Promise<ILivro[]> {
    if (typeof window !== 'undefined' && window.location.search.includes('forceError=true')) {
      return Promise.reject(new Error('Simulated Error'));
    }
    if (typeof window !== 'undefined' && window.location.search.includes('forceEmpty=true')) {
      return Promise.resolve([]);
    }

    console.log('[Mock] Buscando lista admin de livros.');
    return delay([...livrosMemoria]);
  }

  async darBaixaEstoque(itens: { livroUuid: string; quantidade: number }[]): Promise<void> {
    console.log('[Mock] Dando baixa no estoque para itens:', itens);
    for (const item of itens) {
      const livro = livrosMemoria.find((l) => l.uuid === item.livroUuid);
      if (!livro) continue;
      livro.estoque = Math.max(0, livro.estoque - item.quantidade);
      console.log(`[Mock] Estoque de "${livro.titulo}" atualizado: ${livro.estoque} un.`);
    }
    return delay(undefined as unknown as void, 200);
  }
}
