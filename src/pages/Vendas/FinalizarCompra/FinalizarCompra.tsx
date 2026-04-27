import { useState } from 'react';
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

  // Se o hook terminou de carregar e ainda não temos endereço selecionado (ex: carregamento tardio), 
  // tentamos selecionar novamente. Como enderecoSelecionado é null apenas inicialmente,
  // esta lógica só roda quando os dados chegam.
  if (!enderecoSelecionado && hook.data?.enderecosDisponiveis?.length) {
    const list = hook.data.enderecosDisponiveis;
    const principal = list.find((e) => e.principal) || list[0];
    setEnderecoSelecionado(principal.uuid);
  }

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
      key={enderecoSelecionado || 'sem-endereco'}
      data={hook.data}
      hook={hook}
      carrinho={carrinho}
      enderecoSelecionado={enderecoSelecionado}
      setEnderecoSelecionado={setEnderecoSelecionado}
    />
  );
};
