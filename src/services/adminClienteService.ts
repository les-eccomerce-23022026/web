import { USE_MOCK } from '../config/apiConfig';
import { AdminClienteServiceMock } from './mock/adminClienteServiceMock';
import { AdminClienteServiceApi } from './api/adminClienteServiceApi';
import type { IAdminClienteService } from './contracts/adminClienteService';

export const AdminClienteService: IAdminClienteService = USE_MOCK
  ? new AdminClienteServiceMock()
  : new AdminClienteServiceApi();

export type { IAdminClienteService };
