import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDashboardData } from '../services/dashboard.service';
import { DashboardData } from '../types/dashboard.types';

export const useDashboardData = () => {
  const queryClient = useQueryClient();

  const query = useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    staleTime: 60 * 1000, // 60 seconds stale time
    refetchOnWindowFocus: true,
  });

  const invalidateAndRefetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  return {
    ...query,
    invalidateAndRefetch,
  };
};
