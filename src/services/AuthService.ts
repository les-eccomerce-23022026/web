/**
 * Factory de AuthService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → AuthServiceMock  (dados JSON locais, sem HTTP)
 * - VITE_USE_MOCK=false → AuthServiceApi   (chamadas ao backend real)
 *
 * O resto da aplicação importa apenas daqui:
 *   import { AuthService } from '@/services/AuthService';
 */
import { USE_MOCK } from '@/config/apiConfig';
import { AuthServiceMock } from '@/services/mock/AuthServiceMock';
import { AuthServiceApi } from '@/services/api/AuthServiceApi';
import type { IAuthService } from '@/services/contracts/IAuthService';

export const AuthService: IAuthService = USE_MOCK
  ? new AuthServiceMock()
  : new AuthServiceApi();

export type { IAuthService };
