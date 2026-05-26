/**
 * Factory de PedidoService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → PedidoServiceMock  (dados JSON locais, sem HTTP)
 * - VITE_USE_MOCK=false → PedidoServiceApi   (chamadas ao backend real)
 */
import { USE_MOCK } from '../config/apiConfig';
import { PedidoServiceMock } from './mock/pedidoServiceMock';
import { PedidoServiceApi } from './api/pedidoServiceApi';
import type { IPedidoService } from './contracts/pedidoService';

export const PedidoService: IPedidoService = USE_MOCK
  ? new PedidoServiceMock()
  : new PedidoServiceApi();

export type { IPedidoService };
