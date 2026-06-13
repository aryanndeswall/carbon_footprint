import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/storage';

export interface OfflineActivity {
  id: string;
  category: string;
  activity_type: string;
  quantity: number;
  unit: string;
  created_at: string;
}

interface SyncState {
  queue: OfflineActivity[];
  enqueueActivity: (activity: Omit<OfflineActivity, 'id' | 'created_at'>) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      enqueueActivity: (activity) => set((state) => ({
        queue: [
          ...state.queue,
          {
            ...activity,
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
          },
        ],
      })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'sync-queue-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
