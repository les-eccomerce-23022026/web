import type { ICartaoCreditoInput, ICartaoSalvoPagamento as ICartaoCliente } from '@/interfaces/pagamento';
import { ClienteService } from '@/services/clienteService';

/** Monta o payload de `ClienteService.adicionarCartao` a partir do cartão digitado no checkout. */
export function montarPayloadAdicionarCartaoCheckout(
  novoCartao: ICartaoCreditoInput,
): Omit<ICartaoCliente, 'uuid'> {
  const digitos = novoCartao.numero.replace(/\D/g, '');
  return {
    ultimosDigitosCartao: digitos.slice(-4),
    nomeCliente: novoCartao.nomeTitular,
    nomeImpresso: novoCartao.nomeTitular,
    bandeira: novoCartao.bandeira,
    validade: novoCartao.validade,
  };
}

type AdicionarCartaoFn = (cartao: Omit<ICartaoCliente, 'uuid'>) => Promise<ICartaoCliente>;

/**
 * Se o usuário marcou "Salvar cartão para compras futuras", persiste no perfil após o pedido.
 * Falhas são tratadas pelo caller (ex.: aviso sem desfazer o pedido).
 * `usuarioUuid` é repassado ao serviço (ex.: mock em memória por usuário).
 */
export async function salvarCartaoPerfilSeSolicitado(
  novoCartao: ICartaoCreditoInput | undefined | null,
  usuarioUuid?: string,
  adicionarCartao: AdicionarCartaoFn = (c) =>
    ClienteService.adicionarCartao(c, usuarioUuid ? { userUuid: usuarioUuid } : undefined),
): Promise<void> {
  if (!novoCartao?.salvarCartao) {
    return;
  }
  await adicionarCartao(montarPayloadAdicionarCartaoCheckout(novoCartao));
}
