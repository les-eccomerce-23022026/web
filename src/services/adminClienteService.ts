import { USE_MOCK } from '@/config/apiConfig';
import { AdminClienteServiceMock } from '@/services/mock/adminClienteServiceMock';
import { AdminClienteServiceApi } from '@/services/api/adminClienteServiceApi';
import type { IAdminClienteService } from '@/services/contracts/adminClienteService';

export const AdminClienteService: IAdminClienteService = USE_MOCK
  ? new AdminClienteServiceMock()
  : new AdminClienteServiceApi();

export type { IAdminClienteService };
