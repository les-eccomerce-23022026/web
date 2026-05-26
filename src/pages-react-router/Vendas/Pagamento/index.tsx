import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROTAS } from '@/config/rotas';

/**
 * Rota legada `/pagamento`: redireciona para o fluxo de finalizar compra.
 * A tela principal é `FinalizarCompra` (`useFinalizarCompra`).
 */
export const PagamentoRedirecionaFinalizarCompra = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(ROTAS.CHECKOUT);
  }, [router]);
  
  return null;
};
