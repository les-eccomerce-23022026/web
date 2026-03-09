import type { IDashboardAdminInfo } from '@/interfaces/IDashboardAdmin';

export interface IDashboardAdminService {
  getDashboardInfo(): Promise<IDashboardAdminInfo>;
}
