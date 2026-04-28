import { useState, useMemo } from 'react';
import styles from './FinalizarCompra.module.css';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import { useAppSelector } from '@/store/hooks';
import { FinalizarCompraPedidoCarregado } from './FinalizarCompraPedidoCarregado';

export const FinalizarCompra = () => {
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
      // Removido key prop para evitar re-mount; usar apenas se necessário para forçar re-render
      data={hook.data}
      hook={hook}
      carrinho={carrinho}
      enderecoSelecionado={enderecoSelecionado}
      setEnderecoSelecionado={setEnderecoSelecionado}
    />
  );
};
