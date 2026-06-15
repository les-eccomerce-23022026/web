import type { ILoja } from '@/interfaces/loja';

export interface IListarLojasParams {
  pagina?: number;
  limite?: number;
  nome?: string;
  cnpj?: string;
  ativo?: boolean | null;
}

export interface IListarLojasResposta {
  lojas: ILoja[];
  total: number;
  totalPaginas: number;
  paginaAtual: number;
}

export interface IAtualizarLojaDto {
  nome?: string;
  slug?: string;
  cnpj?: string;
}

export interface ILojaService {
  listarLojas(params?: IListarLojasParams): Promise<IListarLojasResposta>;
  obterLoja(uuid: string): Promise<ILoja>;
  criarLoja(loja: Omit<ILoja, 'uuid'>): Promise<ILoja>;
  atualizarLoja(uuid: string, dados: IAtualizarLojaDto): Promise<ILoja>;
  inativarLoja(uuid: string): Promise<void>;
  ativarLoja(uuid: string): Promise<void>;
  verificarSlugDisponivel(slug: string, uuidAtual?: string): Promise<boolean>;
}
