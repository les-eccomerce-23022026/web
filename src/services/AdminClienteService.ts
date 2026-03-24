import { USE_MOCK } from '@/config/apiConfig';
import { AdminClienteServiceMock } from '@/services/mock/AdminClienteServiceMock';
import { AdminClienteServiceApi } from '@/services/api/AdminClienteServiceApi';
import type { IAdminClienteService } from '@/services/contracts/IAdminClienteService';

export const AdminClienteService: IAdminClienteService = USE_MOCK
  ? new AdminClienteServiceMock()
  : new AdminClienteServiceApi();

export type { IAdminClienteService };
