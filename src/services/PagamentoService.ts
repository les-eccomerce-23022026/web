/**
 * Factory de PagamentoService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → PagamentoServiceMock
 * - VITE_USE_MOCK=false → PagamentoServiceApi
 */
import { USE_MOCK } from '@/config/apiConfig';
import { PagamentoServiceMock } from '@/services/mock/PagamentoServiceMock';
import { PagamentoServiceApi } from '@/services/api/PagamentoServiceApi';
import type { IPagamentoService } from '@/services/contracts/IPagamentoService';

export const PagamentoService: IPagamentoService = USE_MOCK
  ? new PagamentoServiceMock()
  : new PagamentoServiceApi();

export type { IPagamentoService };
