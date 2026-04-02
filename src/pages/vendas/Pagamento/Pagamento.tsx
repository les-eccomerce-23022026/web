import { Navigate } from 'react-router-dom';

/**
 * Componente Pagamento foi substituído por redirect.
 * O checkout agora é gerenciado pelo componente Checkout.tsx com useCheckout.
 */
export const Pagamento = () => {
  return <Navigate to="/checkout" replace />;
}
