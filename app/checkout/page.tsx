'use client';

/**
 * Checkout page - Client Component with Redux
 * Migrated from src/pages-react-router/Vendas/FinalizarCompra/FinalizarCompra.tsx
 */

import { useState, useMemo } from 'react';
import styles from '@/pages-react-router/Vendas/FinalizarCompra/style.module.css';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import { useAppSelector } from '@/store/hooks';
import { FinalizarCompraPedidoCarregado } from '@/pages-react-router/Vendas/FinalizarCompra/FinalizarCompraPedidoCarregado';
import { FinalizarCompraSkeleton } from '@/pages-react-router/Vendas/FinalizarCompra/FinalizarCompraSkeleton';

export default function CheckoutPage() {
  const hook = useFinalizarCompra();
  const carrinho = useAppSelector((state) => state.carrinho.data);

  // Calcula o endereço inicial usando useMemo
  const enderecoInicial = useMemo(() => {
    const list = hook.data?.enderecosDisponiveis;
    if (!list || list.length === 0) return null;
    return (list.find((e) => e.principal) || list[0]).uuid;
  }, [hook.data?.enderecosDisponiveis]);

  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(enderecoInicial);

  if (hook.loading) {
    return <FinalizarCompraSkeleton />;
  }
  if (hook.error) {
    return <p className={styles['checkout-status-message']}>Erro ao carregar checkout.</p>;
  }
  if (!hook.data) {
    return <p className={styles['checkout-status-message']}>Nenhum dado de checkout encontrado.</p>;
  }

  return (
    <FinalizarCompraPedidoCarregado
      data={hook.data}
      hook={hook}
      carrinho={carrinho}
      enderecoSelecionado={enderecoSelecionado}
      setEnderecoSelecionado={setEnderecoSelecionado}
    />
  );
}
