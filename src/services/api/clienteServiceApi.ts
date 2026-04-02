import type { IAtualizarPerfilPayload, IAlterarSenhaPayload, IRegistroClienteCompletoPayload } from '@/interfaces/cliente';
import type { ICliente } from '@/interfaces/cliente';
import type { IEnderecoCliente, ICartaoSalvoPagamento as ICartaoCliente } from '@/interfaces/pagamento';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { ApiClient } from '@/services/apiClient';
import type { IClienteService } from '@/services/contracts/clienteService';
import { uuidBandeiraParaNome, validadeMmAaParaIso } from '@/services/api/clienteCartaoApiHelpers';
import { normalizarPerfilCliente } from '@/services/api/clienteNormalizarPerfil';

export class ClienteServiceApi implements IClienteService {
  async obterPerfil(_userUuid: string): Promise<ICliente> {
    const perfil = await ApiClient.get<Partial<ICliente>>(API_ENDPOINTS.obterPerfilCliente);
    return normalizarPerfilCliente(perfil);
  }

  async atualizarPerfil(payload: IAtualizarPerfilPayload): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.atualizarPerfilCliente, payload);
  }

  async alterarSenha(_userUuid: string, payload: IAlterarSenhaPayload): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.alterarSenhaCliente, {
      senhaAtual: payload.senhaAtual,
      novaSenha: payload.novaSenha,
      confirmacaoNovaSenha: payload.confirmacaoNovaSenha,
    });
  }

  async inativarConta(): Promise<void> {
    await ApiClient.delete(API_ENDPOINTS.inativarContaCliente);
  }

  async listarEnderecos(_userUuid: string): Promise<IEnderecoCliente[]> {
    return ApiClient.get<IEnderecoCliente[]>(API_ENDPOINTS.listarEnderecos);
  }

  async adicionarEndereco(
    endereco: Omit<IEnderecoCliente, 'uuid'>,
  ): Promise<IEnderecoCliente[]> {
    return ApiClient.post<IEnderecoCliente[]>(API_ENDPOINTS.adicionarEndereco, endereco);
  }

  async editarEndereco(
    uuid: string,
    endereco: Partial<IEnderecoCliente>,
  ): Promise<IEnderecoCliente[]> {
    return ApiClient.patch<IEnderecoCliente[]>(API_ENDPOINTS.editarEndereco(uuid), endereco);
  }

  async removerEndereco(uuid: string): Promise<void> {
    await ApiClient.delete(API_ENDPOINTS.removerEndereco(uuid));
  }

  async listarCartoes(_userUuid: string): Promise<ICartaoCliente[]> {
    return ApiClient.get<ICartaoCliente[]>(API_ENDPOINTS.listarCartoes);
  }

  async adicionarCartao(cartao: Omit<ICartaoCliente, 'uuid'>): Promise<ICartaoCliente> {
    const uuidBandeira = uuidBandeiraParaNome(cartao.bandeira);
    const validadeIso =
      cartao.validade && cartao.validade.includes('/')
        ? validadeMmAaParaIso(cartao.validade) ?? cartao.validade
        : cartao.validade || '';

    const payloadApi = {
      uuidBandeira,
      token: `tok_sim_${Date.now()}`,
      ultimosDigitosCartao: cartao.ultimosDigitosCartao,
      nomeImpresso: cartao.nomeImpresso,
      validade: validadeIso,
      principal: false,
    };

    return ApiClient.post<ICartaoCliente>(API_ENDPOINTS.adicionarCartao, payloadApi);
  }

  async removerCartao(uuid: string): Promise<void> {
    await ApiClient.delete(API_ENDPOINTS.removerCartao(uuid));
  }

  async editarCartao(
    uuid: string,
    cartao: Partial<ICartaoCliente>,
  ): Promise<ICartaoCliente[]> {
    const uuidBandeira = cartao.bandeira ? uuidBandeiraParaNome(cartao.bandeira) : undefined;
    const validadeIso =
      cartao.validade && cartao.validade.includes('/')
        ? validadeMmAaParaIso(cartao.validade)
        : cartao.validade;

    const payloadApi = Object.fromEntries(
      Object.entries({ uuidBandeira, nomeImpresso: cartao.nomeImpresso, validade: validadeIso }).filter(
        ([, v]) => v !== undefined,
      ),
    );

    const result = await ApiClient.patch<ICartaoCliente | ICartaoCliente[]>(
      API_ENDPOINTS.editarCartao(uuid),
      payloadApi,
    );

    // O backend retorna um objeto singular do cartão atualizado, mas o contrato espera uma lista.
    return Array.isArray(result) ? result : [result];
  }

  async definirCartaoPreferencial(cartaoUuid: string): Promise<void> {
    await ApiClient.patch(API_ENDPOINTS.definirCartaoPreferencial(cartaoUuid));
  }

  async registrarClienteCompleto(payload: IRegistroClienteCompletoPayload): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.registrarCliente, payload);
  }
}
