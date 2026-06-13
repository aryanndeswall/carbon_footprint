import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useMissionsList = () => {
  return useQuery({
    queryKey: ['missions', 'today'],
    queryFn: async () => {
      const response = await api.get('/missions/today');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCompleteMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const response = await api.post(`/missions/${missionId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both today's missions and footprint cache to reflect changes immediately
      queryClient.invalidateQueries({ queryKey: ['missions', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['footprints', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['streaks'] });
    },
  });
};
