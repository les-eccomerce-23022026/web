import clientesMock from '@/mocks/clientesMock.json';
import authUsersMock from '@/mocks/authUsersMock.json';
import type {
  ICliente,
  IAtualizarPerfilPayload,
  IAlterarSenhaPayload,
  IRegistroClienteCompletoPayload,
} from '@/interfaces/ICliente';
import type { IEnderecoCliente, ICartaoCliente } from '@/interfaces/IPagamento';
import { API_ENDPOINTS, USE_MOCK } from '@/config/apiConfig';

export class ClienteService {
  /**
   * RF0021 - Obter perfil completo do cliente logado
   */
  static async obterPerfil(userUuid: string): Promise<ICliente> {
    if (USE_MOCK) {
      console.log('[Mock] Buscando perfil do cliente:', userUuid);

      const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
      if (!cliente) {
        return Promise.reject(new Error('Cliente não encontrado.'));
      }

      return new Promise((resolve) =>
        setTimeout(() => resolve(cliente as unknown as ICliente), 300),
      );
    }

    const response = await fetch(API_ENDPOINTS.obterPerfilCliente);
    if (!response.ok) throw new Error('Erro ao buscar perfil');
    return response.json();
  }

  /**
   * RF0022 - Atualizar dados cadastrais do cliente
   */
  static async atualizarPerfil(payload: IAtualizarPerfilPayload): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Atualizando perfil:', payload);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    const response = await fetch(API_ENDPOINTS.atualizarPerfilCliente, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao atualizar perfil');
  }

  /**
   * RF0028 - Alteração apenas de senha
   */
  static async alterarSenha(
    userUuid: string,
    payload: IAlterarSenhaPayload,
  ): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Alterando senha do cliente:', userUuid);

      const usuario = authUsersMock.usuarios.find((u) => u.uuid === userUuid);
      if (!usuario) {
        return Promise.reject(new Error('Usuário não encontrado.'));
      }
      if (usuario.senha !== payload.senhaAtual) {
        return Promise.reject(new Error('Senha atual incorreta.'));
      }

      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    const response = await fetch(API_ENDPOINTS.alterarSenhaCliente, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao alterar senha');
  }

  /**
   * RF0023 - Inativar cadastro de cliente
   */
  static async inativarConta(): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Inativando conta do cliente.');
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    const response = await fetch(API_ENDPOINTS.inativarContaCliente, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao inativar conta');
  }

  /**
   * RF0026 - Listar endereços de entrega do cliente
   */
  static async listarEnderecos(userUuid: string): Promise<IEnderecoCliente[]> {
    if (USE_MOCK) {
      const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
      if (!cliente) return Promise.resolve([]);

      return new Promise((resolve) =>
        setTimeout(
          () => resolve(cliente.enderecosEntrega as IEnderecoCliente[]),
          200,
        ),
      );
    }

    const response = await fetch(API_ENDPOINTS.listarEnderecos);
    if (!response.ok) throw new Error('Erro ao listar endereços');
    return response.json();
  }

  /**
   * RF0026 - Adicionar endereço de entrega
   */
  static async adicionarEndereco(
    endereco: Omit<IEnderecoCliente, 'uuid'>,
  ): Promise<IEnderecoCliente> {
    if (USE_MOCK) {
      console.log('[Mock] Adicionando endereço:', endereco);
      const novoEndereco: IEnderecoCliente = {
        ...endereco,
        uuid: `end-${Date.now()}`,
      };
      return new Promise((resolve) => setTimeout(() => resolve(novoEndereco), 300));
    }

    const response = await fetch(API_ENDPOINTS.adicionarEndereco, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endereco),
    });
    if (!response.ok) throw new Error('Erro ao adicionar endereço');
    return response.json();
  }

  /**
   * RNF0034 - Editar endereço (sem alterar demais dados)
   */
  static async editarEndereco(
    uuid: string,
    endereco: Partial<IEnderecoCliente>,
  ): Promise<IEnderecoCliente> {
    if (USE_MOCK) {
      console.log('[Mock] Editando endereço:', uuid, endereco);
      return new Promise((resolve) =>
        setTimeout(() => resolve({ ...endereco, uuid } as IEnderecoCliente), 300),
      );
    }

    const response = await fetch(API_ENDPOINTS.editarEndereco(uuid), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(endereco),
    });
    if (!response.ok) throw new Error('Erro ao editar endereço');
    return response.json();
  }

  /**
   * Remover endereço de entrega
   */
  static async removerEndereco(uuid: string): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Removendo endereço:', uuid);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    const response = await fetch(API_ENDPOINTS.removerEndereco(uuid), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao remover endereço');
  }

  /**
   * RF0027 - Listar cartões do cliente
   */
  static async listarCartoes(userUuid: string): Promise<ICartaoCliente[]> {
    if (USE_MOCK) {
      const cliente = clientesMock.clientes.find((c) => c.uuid === userUuid);
      if (!cliente) return Promise.resolve([]);

      return new Promise((resolve) =>
        setTimeout(
          () => resolve(cliente.cartoes as ICartaoCliente[]),
          200,
        ),
      );
    }

    const response = await fetch(API_ENDPOINTS.listarCartoes);
    if (!response.ok) throw new Error('Erro ao listar cartões');
    return response.json();
  }

  /**
   * RF0027 - Adicionar cartão de crédito
   */
  static async adicionarCartao(
    cartao: Omit<ICartaoCliente, 'uuid'>,
  ): Promise<ICartaoCliente> {
    if (USE_MOCK) {
      console.log('[Mock] Adicionando cartão:', cartao);
      const novoCartao: ICartaoCliente = {
        ...cartao,
        uuid: `card-${Date.now()}`,
      };
      return new Promise((resolve) => setTimeout(() => resolve(novoCartao), 300));
    }

    const response = await fetch(API_ENDPOINTS.adicionarCartao, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cartao),
    });
    if (!response.ok) throw new Error('Erro ao adicionar cartão');
    return response.json();
  }

  /**
   * Remover cartão de crédito
   */
  static async removerCartao(uuid: string): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Removendo cartão:', uuid);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    const response = await fetch(API_ENDPOINTS.removerCartao(uuid), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao remover cartão');
  }

  /**
   * RF0027 - Definir cartão como preferencial
   */
  static async definirCartaoPreferencial(cartaoUuid: string): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Definindo cartão preferencial:', cartaoUuid);
      return new Promise((resolve) => setTimeout(resolve, 300));
    }

    const response = await fetch(
      API_ENDPOINTS.definirCartaoPreferencial(cartaoUuid),
      { method: 'PUT' },
    );
    if (!response.ok) throw new Error('Erro ao definir cartão preferencial');
  }

  /**
   * RF0021 - Registrar cliente completo (com endereço e todos os campos)
   */
  static async registrarClienteCompleto(
    payload: IRegistroClienteCompletoPayload,
  ): Promise<void> {
    if (USE_MOCK) {
      console.log('[Mock] Registrando cliente completo:', payload.email);

      const jaExiste = authUsersMock.usuarios.some(
        (u) => u.email === payload.email || u.cpf === payload.cpf,
      );
      if (jaExiste) {
        return Promise.reject(new Error('E-mail ou CPF já cadastrado.'));
      }

      return new Promise((resolve) => setTimeout(resolve, 500));
    }

    const response = await fetch(API_ENDPOINTS.registrarCliente, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Erro ao registrar cliente');
  }
}
