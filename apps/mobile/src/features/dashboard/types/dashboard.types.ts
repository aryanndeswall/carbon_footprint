export type MissionStatus = 'available' | 'in_progress' | 'completed' | 'expired';

export interface DailyMission {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  scoreReward: number;
  carbonReward: number; // in kg CO2
  status: MissionStatus;
  description: string;
}

export interface AIInsight {
  id: string;
  title: string;
  text: string;
  suggestion?: string;
}

export interface ForecastSummary {
  period: string; // e.g., "30 Day"
  currentScore: number;
  projectedScore: number;
  confidence: number; // percentage (0 - 100)
  summary: string;
}

export interface CategoryMetric {
  name: 'Transport' | 'Food' | 'Energy' | 'Shopping';
  value: number; // in kg CO2
  limit: number; // in kg CO2
  progress: number; // 0 to 1
}

export interface ActivityItem {
  id: string;
  category: 'Transport' | 'Food' | 'Energy' | 'Shopping';
  activity_type: string;
  quantity: number;
  unit: string;
  timestamp: string; // ISO string
}

export interface DashboardData {
  score: number;
  scoreTrend: string; // e.g., "+3 this week"
  streak: number;
  activitiesLoggedCount: number;
  mission: DailyMission;
  insights: AIInsight;
  forecast: ForecastSummary;
  categories: CategoryMetric[];
  activities: ActivityItem[];
}
