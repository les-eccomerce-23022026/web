/**
 * Factory de AuthService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → AuthServiceMock  (dados JSON locais, sem HTTP)
 * - VITE_USE_MOCK=false → AuthServiceApi   (chamadas ao backend real)
 *
 * O resto da aplicação importa apenas daqui:
 *   import { AuthService } from './authService';
 */
import { USE_MOCK } from '../config/apiConfig';
import { AuthServiceMock } from './mock/authServiceMock';
import { AuthServiceApi } from './api/authServiceApi';
import type { IAuthService } from './contracts/authService';

export const AuthService: IAuthService = USE_MOCK
  ? new AuthServiceMock()
  : new AuthServiceApi();

export type { IAuthService };
