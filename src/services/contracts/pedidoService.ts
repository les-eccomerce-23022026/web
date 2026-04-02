import type { IPedido } from '@/interfaces/pedido';
import type { ICupomTroca } from '@/interfaces/devolucao';

export interface IPedidoService {
  getPedidosByCliente(clienteUuid: string): Promise<IPedido[]>;
  getAllPedidos(statusFiltro?: string[]): Promise<IPedido[]>;
  despacharPedido(pedidoUuid: string): Promise<IPedido>;
  confirmarEntrega(pedidoUuid: string): Promise<IPedido>;
  getPedidosEmTroca(): Promise<IPedido[]>;
  solicitarTroca(pedidoUuid: string, motivo: string, itensUuids: string[]): Promise<IPedido>;
  autorizarTroca(pedidoUuid: string): Promise<IPedido>;
  confirmarRecebimentoTroca(
    pedidoUuid: string,
    retornarEstoque: boolean,
  ): Promise<{ pedido: IPedido; cupomGerado: ICupomTroca }>;
  getCuponsCliente(clienteUuid?: string): Promise<ICupomTroca[]>;
}
