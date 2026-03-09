/**
 * Factory de PedidoService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → PedidoServiceMock  (dados JSON locais, sem HTTP)
 * - VITE_USE_MOCK=false → PedidoServiceApi   (chamadas ao backend real)
 */
import { USE_MOCK } from '@/config/apiConfig';
import { PedidoServiceMock } from '@/services/mock/PedidoServiceMock';
import { PedidoServiceApi } from '@/services/api/PedidoServiceApi';
import type { IPedidoService } from '@/services/contracts/IPedidoService';

export const PedidoService: IPedidoService = USE_MOCK
  ? new PedidoServiceMock()
  : new PedidoServiceApi();

export type { IPedidoService };
