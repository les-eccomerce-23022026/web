export interface IClienteAdminItem {
  uuid: string;
  nome: string;
  email: string;
  cpf: string;
  ativo: boolean;
  criadoEm: string;
}

export interface IResultadoListaClientes {
  clientes: IClienteAdminItem[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface IFiltrosListaClientes {
  nome?: string;
  cpf?: string;
  email?: string;
  ativo?: boolean;
  pagina?: number;
  limite?: number;
}

export interface IEnderecoResumo {
  apelido: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  principal: boolean;
}

export interface ICartaoResumo {
  apelido?: string;
  bandeira: string;
  ultimos4Digitos: string;
  principal: boolean;
}

export interface IResumoPedidos {
  totalPedidos: number;
  totalGasto: number;
  ultimoPedidoEm: string | null;
}

export interface IDetalheClienteAdmin extends IClienteAdminItem {
  enderecos: IEnderecoResumo[];
  cartoes: ICartaoResumo[];
  resumoPedidos: IResumoPedidos;
}

export interface IAdminClienteService {
  listarClientes(filtros?: IFiltrosListaClientes): Promise<IResultadoListaClientes>;
  obterClientePorUuid(uuid: string): Promise<IDetalheClienteAdmin>;
  inativarCliente(uuid: string, ativo: boolean): Promise<{ uuid: string; ativo: boolean }>;
}
