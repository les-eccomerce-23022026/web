import type { ILivro } from '@/interfaces/ILivro';

export interface ILivroService {
  getDestaques(): Promise<ILivro[]>;
  getDetalhes(uuid: string): Promise<ILivro>;
  getListaAdmin(): Promise<ILivro[]>;
  darBaixaEstoque(itens: { livroUuid: string; quantidade: number }[]): Promise<void>;
}
