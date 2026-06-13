import { useSyncStore, OfflineActivity } from '../store/useSyncStore';
import { api } from './api';

export const syncOfflineQueue = async (queryClient?: any): Promise<{ successCount: number; failedCount: number }> => {
  const { queue, clearQueue } = useSyncStore.getState();

  if (queue.length === 0) {
    return { successCount: 0, failedCount: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  // Sync each activity log sequentially to /activities endpoint
  for (const activity of queue) {
    try {
      const payload = {
        category: activity.category,
        activity_type: activity.activity_type,
        quantity: activity.quantity,
        unit: activity.unit,
      };

      await api.post('/activities', payload);
      successCount++;
    } catch (error) {
      console.error(`Error syncing offline activity ID ${activity.id}:`, error);
      failedCount++;
    }
  }

  // Clear local queue upon completed sweep
  clearQueue();

  // Invalidate queryClient cache if provided to refresh footprint scores
  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: ['footprints'] });
    queryClient.invalidateQueries({ queryKey: ['activities'] });
    queryClient.invalidateQueries({ queryKey: ['streaks'] });
  }

  return { successCount, failedCount };
};
