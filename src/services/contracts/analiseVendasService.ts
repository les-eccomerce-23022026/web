export interface IDadoAnaliseVendas {
  categoria: string;
  mes: string;
  quantidade: number;
}

export interface IFiltroAnaliseVendas {
  dataInicio: string;
  dataFim: string;
  categorias?: string[];
}

export interface IRespostaAnaliseVendas {
  dados: IDadoAnaliseVendas[];
  periodo: {
    inicio: string;
    fim: string;
  };
  metadados: {
    totalVendas: number;
    totalCategorias: number;
  };
}

export interface IAnaliseVendasService {
  obterAnaliseVendasPorCategoria(filtro: IFiltroAnaliseVendas): Promise<IRespostaAnaliseVendas>;
}
