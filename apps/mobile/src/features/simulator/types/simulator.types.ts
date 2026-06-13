export type ScenarioCategory =
  | 'Transport'
  | 'Food'
  | 'Energy'
  | 'Shopping'
  | 'Mixed'
  | 'GoalBased';

export type ImpactLevel = 'High' | 'Medium' | 'Low';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type ImpactDirection = 'positive' | 'neutral' | 'negative';

// ──────────────────────────────────────────────
// Scenario Builder
// ──────────────────────────────────────────────

export interface ScenarioSliderParam {
  id: string;
  label: string;
  unit: string;
  currentValue: number;
  min: number;
  max: number;
  step: number;
}

export interface ScenarioPreset {
  id: string;
  label: string;
  category: ScenarioCategory;
  /** Pre-filled parameter values keyed by param id */
  overrides: Record<string, number>;
}

export interface ScenarioInput {
  category: ScenarioCategory;
  params: ScenarioSliderParam[];
  /** Active preset id if one was selected */
  presetId?: string;
}

// ──────────────────────────────────────────────
// Simulation Results
// ──────────────────────────────────────────────

export interface BaselineState {
  footprintKg: number;
  sustainabilityScore: number;
  forecastScore: number;
}

export interface ProjectedState {
  footprintKg: number;
  sustainabilityScore: number;
  forecastScore: number;
}

export interface ImpactMetric {
  label: string;
  value: string;
  direction: ImpactDirection;
}

export interface AIExplanation {
  action: string;
  impact: string;
  recommendation: string;
  fullText: string;
}

export interface ComparisonOption {
  id: string;
  label: string;
  carbonImpactKg: number;
  scoreImpact: number;
  difficulty: DifficultyLevel;
  impactLevel: ImpactLevel;
  rank: number;
}

export interface SimulationResult {
  id: string;
  generatedAt: string;
  baseline: BaselineState;
  projected: ProjectedState;
  impacts: ImpactMetric[];
  aiExplanation: AIExplanation;
  comparisons: ComparisonOption[];
}

// ──────────────────────────────────────────────
// Saved Scenarios
// ──────────────────────────────────────────────

export interface SavedScenario {
  id: string;
  name: string;
  category: ScenarioCategory;
  savedAt: string; // ISO string
  scoreImpact: number;
  carbonReductionKg: number;
  input: ScenarioInput;
}

// ──────────────────────────────────────────────
// API payloads
// ──────────────────────────────────────────────

export interface RunSimulationPayload {
  input: ScenarioInput;
}

export interface SimulatorData {
  baseline: BaselineState;
  savedScenarios: SavedScenario[];
}
