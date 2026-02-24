export interface IMetricasDashboard {
  totalVendasMes: number;
  percentualCrescimento: number;
  pedidosPendentes: number;
  trocasSolicitadas: number;
  ticketMedio: number;
  percentualCrescimentoTicket: number;
  clientesAtivos: number;
  percentualCrescimentoClientes: number;
  livrosBaixoEstoque: number;
}

export interface IDatasetGrafico {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string | string[];
  fill?: boolean;
  tension?: number;
}

export interface IGraficoInfo {
  labels: string[];
  datasets: IDatasetGrafico[];
}

export interface IAtividadeRecente {
  uuid: string;
  tipo: string;
  descricao: string;
  data: string;
  sucesso: boolean;
}

export interface IDashboardAdminInfo {
  metricas: IMetricasDashboard;
  graficoVendasPorCategoria: IGraficoInfo;
  graficoReceitaAnual: IGraficoInfo;
  graficoStatusPedidos: IGraficoInfo;
  atividadesRecentes: IAtividadeRecente[];
}
