import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useLatestInsight = (insightType: string = 'daily_coaching') => {
  return useQuery({
    queryKey: ['ai', 'insights', insightType],
    queryFn: async () => {
      const response = await api.get(`/ai/insights/latest?type=${insightType}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // Cache valid for 10 minutes
  });
};

export const useGenerateInsight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightType: string) => {
      const response = await api.post('/ai/insights/generate', { type: insightType });
      return response.data;
    },
    onSuccess: (data, insightType) => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'insights', insightType] });
    },
  });
};
