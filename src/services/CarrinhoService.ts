/**
 * Factory de CarrinhoService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → CarrinhoServiceMock
 * - VITE_USE_MOCK=false → CarrinhoServiceApi
 */
import { USE_MOCK } from '@/config/apiConfig';
import { CarrinhoServiceMock } from '@/services/mock/CarrinhoServiceMock';
import { CarrinhoServiceApi } from '@/services/api/CarrinhoServiceApi';
import type { ICarrinhoService } from '@/services/contracts/ICarrinhoService';

export const CarrinhoService: ICarrinhoService = USE_MOCK
  ? new CarrinhoServiceMock()
  : new CarrinhoServiceApi();

export type { ICarrinhoService };
