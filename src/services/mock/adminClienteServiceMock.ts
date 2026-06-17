import clientesMock from '@/mocks/clientesMock.json';
import type {
  IAdminClienteService,
  IFiltrosListaClientes,
  IResultadoListaClientes,
  IClienteAdminItem,
  IDetalheClienteAdmin,
} from '../contracts/adminClienteService';
import { aplicarFiltrosListaClientes } from './adminClienteMockFiltros';

export class AdminClienteServiceMock implements IAdminClienteService {
  async listarClientes(filtros?: IFiltrosListaClientes): Promise<IResultadoListaClientes> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    let clientesFiltrados = (clientesMock.clientes as unknown as IClienteAdminItem[]).map((c) => ({
      uuid: c.uuid,
      nome: c.nome,
      email: c.email,
      cpf: c.cpf,
      ativo: c.ativo,
      criadoEm: new Date().toISOString(),
    })) as IClienteAdminItem[];

    if (filtros) {
      clientesFiltrados = aplicarFiltrosListaClientes(clientesFiltrados, filtros);
    }

    const total = clientesFiltrados.length;
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 20;
    const totalPaginas = Math.ceil(total / limite);

    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;
    const clientesPaginados = clientesFiltrados.slice(inicio, fim);

    return {
      clientes: clientesPaginados,
      total,
      pagina,
      limite,
      totalPaginas,
    };
  }

  async obterClientePorUuid(uuid: string): Promise<IDetalheClienteAdmin> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const lista = clientesMock.clientes as unknown as IClienteAdminItem[];
    const base = lista.find((c) => c.uuid === uuid);

    const clienteBase: IClienteAdminItem = base
      ? { ...base, criadoEm: new Date().toISOString() }
      : {
          uuid,
          nome: "Cliente Mock",
          email: "c***@email.com",
          cpf: "***.***.***.00",
          ativo: true,
          criadoEm: new Date().toISOString(),
        };

    return {
      ...clienteBase,
      enderecos: [
        {
          apelido: "Casa",
          logradouro: "Rua das Flores",
          numero: "123",
          complemento: "Apto 4",
          bairro: "Centro",
          cidade: "São Paulo",
          estado: "SP",
          cep: "01310-100",
          principal: true,
        },
      ],
      cartoes: [
        {
          apelido: "Meu cartão",
          bandeira: "Visa",
          ultimos4Digitos: "1234",
          principal: true,
        },
      ],
      resumoPedidos: {
        totalPedidos: 5,
        totalGasto: 189.9,
        ultimoPedidoEm: new Date().toISOString(),
      },
    };
  }

  async inativarCliente(uuid: string, ativo: boolean): Promise<{ uuid: string; ativo: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { uuid, ativo };
  }
}
