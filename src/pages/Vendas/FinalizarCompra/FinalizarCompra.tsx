import { useState, useEffect } from 'react';
import styles from './FinalizarCompra.module.css';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import { useAppSelector } from '@/store/hooks';
import { FinalizarCompraPedidoCarregado } from './FinalizarCompraPedidoCarregado';

export const FinalizarCompra = () => {
  const hook = useFinalizarCompra();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    if (!hook.data?.enderecosDisponiveis?.length) {
      setEnderecoSelecionado(null);
      return;
    }
    const list = hook.data.enderecosDisponiveis;
    setEnderecoSelecionado((prev) => {
      if (prev && list.some((e) => e.uuid === prev)) return prev;
      const principal = list.find((e) => e.principal);
      return (principal ?? list[0]).uuid;
    });
  }, [hook.data]);

  if (hook.loading) {
    return <p className={styles['checkout-status-message']}>Carregando dados de checkout...</p>;
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
};
