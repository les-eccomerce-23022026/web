import type { IDashboardAdminInfo } from '@/interfaces/dashboardAdmin';

export interface IDashboardAdminService {
  getDashboardInfo(): Promise<IDashboardAdminInfo>;
}
