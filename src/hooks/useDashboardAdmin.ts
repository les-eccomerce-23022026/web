import { useState, useEffect } from 'react';
import { DashboardAdminService } from '@/services/dashboardAdminService';
import type { IDashboardAdminInfo } from '@/interfaces/dashboardAdmin';

export function useDashboardAdmin() {
  const [data, setData] = useState<IDashboardAdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    DashboardAdminService.getDashboardInfo()
      .then((dashboardData) => {
        setData(dashboardData);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const hasError = error !== null;

  return { data, isLoading, hasError, error };
}
