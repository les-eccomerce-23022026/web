/**
 * Factory de ClienteService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → ClienteServiceMock  (dados JSON locais, sem HTTP)
 * - VITE_USE_MOCK=false → ClienteServiceApi   (chamadas ao backend real)
 */
import { USE_MOCK } from '@/config/apiConfig';
import { ClienteServiceMock } from '@/services/mock/clienteServiceMock';
import { ClienteServiceApi } from '@/services/api/clienteServiceApi';
import type { IClienteService } from '@/services/contracts/clienteService';

export const ClienteService: IClienteService = USE_MOCK
  ? new ClienteServiceMock()
  : new ClienteServiceApi();

export type { IClienteService };
