'use client';

/**
 * Checkout page - Client Component with Redux
 * Migrated from src/pages-react-router/Vendas/FinalizarCompra/FinalizarCompra.tsx
 */

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import { useAppSelector } from '@/store/hooks';
import { FinalizarCompraPedidoCarregado } from '@/pages-react-router/Vendas/FinalizarCompra/FinalizarCompraPedidoCarregado';
import { FinalizarCompraSkeleton } from '@/pages-react-router/Vendas/FinalizarCompra/FinalizarCompraSkeleton';

export default function CheckoutPage() {
  const hook = useFinalizarCompra();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const router = useRouter();

  // Calcula o endereço inicial usando useMemo
  const enderecoInicial = useMemo(() => {
    const list = hook.data?.enderecosDisponiveis;
    if (!list || list.length === 0) return null;
    return (list.find((e) => e.principal) || list[0]).uuid;
  }, [hook.data?.enderecosDisponiveis]);

  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(enderecoInicial);
  const [enderecoCobrancaSelecionado, setEnderecoCobrancaSelecionado] = useState<string | null>(null);

  if (hook.loading) {
    return <FinalizarCompraSkeleton />;
  }
  if (hook.error) {
    return (
      <div className="empty-state-container" style={{ marginTop: '2rem' }}>
        <div className="empty-state-icon">
          <ShoppingBag size={64} strokeWidth={1.5} />
        </div>
        <h3 className="empty-state-title">Erro ao carregar checkout</h3>
        <p className="empty-state-message">
          Ocorreu um erro ao tentar carregar os dados do checkout. Por favor, tente novamente mais tarde.
        </p>
        <button className="btn-primary" onClick={() => router.push('/')}>
          Voltar para a página inicial
        </button>
      </div>
    );
  }
  if (!hook.data) {
    return (
      <div className="empty-state-container" style={{ marginTop: '2rem' }}>
        <div className="empty-state-icon">
          <ShoppingBag size={64} strokeWidth={1.5} />
        </div>
        <h3 className="empty-state-title">Carrinho vazio</h3>
        <p className="empty-state-message">
          Seu carrinho de compras está vazio. Adicione livros ao carrinho para prosseguir com o checkout.
        </p>
        <button className="btn-primary" onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Explorar Livros
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <FinalizarCompraPedidoCarregado
      data={hook.data}
      hook={hook}
      carrinho={carrinho}
      enderecoSelecionado={enderecoSelecionado}
      setEnderecoSelecionado={setEnderecoSelecionado}
      enderecoCobrancaSelecionado={enderecoCobrancaSelecionado}
      setEnderecoCobrancaSelecionado={setEnderecoCobrancaSelecionado}
    />
  );
}
