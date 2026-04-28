import { useState, useEffect } from 'react';
import styles from './FinalizarCompra.module.css';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import { useAppSelector } from '@/store/hooks';
import { FinalizarCompraPedidoCarregado } from './FinalizarCompraPedidoCarregado';

export const FinalizarCompra = () => {
  const hook = useFinalizarCompra();
  const carrinho = useAppSelector((state) => state.carrinho.data);

  // Inicializa o endereço selecionado com base nos dados carregados, se disponível.
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(() => {
    const list = hook.data?.enderecosDisponiveis;
    if (!list || list.length === 0) return null;
    return (list.find((e) => e.principal) || list[0]).uuid;
  });

  useEffect(() => {
    if (!enderecoSelecionado && hook.data?.enderecosDisponiveis?.length) {
      const list = hook.data.enderecosDisponiveis;
      const principal = list.find((e) => e.principal) || list[0];
      setEnderecoSelecionado(principal.uuid);
    }
  }, [enderecoSelecionado, hook.data?.enderecosDisponiveis]);

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
      key="pedido-carregado-fixo"
      data={hook.data}
      hook={hook}
      carrinho={carrinho}
      enderecoSelecionado={enderecoSelecionado}
      setEnderecoSelecionado={setEnderecoSelecionado}
    />
  );
};
