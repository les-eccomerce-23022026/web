import type { ReactNode } from 'react';

export type AlinhamentoColuna = 'left' | 'center' | 'right';

export interface IColuna<T> {
  key: string;
  label: string;
  render?: (valor: any, linha: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  alinhamento?: AlinhamentoColuna;
}

export interface IEstadoVazio {
  titulo?: string;
  mensagem?: string;
  icone?: ReactNode;
}

export interface IPaginacao {
  paginaAtual: number;
  totalPaginas: number;
  aoMudarPagina: (pagina: number) => void;
}

export interface IFiltroColuna {
  key: string;
  valor: string;
}

export interface IAdminTableProps<T> {
  colunas: IColuna<T>[];
  dados: T[];
  rowKey: string;
  aoClicarLinha?: (linha: T) => void;
  carregando?: boolean;
  erro?: string;
  aoTentarNovamente?: () => void;
  estadoVazio?: IEstadoVazio;
  paginacao?: IPaginacao;
  filtrosColuna?: IFiltroColuna[];
  onFiltroColunaChange?: (key: string, valor: string) => void;
  className?: string;
}
