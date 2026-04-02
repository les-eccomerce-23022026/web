import { useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchPedidosCliente,
  fetchPedidosEmTroca,
  solicitarTrocaThunk,
  autorizarTrocaThunk,
  confirmarRecebimentoTrocaThunk,
} from '@/store/slices/pedidoSlice';
import type { StatusPedido } from '@/interfaces/pedido';

export function usePedidos(clienteUuid?: string) {
  const dispatch = useAppDispatch();
  const { pedidos, status, error } = useAppSelector((state) => state.pedido);

  useEffect(() => {
    if (!clienteUuid) return;
    dispatch(fetchPedidosCliente(clienteUuid));
  }, [dispatch, clienteUuid]);

  const pedidosPorStatus = useCallback(
    (statusFiltro: StatusPedido) => pedidos.filter((p) => p.status === statusFiltro),
    [pedidos],
  );

  const solicitarTroca = useCallback(
    (pedidoUuid: string, motivo: string, itensUuids: string[]) =>
      dispatch(solicitarTrocaThunk({ pedidoUuid, motivo, itensUuids })),
    [dispatch],
  );

  return {
    pedidos,
    loading: status === 'loading',
    error,
    pedidosPorStatus,
    solicitarTroca,
  };
}

export function usePedidosTrocaAdmin() {
  const dispatch = useAppDispatch();
  const { pedidos, status, error } = useAppSelector((state) => state.pedido);

  useEffect(() => {
    dispatch(fetchPedidosEmTroca());
  }, [dispatch]);

  const autorizarTroca = useCallback(
    (pedidoUuid: string) => dispatch(autorizarTrocaThunk(pedidoUuid)),
    [dispatch],
  );

  const confirmarRecebimento = useCallback(
    (pedidoUuid: string, retornarEstoque: boolean) =>
      dispatch(confirmarRecebimentoTrocaThunk({ pedidoUuid, retornarEstoque })),
    [dispatch],
  );

  return {
    pedidos,
    loading: status === 'loading',
    error,
    autorizarTroca,
    confirmarRecebimento,
  };
}
