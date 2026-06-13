import { api } from '../../../services/api';
import { ProfileData } from '../types/profile.types';

export const MOCK_PROFILE_DATA: ProfileData = {
  user: {
    name: 'Aryan',
    email: 'aryan@carbonsense.com',
    avatarUrl: undefined, // Will display default placeholder fallback
    memberSince: 'June 2026',
    sustainabilityScore: 82,
    currentStreak: 12,
  },
  impact: {
    carbonSaved: 142.0,
    activitiesLogged: 287,
    missionsCompleted: 64,
    communityContributions: 8,
  },
  achievements: [
    {
      id: 'ach-1',
      badge: '🏅',
      title: 'Week Warrior',
      description: 'Completed every daily mission for a consecutive 7-day period.',
      earnedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    },
    {
      id: 'ach-2',
      badge: '🌱',
      title: 'Green Starter',
      description: 'Logged your very first carbon footprint activity.',
      earnedAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(), // 30 days ago
    },
    {
      id: 'ach-3',
      badge: '⚡',
      title: 'Energy Saver',
      description: 'Reduced home electrical usage by 15% for three consecutive weeks.',
      earnedAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(), // 15 days ago
    },
  ],
  goals: [
    {
      id: 'goal-1',
      title: 'Reach Score 90',
      description: 'Improve sustainability metrics to reach an overall score of 90.',
      currentValue: 82,
      targetValue: 90,
      unit: 'Points',
      type: 'Reach Score 90',
      filterQuery: 'sort=impact',
      status: 'active',
    },
    {
      id: 'goal-2',
      title: 'Maintain Streak',
      description: 'Keep logging daily activities to complete a 30-day streak.',
      currentValue: 12,
      targetValue: 30,
      unit: 'Days',
      type: 'Maintain Streak',
      filterQuery: 'difficulty=Easy',
      status: 'active',
    },
    {
      id: 'goal-3',
      title: 'Reduce Transit Footprint',
      description: 'Commute via transit to cut carbon emissions.',
      currentValue: 35,
      targetValue: 50,
      unit: 'kg CO₂',
      type: 'Reduce Transport',
      filterQuery: 'category=Transport',
      status: 'active',
    },
    {
      id: 'goal-4',
      title: 'Vegetarian Committer',
      description: 'Choose vegetarian lunch options to cut down food footprint.',
      currentValue: 15,
      targetValue: 15,
      unit: 'Meals',
      type: 'Reduce Food',
      filterQuery: 'category=Food',
      status: 'completed',
    },
  ],
  statistics: {
    longestStreak: 27,
    missionCompletionRate: 84,
    monthlyProgress: 14,
    scoreTrend: 'up',
  },
};

export const getProfileData = async (): Promise<ProfileData> => {
  try {
    const response = await api.get<ProfileData>('/profile');
    return response.data;
  } catch (error) {
    console.warn('GET /profile failed, falling back to mock data:', error);
    return MOCK_PROFILE_DATA;
  }
};
