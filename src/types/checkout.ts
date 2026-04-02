import type { ICartaoCreditoInput } from '@/interfaces/pagamento';

export type OpcoesFinalizarCheckout = {
  cartaoSalvoUuid?: string | null;
  novoCartao?: ICartaoCreditoInput | null;
};
