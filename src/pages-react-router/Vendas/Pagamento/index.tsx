import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Rota legada `/pagamento`: redireciona para o fluxo de finalizar compra.
 * A tela principal é `FinalizarCompra` (`useFinalizarCompra`).
 */
export const PagamentoRedirecionaFinalizarCompra = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/checkout');
  }, [router]);
  
  return null;
};
