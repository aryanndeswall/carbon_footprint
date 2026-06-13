export type MissionStatus = 'available' | 'in_progress' | 'completed' | 'expired';
export type MissionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: 'Transport' | 'Food' | 'Energy' | 'Shopping' | 'Community' | 'Special';
  difficulty: MissionDifficulty;
  rewardScore: number;
  rewardCarbon: number; // in kg CO2 saved
  progress: number; // 0 to 1.0 (e.g. 0, 0.25, 0.5, 0.75, 1.0)
  status: MissionStatus;
}

export interface WeeklyMission {
  id: string;
  title: string;
  currentProgress: number;
  totalTarget: number;
  rewardScore: number;
  isCompleted: boolean;
}

export interface CompletedMission {
  id: string;
  title: string;
  completedAt: string; // ISO string
  rewardScore: number;
}

export interface AchievementPreview {
  id: string;
  title: string;
  progressText: string; // e.g. "Week Warrior"
  remainingCount: number;
}

export interface MissionProgress {
  completedCount: number;
  totalCount: number;
  scoreEarned: number;
  percentage: number; // 0 to 100
}

export interface MissionsData {
  dailyMissions: DailyMission[];
  weeklyMissions: WeeklyMission[];
  completedMissions: CompletedMission[];
  achievements: AchievementPreview;
  progress: MissionProgress;
}
