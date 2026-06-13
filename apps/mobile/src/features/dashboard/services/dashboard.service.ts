import { api } from '../../../services/api';
import { DashboardData } from '../types/dashboard.types';

// Mock data matching specs and schemas
export const MOCK_DASHBOARD_DATA: DashboardData = {
  score: 82,
  scoreTrend: '+3 this week',
  streak: 12,
  activitiesLoggedCount: 5,
  mission: {
    id: 'mission-today',
    title: 'Eat one vegetarian meal',
    category: 'Food',
    difficulty: 'Easy',
    scoreReward: 3,
    carbonReward: 1.2,
    status: 'available',
    description: 'Swap out meat for a plant-based alternative for one meal today.',
  },
  insights: {
    id: 'insight-latest',
    title: 'AI Coach Recommendation',
    text: 'Your transport habits improved by 18% this week. Try one more metro trip this week to reach a score of 85.',
    suggestion: 'Take the metro instead of driving today.',
  },
  forecast: {
    period: '30 Day',
    currentScore: 82,
    projectedScore: 88,
    confidence: 81,
    summary: 'Consistent daily actions could elevate your score to 88 by next month.',
  },
  categories: [
    { name: 'Transport', value: 2.4, limit: 5.0, progress: 0.48 },
    { name: 'Food', value: 1.2, limit: 3.0, progress: 0.4 },
    { name: 'Energy', value: 0.8, limit: 4.0, progress: 0.2 },
    { name: 'Shopping', value: 1.5, limit: 3.5, progress: 0.42 },
  ],
  activities: [
    {
      id: 'act-1',
      category: 'Transport',
      activity_type: 'Metro Ride',
      quantity: 12,
      unit: 'km',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    },
    {
      id: 'act-2',
      category: 'Food',
      activity_type: 'Vegetarian Meal',
      quantity: 1,
      unit: 'meal',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    },
    {
      id: 'act-3',
      category: 'Transport',
      activity_type: 'Bus Commute',
      quantity: 8,
      unit: 'km',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    },
    {
      id: 'act-4',
      category: 'Energy',
      activity_type: 'Led Bulb Swap',
      quantity: 4,
      unit: 'bulbs',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    },
    {
      id: 'act-5',
      category: 'Shopping',
      activity_type: 'Thrift Clothing',
      quantity: 2,
      unit: 'items',
      timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    },
  ],
};

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  } catch (error) {
    // Return mock data for MVP development/offline mode
    console.warn('GET /dashboard failed, falling back to mock data:', error);
    return MOCK_DASHBOARD_DATA;
  }
};
