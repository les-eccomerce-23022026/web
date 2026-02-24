export interface MetricasDashboard {
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

export interface DatasetGrafico {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor: string | string[];
  fill?: boolean;
  tension?: number;
}

export interface GraficoInfo {
  labels: string[];
  datasets: DatasetGrafico[];
}

export interface AtividadeRecente {
  uuid: string;
  tipo: string;
  descricao: string;
  data: string;
  sucesso: boolean;
}

export interface DashboardAdminInfo {
  metricas: MetricasDashboard;
  graficoVendasPorCategoria: GraficoInfo;
  graficoReceitaAnual: GraficoInfo;
  graficoStatusPedidos: GraficoInfo;
  atividadesRecentes: AtividadeRecente[];
}
