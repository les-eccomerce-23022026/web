/**
 * Factory de DashboardAdminService.
 *
 * Seleciona automaticamente a implementação correta:
 * - VITE_USE_MOCK=true  → DashboardAdminServiceMock
 * - VITE_USE_MOCK=false → DashboardAdminServiceApi
 */
import { USE_MOCK } from '@/config/apiConfig';
import { DashboardAdminServiceMock } from '@/services/mock/DashboardAdminServiceMock';
import { DashboardAdminServiceApi } from '@/services/api/DashboardAdminServiceApi';
import type { IDashboardAdminService } from '@/services/contracts/IDashboardAdminService';

export const DashboardAdminService: IDashboardAdminService = USE_MOCK
  ? new DashboardAdminServiceMock()
  : new DashboardAdminServiceApi();

export type { IDashboardAdminService };
