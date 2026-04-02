/**
 * Factory de CarrinhoService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → CarrinhoServiceMock
 * - VITE_USE_MOCK=false → CarrinhoServiceApi
 */
import { USE_MOCK } from '@/config/apiConfig';
import { CarrinhoServiceMock } from '@/services/mock/carrinhoServiceMock';
import { CarrinhoServiceApi } from '@/services/api/carrinhoServiceApi';
import type { ICarrinhoService } from '@/services/contracts/carrinhoService';

export const CarrinhoService: ICarrinhoService = USE_MOCK
  ? new CarrinhoServiceMock()
  : new CarrinhoServiceApi();

export type { ICarrinhoService };
