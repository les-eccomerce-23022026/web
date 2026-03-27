import type {
  ICliente,
  IAtualizarPerfilPayload,
  IAlterarSenhaPayload,
  IRegistroClienteCompletoPayload,
} from '@/interfaces/ICliente';
import type { IEnderecoCliente, ICartaoSalvoPagamento as ICartaoCliente } from '@/interfaces/IPagamento';

export interface IClienteService {
  obterPerfil(userUuid: string): Promise<ICliente>;
  atualizarPerfil(payload: IAtualizarPerfilPayload): Promise<void>;
  alterarSenha(userUuid: string, payload: IAlterarSenhaPayload): Promise<void>;
  inativarConta(): Promise<void>;
  listarEnderecos(userUuid: string): Promise<IEnderecoCliente[]>;
  adicionarEndereco(endereco: Omit<IEnderecoCliente, 'uuid'>): Promise<IEnderecoCliente[]>;
  editarEndereco(uuid: string, endereco: Partial<IEnderecoCliente>): Promise<IEnderecoCliente[]>;
  removerEndereco(uuid: string): Promise<void>;
  listarCartoes(userUuid: string): Promise<ICartaoCliente[]>;
  adicionarCartao(cartao: Omit<ICartaoCliente, 'uuid'>): Promise<ICartaoCliente>;
  editarCartao(uuid: string, cartao: Partial<ICartaoCliente>): Promise<ICartaoCliente[]>;
  removerCartao(uuid: string): Promise<void>;
  definirCartaoPreferencial(cartaoUuid: string): Promise<void>;
  registrarClienteCompleto(payload: IRegistroClienteCompletoPayload): Promise<void>;
}
