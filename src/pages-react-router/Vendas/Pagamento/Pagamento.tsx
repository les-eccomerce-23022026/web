import { Navigate } from 'react-router-dom';

/**
 * Rota legada `/pagamento`: redireciona para o fluxo de finalizar compra.
 * A tela principal é `FinalizarCompra` (`useFinalizarCompra`).
 */
export const PagamentoRedirecionaFinalizarCompra = () => {
  return <Navigate to="/checkout" replace />;
};
