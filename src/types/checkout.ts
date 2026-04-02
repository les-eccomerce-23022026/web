import type { ICartaoCreditoInput } from '@/interfaces/IPagamento';

export type OpcoesFinalizarCheckout = {
  cartaoSalvoUuid?: string | null;
  novoCartao?: ICartaoCreditoInput | null;
};
