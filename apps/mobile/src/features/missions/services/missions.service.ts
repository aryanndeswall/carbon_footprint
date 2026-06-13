import { api } from '../../../services/api';
import { MissionsData } from '../types/missions.types';

export const MOCK_MISSIONS_DATA: MissionsData = {
  dailyMissions: [
    {
      id: 'daily-1',
      title: 'Eat one vegetarian meal',
      description: 'Swap out meat for a plant-based alternative for one meal today and save 1.2kg CO₂.',
      category: 'Food',
      difficulty: 'Easy',
      rewardScore: 3,
      rewardCarbon: 1.2,
      progress: 0,
      status: 'available',
    },
    {
      id: 'daily-2',
      title: 'Walk or Cycle under 3km',
      description: 'Walk or ride a bike for short trips today instead of driving a personal car.',
      category: 'Transport',
      difficulty: 'Medium',
      rewardScore: 5,
      rewardCarbon: 2.1,
      progress: 0.5,
      status: 'in_progress',
    },
    {
      id: 'daily-3',
      title: 'Unplug standby electronics',
      description: 'Unplug chargers and media systems while not in use to curb vampire draw.',
      category: 'Energy',
      difficulty: 'Easy',
      rewardScore: 3,
      rewardCarbon: 0.8,
      progress: 1.0,
      status: 'completed',
    },
  ],
  weeklyMissions: [
    {
      id: 'weekly-1',
      title: 'Public Transport Champion',
      currentProgress: 2,
      totalTarget: 3,
      rewardScore: 15,
      isCompleted: false,
    },
    {
      id: 'weekly-2',
      title: 'Meat-Free Work Week',
      currentProgress: 5,
      totalTarget: 5,
      rewardScore: 25,
      isCompleted: true,
    },
  ],
  completedMissions: [
    {
      id: 'comp-1',
      title: 'Cold Water Wash Only',
      completedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      rewardScore: 3,
    },
    {
      id: 'comp-2',
      title: 'Local Farm Purchase',
      completedAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
      rewardScore: 5,
    },
  ],
  achievements: {
    id: 'ach-1',
    title: 'Week Warrior',
    progressText: 'Week Warrior',
    remainingCount: 2,
  },
  progress: {
    completedCount: 3,
    totalCount: 5,
    scoreEarned: 9,
    percentage: 60,
  },
};

export const getMissionsData = async (): Promise<MissionsData> => {
  try {
    const response = await api.get<MissionsData>('/missions');
    return response.data;
  } catch (error) {
    console.warn('GET /missions failed, falling back to mock data:', error);
    return MOCK_MISSIONS_DATA;
  }
};

export const completeMissionAPI = async (id: string): Promise<{ success: boolean; scoreReward: number }> => {
  try {
    const response = await api.post<{ success: boolean; scoreReward: number }>(`/missions/${id}/complete`);
    return response.data;
  } catch (error) {
    console.warn(`POST /missions/${id}/complete failed, simulating local success:`, error);
    // Find reward score from mocks
    const mission = MOCK_MISSIONS_DATA.dailyMissions.find((m) => m.id === id);
    return {
      success: true,
      scoreReward: mission ? mission.rewardScore : 3,
    };
  }
};
