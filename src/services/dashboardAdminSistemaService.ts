/**
 * Factory de DashboardAdminSistemaService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → DashboardAdminSistemaServiceMock
 * - VITE_USE_MOCK=false → DashboardAdminSistemaServiceApi
 */
import { USE_MOCK } from '../config/apiConfig';
import { DashboardAdminSistemaServiceMock } from './mock/dashboardAdminSistemaServiceMock';
import { DashboardAdminSistemaServiceApi } from './api/dashboardAdminSistemaServiceApi';
import type { IDashboardAdminSistemaService } from './contracts/dashboardAdminSistemaService';

export const DashboardAdminSistemaService: IDashboardAdminSistemaService = USE_MOCK
  ? new DashboardAdminSistemaServiceMock()
  : new DashboardAdminSistemaServiceApi();

export type { IDashboardAdminSistemaService };
