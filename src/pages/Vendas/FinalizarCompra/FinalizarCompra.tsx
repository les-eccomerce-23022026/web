import { useMemo, useState } from 'react';
import styles from './FinalizarCompra.module.css';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import { useAppSelector } from '@/store/hooks';
import { FinalizarCompraPedidoCarregado } from './FinalizarCompraPedidoCarregado';

export const FinalizarCompra = () => {
  const hook = useFinalizarCompra();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(null);
  const enderecoSelecionadoEfetivo = useMemo(() => {
    const list = hook.data?.enderecosDisponiveis;
    if (!list?.length) return null;
    if (enderecoSelecionado && list.some((e) => e.uuid === enderecoSelecionado)) return enderecoSelecionado;
    const principal = list.find((e) => e.principal);
    return (principal ?? list[0]).uuid;
  }, [hook.data, enderecoSelecionado]);

  if (hook.isLoading) {
    return <p className={styles['checkout-status-message']}>Carregando dados de checkout...</p>;
  }
  if (hook.hasError) {
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
      enderecoSelecionado={enderecoSelecionadoEfetivo}
      setEnderecoSelecionado={setEnderecoSelecionado}
    />
  );
};
