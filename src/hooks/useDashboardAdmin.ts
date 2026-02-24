import { useState, useEffect } from 'react';
import { DashboardAdminService } from '@/services/DashboardAdminService';
import type { IDashboardAdminInfo } from '@/interfaces/IDashboardAdmin';

export function useDashboardAdmin() {
  const [data, setData] = useState<IDashboardAdminInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    DashboardAdminService.getDashboardInfo()
      .then((dashboardData) => {
        setData(dashboardData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
