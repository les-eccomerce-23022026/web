/**
 * Factory de CarrinhoService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → CarrinhoServiceMock
 * - VITE_USE_MOCK=false → CarrinhoServiceApi
 */
import { USE_MOCK } from '../config/apiConfig';
import { CarrinhoServiceMock } from './mock/carrinhoServiceMock';
import { CarrinhoServiceApi } from './api/carrinhoServiceApi';
import type { ICarrinhoService } from './contracts/carrinhoService';

export const CarrinhoService: ICarrinhoService = USE_MOCK
  ? new CarrinhoServiceMock()
  : new CarrinhoServiceApi();

export type { ICarrinhoService };
