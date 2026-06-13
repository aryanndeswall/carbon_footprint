import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useTodayFootprint = () => {
  return useQuery({
    queryKey: ['footprints', 'today'],
    queryFn: async () => {
      const response = await api.get('/footprints/today');
      return response.data;
    },
    staleTime: 1000 * 60, // 60s staleness rule
  });
};

export const useWeeklyFootprint = () => {
  return useQuery({
    queryKey: ['footprints', 'weekly'],
    queryFn: async () => {
      const response = await api.get('/footprints/weekly');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
