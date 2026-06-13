import { api } from '../../../services/api';
import { CoachData, CoachResponse } from '../types/coach.types';

export const MOCK_COACH_DATA: CoachData = {
  insight: {
    headline: "Today's Insight",
    summary: "Your transport emissions decreased by 18% this week.",
    recommendation: "One more metro ride could increase your Sustainability Score by 3 points.",
  },
  recommendations: [
    {
      id: 'rec-1',
      category: 'Transport',
      title: 'Take Metro Tomorrow',
      description: 'Replace your personal vehicle commute with a metro ride to work.',
      impact: 'High',
      difficulty: 'Easy',
      rewardScore: 3,
      rewardCarbon: 4.2,
      ctaLabel: 'Log This Activity',
      ctaNavigation: '/modals/activity-log?category=Transport',
    },
    {
      id: 'rec-2',
      category: 'Food',
      title: 'Choose Plant-Based Lunch',
      description: 'Enjoy a plant-based vegetarian or vegan lunch meal instead of meat today.',
      impact: 'Medium',
      difficulty: 'Easy',
      rewardScore: 2,
      rewardCarbon: 1.5,
      ctaLabel: 'Log This Activity',
      ctaNavigation: '/modals/activity-log?category=Food',
    },
    {
      id: 'rec-3',
      category: 'Score Goal',
      title: 'Simulate Score Goal',
      description: 'See how optimizing home heating presets affects your score projection.',
      impact: 'High',
      difficulty: 'Medium',
      rewardScore: 5,
      rewardCarbon: 6.0,
      ctaLabel: 'Simulate This',
      ctaNavigation: '/simulator?preset=energy',
    },
  ],
  forecast: {
    currentScore: 82,
    projectedScore: 88,
    confidence: 81,
    explanation: 'Your mission completion rate indicates strong upward momentum.',
  },
  trends: [
    {
      category: 'Transport',
      state: 'Improving',
      percentage: 12,
      period: 'Last 30 Days',
    },
    {
      category: 'Food',
      state: 'Stable',
      percentage: 0,
      period: 'Last 30 Days',
    },
    {
      category: 'Energy',
      state: 'Declining',
      percentage: -8,
      period: 'Last 30 Days',
    },
    {
      category: 'Shopping',
      state: 'Improving',
      percentage: 5,
      period: 'Last 30 Days',
    },
  ],
  history: [
    {
      id: 'msg-1',
      sender: 'coach',
      text: 'Hi there! I analyzed your transport habits from last week. You traveled 45km by metro, saving about 9.2kg of CO₂ compared to driving. Great job!',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'Thanks! How can I save even more?',
      timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString(),
    },
    {
      id: 'msg-3',
      sender: 'coach',
      text: 'Based on your omnivore diet, choosing a veggie lunch just twice a week could reduce your food footprint by 15%. I have added some actionable tips below!',
      timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    },
  ],
};

export const getCoachData = async (): Promise<CoachData> => {
  try {
    const response = await api.get<CoachData>('/coach');
    return response.data;
  } catch (error) {
    console.warn('GET /coach failed, falling back to mock data:', error);
    return MOCK_COACH_DATA;
  }
};

export const queryCoachAPI = async (query: string): Promise<CoachResponse> => {
  try {
    const response = await api.post<CoachResponse>('/coach/query', { query });
    return response.data;
  } catch (error) {
    console.warn('POST /coach/query failed, simulating response:', error);
    
    // Simulate smart structured responses based on query keywords
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('improve') || lowerQuery.includes('score')) {
      return {
        response: 'Observation:\nYour weekly transport missions are 60% complete.\n\nReason:\nCar travel remains your largest emissions source.\n\nRecommendation:\nTry taking the metro to work twice next week to boost your score by 4 points.',
        observation: 'Your weekly transport missions are 60% complete.',
        reason: 'Car travel remains your largest emissions source.',
        recommendation: 'Try taking the metro to work twice next week to boost your score by 4 points.',
      };
    } else if (lowerQuery.includes('transport') || lowerQuery.includes('commute')) {
      return {
        response: 'Observation:\nMetro rides constitute 80% of your commuting, saving 12kg of CO₂.\n\nReason:\nYou still rely on single-passenger vehicles for weekend trips.\n\nRecommendation:\nSwitch to walking or cycling for weekend errands under 3km.',
        observation: 'Metro rides constitute 80% of your commuting, saving 12kg of CO₂.',
        reason: 'You still rely on single-passenger vehicles for weekend trips.',
        recommendation: 'Switch to walking or cycling for weekend errands under 3km.',
      };
    } else if (lowerQuery.includes('opportunity') || lowerQuery.includes('biggest')) {
      return {
        response: 'Observation:\nYour home heating standby draw is 15% above normal usage.\n\nReason:\nElectronics are left plugged in during work hours.\n\nRecommendation:\nUtilize smart power strips to fully disable vampire appliances during the day.',
        observation: 'Your home heating standby draw is 15% above normal usage.',
        reason: 'Electronics are left plugged in during work hours.',
        recommendation: 'Utilize smart power strips to fully disable vampire appliances during the day.',
      };
    } else {
      return {
        response: 'Observation:\nOverall habits are stable, with food footprint leading emission sources.\n\nReason:\nHigh dairy and beef usage over the last 14 days.\n\nRecommendation:\nSubstitute plant-based alternatives for cheese or beef once a day.',
        observation: 'Overall habits are stable, with food footprint leading emission sources.',
        reason: 'High dairy and beef usage over the last 14 days.',
        recommendation: 'Substitute plant-based alternatives for cheese or beef once a day.',
      };
    }
  }
};
