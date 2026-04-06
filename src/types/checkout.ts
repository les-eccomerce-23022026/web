import type { ICartaoCreditoInput } from '@/interfaces/pagamento';
import type { IEnderecoEntregaInput } from '@/interfaces/entrega';

export type OpcoesFinalizarCheckout = {
  cartaoSalvoUuid?: string | null;
  novoCartao?: ICartaoCreditoInput | null;
  /** Endereço para `POST /entregas` (API real). */
  enderecoEntrega?: IEnderecoEntregaInput | null;
};
