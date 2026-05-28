import type { LucideIcon } from 'lucide-react';

export interface IFiltroOpcao {
  label: string;
  value: string;
}

export interface IFiltro {
  id: string;
  label: string;
  value: string;
  opcoes: IFiltroOpcao[];
}

export interface IAcaoBotao {
  label: string;
  onClick: () => void;
  variante?: 'primario' | 'secundario';
  icone?: LucideIcon;
}

export interface IAdminToolbarProps {
  placeholderBusca: string;
  onBusca: (texto: string) => void;
  filtros?: IFiltro[];
  onFiltroChange?: (filtroId: string, valor: string) => void;
  acoes?: IAcaoBotao[];
  mostrarBusca?: boolean;
  mostrarFiltros?: boolean;
}
