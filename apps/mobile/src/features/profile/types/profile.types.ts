export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  memberSince: string;
  sustainabilityScore: number;
  currentStreak: number;
}

export interface ImpactMetrics {
  carbonSaved: number;
  activitiesLogged: number;
  missionsCompleted: number;
  communityContributions: number;
}

export interface Achievement {
  id: string;
  badge: string; // Emoji badge
  title: string;
  description: string;
  earnedAt: string;
}

export type GoalType = 
  | 'Reach Score 90'
  | 'Maintain Streak'
  | 'Reduce Transport'
  | 'Reduce Food'
  | 'Reduce Energy';

export interface Goal {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  type: GoalType;
  filterQuery: string;
  status: 'active' | 'completed' | 'expired';
}

export interface ProfileStatistics {
  longestStreak: number;
  missionCompletionRate: number;
  monthlyProgress: number; // percentage change in score/carbon savings
  scoreTrend: 'up' | 'down' | 'flat';
}

export interface ProfileData {
  user: UserProfile;
  impact: ImpactMetrics;
  achievements: Achievement[];
  goals: Goal[];
  statistics: ProfileStatistics;
}
