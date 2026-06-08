export interface DadoAnaliseVendas {
  categoria: string;
  mes: string;
  quantidade: number;
}

export interface FiltroAnaliseVendas {
  dataInicio: string;
  dataFim: string;
  categorias?: string[];
}

export interface RespostaAnaliseVendas {
  dados: DadoAnaliseVendas[];
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
  obterAnaliseVendasPorCategoria(filtro: FiltroAnaliseVendas): Promise<RespostaAnaliseVendas>;
}
