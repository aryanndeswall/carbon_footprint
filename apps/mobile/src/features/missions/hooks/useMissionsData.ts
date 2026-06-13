import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMissionsData, completeMissionAPI } from '../services/missions.service';
import { MissionsData } from '../types/missions.types';

export const useMissionsData = () => {
  const queryClient = useQueryClient();

  const query = useQuery<MissionsData, Error>({
    queryKey: ['missions'],
    queryFn: getMissionsData,
    staleTime: 60 * 1000, // 60 seconds stale time
    refetchOnWindowFocus: true,
  });

  const invalidateMissions = async () => {
    await queryClient.invalidateQueries({ queryKey: ['missions'] });
  };

  return {
    ...query,
    invalidateMissions,
  };
};

export const useCompleteMissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeMissionAPI,
    // Optimistic Update
    onMutate: async (missionId) => {
      // Cancel outstanding query refetches to avoid overwriting our optimistic state
      await queryClient.cancelQueries({ queryKey: ['missions'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<MissionsData>(['missions']);

      // Optimistically update cache
      if (previousData) {
        const updatedDailyMissions = previousData.dailyMissions.map((mission) => {
          if (mission.id === missionId) {
            return {
              ...mission,
              status: 'completed' as const,
              progress: 1.0,
            };
          }
          return mission;
        });

        // Compute updated progress counts
        const completedCount = updatedDailyMissions.filter((m) => m.status === 'completed').length;
        const totalCount = updatedDailyMissions.length;
        const percentage = Math.round((completedCount / totalCount) * 100);

        const targetMission = previousData.dailyMissions.find((m) => m.id === missionId);
        const addedScore = targetMission ? targetMission.rewardScore : 0;

        const updatedProgress = {
          ...previousData.progress,
          completedCount,
          percentage,
          scoreEarned: previousData.progress.scoreEarned + addedScore,
        };

        // Add to completed list
        const updatedCompleted = [
          {
            id: `comp-opt-${Date.now()}`,
            title: targetMission?.title || 'Daily Action',
            completedAt: new Date().toISOString(),
            rewardScore: addedScore,
          },
          ...previousData.completedMissions,
        ];

        queryClient.setQueryData<MissionsData>(['missions'], {
          ...previousData,
          dailyMissions: updatedDailyMissions,
          progress: updatedProgress,
          completedMissions: updatedCompleted,
        });
      }

      // Return context carrying previous snapshot
      return { previousData };
    },
    // On error, rollback
    onError: (err, missionId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['missions'], context.previousData);
      }
    },
    // Always refetch or invalidate on settlement
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Sync dashboard score too
    },
  });
};
