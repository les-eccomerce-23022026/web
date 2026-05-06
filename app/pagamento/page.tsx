import { Suspense } from 'react';
import { Pagamento } from '../components/Pagamento';

export default function PagamentoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Pagamento />
    </Suspense>
  );
}
