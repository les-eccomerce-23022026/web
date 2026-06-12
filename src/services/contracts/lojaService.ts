import type { ILoja } from '@/interfaces/loja';

export interface ILojaService {
  listarLojas(): Promise<ILoja[]>;
  obterLoja(uuid: string): Promise<ILoja>;
  criarLoja(loja: Omit<ILoja, 'uuid'>): Promise<ILoja>;
  atualizarLoja(uuid: string, loja: Partial<ILoja>): Promise<ILoja>;
  inativarLoja(uuid: string): Promise<void>;
  verificarSlugDisponivel(slug: string, uuidAtual?: string): Promise<boolean>;
}
