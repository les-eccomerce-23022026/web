import type { IEnderecoEntregaInput } from '@/interfaces/entrega';
import type { PixPendenteInfo } from '@/utils/finalizarCompraLiquidacaoPagamentos';

export const STORAGE_KEY_CHECKOUT_PIX = 'checkout_pix_pendente';

export type CheckoutPixPendentePayload = {
  vendaUuid: string;
  pixPendentes: PixPendenteInfo[];
  entrega: {
    endereco: IEnderecoEntregaInput;
    tipoFrete: string;
    custoFrete: number;
  };
};

export function salvarCheckoutPixPendente(payload: CheckoutPixPendentePayload): void {
  sessionStorage.setItem(STORAGE_KEY_CHECKOUT_PIX, JSON.stringify(payload));
}

export function lerCheckoutPixPendente(): CheckoutPixPendentePayload | null {
  const raw = sessionStorage.getItem(STORAGE_KEY_CHECKOUT_PIX);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutPixPendentePayload;
  } catch {
    return null;
  }
}

export function limparCheckoutPixPendente(): void {
  sessionStorage.removeItem(STORAGE_KEY_CHECKOUT_PIX);
}
