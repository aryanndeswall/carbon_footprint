export interface CoachInsight {
  headline: string;
  summary: string;
  recommendation: string;
}

export type RecommendationCategory =
  | 'Transport'
  | 'Food'
  | 'Energy'
  | 'Shopping'
  | 'Community'
  | 'Mission Related'
  | 'Score Goal'
  | 'General';

export interface Recommendation {
  id: string;
  category: RecommendationCategory;
  title: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rewardScore: number;
  rewardCarbon: number;
  ctaLabel: string;
  ctaNavigation: string;
}

export interface Forecast {
  currentScore: number;
  projectedScore: number;
  confidence: number;
  explanation: string;
}

export type TrendState = 'Improving' | 'Stable' | 'Declining';

export interface Trend {
  category: 'Transport' | 'Food' | 'Energy' | 'Shopping';
  state: TrendState;
  percentage: number;
  period: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export interface CoachResponse {
  response: string;
  observation: string;
  reason: string;
  recommendation: string;
}

export interface CoachData {
  insight: CoachInsight;
  recommendations: Recommendation[];
  forecast: Forecast;
  trends: Trend[];
  history: ConversationMessage[];
}
