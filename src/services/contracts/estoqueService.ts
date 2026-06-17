export interface IItemEstoque {
  uuid: string;
  livroUuid: string;
  livroTitulo: string;
  livroIsbn: string;
  quantidadeDisponivel: number;
  quantidadeReservada: number;
  precoVenda: number;
  valorCustoAtual: number;
  ativo: boolean;
}

export interface IKpisEstoque {
  totalLivros: number;
  abaixoLimite: number;
  estoqueCriticoLimite: number;
  valorTotalEstoque: number;
  valorTotalCusto: number;
  quantidadeTotalReservada: number;
  quantidadeTotalDisponivel: number;
}

export interface IEntradaEstoque {
  livroUuid: string;
  quantidade: number;
  custoUnitario: number;
  fornecedorUuid?: string;
  numeroNotaFiscal?: string;
  observacoes?: string;
  dataEntrada?: string;
}

export interface IAtualizacaoEstoque {
  estoqueUuid: string;
  quantidadeDisponivel?: number;
  precoVenda?: number;
  valorCustoAtual?: number;
}

export interface IEstoqueService {
  listarEstoque(): Promise<IItemEstoque[]>;
  listarEstoqueCritico(limite?: number): Promise<IItemEstoque[]>;
  obterKpis(limiteCritico?: number): Promise<IKpisEstoque>;
  registrarEntrada(dados: IEntradaEstoque): Promise<{ mensagem: string }>;
  atualizarEstoque(dados: IAtualizacaoEstoque): Promise<{ mensagem: string }>;
}
