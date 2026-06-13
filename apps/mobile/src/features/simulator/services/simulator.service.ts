import { api } from '../../../services/api';
import {
  RunSimulationPayload,
  SavedScenario,
  ScenarioCategory,
  ScenarioInput,
  SimulationResult,
  SimulatorData,
} from '../types/simulator.types';

// ──────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────

export const MOCK_BASELINE: SimulatorData = {
  baseline: {
    footprintKg: 92,
    sustainabilityScore: 82,
    forecastScore: 85,
  },
  savedScenarios: [
    {
      id: 'saved-1',
      name: 'Metro Lifestyle',
      category: 'Transport',
      savedAt: new Date(Date.now() - 86400000).toISOString(),
      scoreImpact: 6,
      carbonReductionKg: 14,
      input: {
        category: 'Transport',
        params: [
          { id: 'car_trips', label: 'Car Trips Per Week', unit: 'trips', currentValue: 2, min: 0, max: 7, step: 1 },
        ],
      },
    },
    {
      id: 'saved-2',
      name: 'Plant-Based Week',
      category: 'Food',
      savedAt: new Date(Date.now() - 172800000).toISOString(),
      scoreImpact: 4,
      carbonReductionKg: 8,
      input: {
        category: 'Food',
        params: [
          { id: 'veg_meals', label: 'Vegetarian Meals Per Week', unit: 'meals', currentValue: 4, min: 0, max: 21, step: 1 },
        ],
      },
    },
  ],
};

/**
 * Deterministic impact calculation for mock simulation
 * (Backend Carbon Engine takes over in production)
 */
function calculateMockResult(input: ScenarioInput): SimulationResult {
  const baseline = MOCK_BASELINE.baseline;
  let carbonReductionKg = 0;
  let scoreIncrease = 0;

  const categoryMultipliers: Record<ScenarioCategory, number> = {
    Transport: 1.8,
    Food: 1.2,
    Energy: 1.5,
    Shopping: 0.9,
    Mixed: 1.4,
    GoalBased: 1.6,
  };

  input.params.forEach((p) => {
    const diff = p.currentValue - p.min; // lower values = better for most params
    const normalised = diff / (p.max - p.min);
    const multiplier = categoryMultipliers[input.category] ?? 1;
    // Inverse: lower current value → more reduction
    carbonReductionKg += (1 - normalised) * 14 * multiplier;
    scoreIncrease += (1 - normalised) * 8 * multiplier;
  });

  carbonReductionKg = Math.round(Math.min(carbonReductionKg, 30) * 10) / 10;
  scoreIncrease = Math.round(Math.min(scoreIncrease, 12));

  const explanations: Record<ScenarioCategory, { action: string; impact: string; recommendation: string }> = {
    Transport: {
      action: 'Switching your car trips to metro or cycling.',
      impact: `Could reduce your monthly footprint by approximately ${carbonReductionKg} kg CO₂.`,
      recommendation: 'Start with one metro day this week to build the habit.',
    },
    Food: {
      action: 'Choosing more plant-based meals.',
      impact: `Reduces diet-related emissions by approximately ${carbonReductionKg} kg CO₂/month.`,
      recommendation: 'Replace one meat meal this week with a plant-based alternative.',
    },
    Energy: {
      action: 'Reducing electricity consumption at home.',
      impact: `Saves approximately ${carbonReductionKg} kg CO₂ per billing cycle.`,
      recommendation: 'Unplug idle electronics and switch to LED bulbs first.',
    },
    Shopping: {
      action: 'Buying fewer new goods and preferring second-hand.',
      impact: `Avoids approximately ${carbonReductionKg} kg CO₂ in manufacturing emissions.`,
      recommendation: 'Before your next purchase, check a resale marketplace first.',
    },
    Mixed: {
      action: 'Making lifestyle changes across multiple categories.',
      impact: `Combined effect saves approximately ${carbonReductionKg} kg CO₂/month.`,
      recommendation: 'Pick one change per category and build momentum.',
    },
    GoalBased: {
      action: `Working towards your sustainability target.`,
      impact: `Could increase your score by ${scoreIncrease} points this month.`,
      recommendation: 'Focus on Transport and Food — they have the highest score leverage.',
    },
  };

  const exp = explanations[input.category];

  return {
    id: `sim-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    baseline,
    projected: {
      footprintKg: Math.max(60, baseline.footprintKg - carbonReductionKg),
      sustainabilityScore: Math.min(100, baseline.sustainabilityScore + scoreIncrease),
      forecastScore: Math.min(100, baseline.forecastScore + scoreIncrease),
    },
    impacts: [
      {
        label: 'Carbon Reduction',
        value: `-${carbonReductionKg} kg CO₂`,
        direction: 'positive',
      },
      {
        label: 'Score Increase',
        value: `+${scoreIncrease}`,
        direction: scoreIncrease > 0 ? 'positive' : 'neutral',
      },
      {
        label: 'Goal Progress',
        value: `+${Math.round(scoreIncrease * 1.5)}%`,
        direction: 'positive',
      },
      {
        label: 'Monthly Forecast',
        value: carbonReductionKg > 10 ? 'Improved' : 'Slightly Improved',
        direction: carbonReductionKg > 5 ? 'positive' : 'neutral',
      },
    ],
    aiExplanation: {
      action: exp.action,
      impact: exp.impact,
      recommendation: exp.recommendation,
      fullText: `${exp.action} ${exp.impact} ${exp.recommendation}`,
    },
    comparisons:
      input.category === 'Transport'
        ? [
            { id: 'c1', label: 'Metro', carbonImpactKg: 14, scoreImpact: 6, difficulty: 'Easy', impactLevel: 'High', rank: 1 },
            { id: 'c2', label: 'Carpool', carbonImpactKg: 8, scoreImpact: 3, difficulty: 'Easy', impactLevel: 'Medium', rank: 2 },
            { id: 'c3', label: 'Cycling', carbonImpactKg: 18, scoreImpact: 8, difficulty: 'Medium', impactLevel: 'High', rank: 3 },
          ]
        : input.category === 'Food'
        ? [
            { id: 'c1', label: 'Vegetarian', carbonImpactKg: 10, scoreImpact: 5, difficulty: 'Easy', impactLevel: 'High', rank: 1 },
            { id: 'c2', label: 'Vegan', carbonImpactKg: 15, scoreImpact: 7, difficulty: 'Medium', impactLevel: 'High', rank: 2 },
            { id: 'c3', label: 'Reduce Meat', carbonImpactKg: 6, scoreImpact: 3, difficulty: 'Easy', impactLevel: 'Medium', rank: 3 },
          ]
        : [],
  };
}

// ──────────────────────────────────────────────
// API Functions
// ──────────────────────────────────────────────

export const getSimulatorBaseline = async (): Promise<SimulatorData> => {
  try {
    const [baselineRes, savedRes] = await Promise.all([
      api.get<{ baseline: SimulatorData['baseline'] }>('/simulator/baseline'),
      api.get<SavedScenario[]>('/simulator/saved'),
    ]);
    return { baseline: baselineRes.data.baseline, savedScenarios: savedRes.data };
  } catch (error) {
    console.warn('GET /simulator/baseline failed, using mock data:', error);
    return MOCK_BASELINE;
  }
};

export const runSimulation = async (payload: RunSimulationPayload): Promise<SimulationResult> => {
  try {
    const response = await api.post<SimulationResult>('/simulator/run', payload);
    return response.data;
  } catch (error) {
    console.warn('POST /simulator/run failed, using deterministic mock:', error);
    return calculateMockResult(payload.input);
  }
};

export const saveScenario = async (
  name: string,
  input: ScenarioInput,
  result: SimulationResult,
): Promise<SavedScenario> => {
  const scoreImpact =
    result.projected.sustainabilityScore - result.baseline.sustainabilityScore;
  const carbonReductionKg =
    result.baseline.footprintKg - result.projected.footprintKg;

  const payload: Omit<SavedScenario, 'id'> = {
    name,
    category: input.category,
    savedAt: new Date().toISOString(),
    scoreImpact,
    carbonReductionKg,
    input,
  };

  try {
    const response = await api.post<SavedScenario>('/simulator/saved', payload);
    return response.data;
  } catch (error) {
    console.warn('POST /simulator/saved failed, returning local copy:', error);
    return { id: `local-${Date.now()}`, ...payload };
  }
};
