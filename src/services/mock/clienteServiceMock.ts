import clientesMock from '@/mocks/clientesMock.json';
import authUsersMock from '@/mocks/authUsersMock.json';
import type {
  ICliente,
  IAtualizarPerfilPayload,
  IAlterarSenhaPayload,
  IRegistroClienteCompletoPayload,
} from '@/interfaces/cliente';
import type { IEnderecoCliente, ICartaoSalvoPagamento as ICartaoCliente } from '@/interfaces/pagamento';
import type { IClienteService } from '@/services/contracts/clienteService';

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/** Cartões adicionados em sessão (checkout / perfil) — mescla com `clientesMock.json` em `listarCartoes`. */
const cartoesExtrasPorUsuario: Record<string, ICartaoCliente[]> = {};

export class ClienteServiceMock implements IClienteService {
  async obterPerfil(userUuid: string): Promise<ICliente> {
    console.log('[Mock] Buscando perfil do cliente:', userUuid);

    const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
    if (!cliente) {
      return Promise.reject(new Error('Cliente não encontrado.'));
    }

    return delay(cliente as unknown as ICliente);
  }

  async atualizarPerfil(payload: IAtualizarPerfilPayload): Promise<void> {
    console.log('[Mock] Atualizando perfil:', payload);
    return delay(undefined as unknown as void);
  }

  async alterarSenha(userUuid: string, payload: IAlterarSenhaPayload): Promise<void> {
    console.log('[Mock] Alterando senha do cliente:', userUuid);

    const usuario = authUsersMock.usuarios.find((u) => u.uuid === userUuid);
    if (!usuario) {
      return Promise.reject(new Error('Usuário não encontrado.'));
    }
    if (usuario.senha !== payload.senhaAtual) {
      return Promise.reject(new Error('Senha atual incorreta.'));
    }

    return delay(undefined as unknown as void);
  }

  async inativarConta(): Promise<void> {
    console.log('[Mock] Inativando conta do cliente.');
    return delay(undefined as unknown as void);
  }

  async listarEnderecos(userUuid: string): Promise<IEnderecoCliente[]> {
    const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
    if (!cliente) return Promise.resolve([]);

    return delay(cliente.enderecosEntrega as IEnderecoCliente[], 200);
  }

  async adicionarEndereco(
    endereco: Omit<IEnderecoCliente, 'uuid'>,
  ): Promise<IEnderecoCliente[]> {
    console.log('[Mock] Adicionando endereço:', endereco);
    const novoEndereco: IEnderecoCliente = {
      ...endereco,
      uuid: `end-${Date.now()}`,
    };
    return delay([novoEndereco]); // Retorna lista com o novo (simplificado no mock)
  }

  async editarEndereco(
    uuid: string,
    endereco: Partial<IEnderecoCliente>,
  ): Promise<IEnderecoCliente[]> {
    console.log('[Mock] Editando endereço:', uuid, endereco);
    return delay([{ ...endereco, uuid } as IEnderecoCliente]);
  }

  async removerEndereco(uuid: string): Promise<void> {
    console.log('[Mock] Removendo endereço:', uuid);
    return delay(undefined as unknown as void);
  }

  async listarCartoes(userUuid: string): Promise<ICartaoCliente[]> {
    const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
    const base =
      cliente?.cartoes.map((c) => ({
        ...c,
        nomeCliente: c.nomeImpresso,
      })) ?? [];
    const extras = cartoesExtrasPorUsuario[userUuid] ?? [];
    return delay([...(base as ICartaoCliente[]), ...extras], 200);
  }

  async adicionarCartao(
    cartao: Omit<ICartaoCliente, 'uuid'>,
    opcoes?: { userUuid?: string },
  ): Promise<ICartaoCliente> {
    console.log('[Mock] Adicionando cartão:', cartao, opcoes);
    const novoCartao: ICartaoCliente = {
      ...cartao,
      nomeCliente: cartao.nomeCliente ?? cartao.nomeImpresso,
      uuid: `card-${Date.now()}`,
    };
    const uid = opcoes?.userUuid;
    if (uid) {
      if (!cartoesExtrasPorUsuario[uid]) {
        cartoesExtrasPorUsuario[uid] = [];
      }
      cartoesExtrasPorUsuario[uid].push(novoCartao);
    }
    return delay(novoCartao);
  }

  async editarCartao(
    uuid: string,
    cartao: Partial<ICartaoCliente>,
  ): Promise<ICartaoCliente[]> {
    console.log('[Mock] Editando cartão:', uuid, cartao);
    return delay([{ ...cartao, uuid } as ICartaoCliente]);
  }

  async removerCartao(uuid: string): Promise<void> {
    console.log('[Mock] Removendo cartão:', uuid);
    return delay(undefined as unknown as void);
  }

  async definirCartaoPreferencial(cartaoUuid: string): Promise<void> {
    console.log('[Mock] Definindo cartão preferencial:', cartaoUuid);
    return delay(undefined as unknown as void);
  }

  async registrarClienteCompleto(payload: IRegistroClienteCompletoPayload): Promise<void> {
    console.log('[Mock] Registrando cliente completo:', payload.email);

    const jaExiste = authUsersMock.usuarios.some(
      (u) => u.email === payload.email || u.cpf === payload.cpf,
    );
    if (jaExiste) {
      return Promise.reject(new Error('E-mail ou CPF já cadastrado.'));
    }

    return delay(undefined as unknown as void, 500);
  }
}
