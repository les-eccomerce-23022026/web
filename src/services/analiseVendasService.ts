/**
 * Factory de AnaliseVendasService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → AnaliseVendasServiceMock
 * - VITE_USE_MOCK=false → AnaliseVendasServiceApi
 */
import { USE_MOCK } from '../config/apiConfig';
import type { IAnaliseVendasService } from './contracts/analiseVendasService';
import { AnaliseVendasServiceApi } from './api/analiseVendasServiceApi';

export const AnaliseVendasService: IAnaliseVendasService = USE_MOCK
  ? new AnaliseVendasServiceApi() // Mock não implementado, usando API
  : new AnaliseVendasServiceApi();

export type { IAnaliseVendasService };
