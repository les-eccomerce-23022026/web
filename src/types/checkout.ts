import type { ICartaoCreditoInput } from '@/interfaces/pagamento';
import type { IEnderecoEntregaInput } from '@/interfaces/entrega';

/** Linha de split no checkout (cartão salvo, novo ou PIX). */
export type LinhaPagamentoCheckout = {
  id: string;
  tipo: 'cartao_salvo' | 'cartao_novo' | 'pix';
  valor: number;
  /** 1..12; apenas para linhas de cartão. */
  parcelasCartao?: number;
  /** Obrigatório quando tipo é cartao_salvo */
  cartaoSalvoUuid?: string;
};

export type OpcoesFinalizarCheckout = {
  cartaoSalvoUuid?: string | null;
  /** Único cartão novo (atalho quando não há split explícito em parcelas de liquidação). */
  novoCartao?: ICartaoCreditoInput | null;
  /** Chave = id da linha `cartao_novo` (sem prefixo). */
  novosCartoesPorLinha?: Record<string, ICartaoCreditoInput>;
  /** Endereço para `POST /entregas` (API real). */
  enderecoEntrega?: IEnderecoEntregaInput | null;
};
