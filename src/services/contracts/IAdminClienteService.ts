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
  pagina?: number;
  limite?: number;
}

export interface IAdminClienteService {
  listarClientes(filtros?: IFiltrosListaClientes): Promise<IResultadoListaClientes>;
}
