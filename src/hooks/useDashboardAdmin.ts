import { useState, useEffect } from 'react';
import { DashboardAdminService } from '@/services/DashboardAdminService';
import type { DashboardAdminInfo } from '@/interfaces/DashboardAdmin';

export function useDashboardAdmin() {
  const [data, setData] = useState<DashboardAdminInfo | null>(null);
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
