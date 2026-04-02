import { useState } from 'react';
import styles from './FinalizarCompra.module.css';
import { useFinalizarCompra } from '@/hooks/useFinalizarCompra';
import { useAppSelector } from '@/store/hooks';
import type { ICartaoCreditoInput } from '@/interfaces/pagamento';
import { FinalizarCompraPedidoCarregado } from './FinalizarCompraPedidoCarregado';

export const FinalizarCompra = () => {
  const hook = useFinalizarCompra();
  const carrinho = useAppSelector((state) => state.carrinho.data);
  const [mostrarNovoCartao, setMostrarNovoCartao] = useState(false);
  const [cartaoSelecionado, setCartaoSelecionado] = useState<string | null>(null);
  const [novoCartao, setNovoCartao] = useState<ICartaoCreditoInput | null>(null);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<string | null>(null);

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
      mostrarNovoCartao={mostrarNovoCartao}
      setMostrarNovoCartao={setMostrarNovoCartao}
      cartaoSelecionado={cartaoSelecionado}
      setCartaoSelecionado={setCartaoSelecionado}
      novoCartao={novoCartao}
      setNovoCartao={setNovoCartao}
      enderecoSelecionado={enderecoSelecionado}
      setEnderecoSelecionado={setEnderecoSelecionado}
    />
  );
};
