import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  getSimulatorBaseline,
  runSimulation,
  saveScenario,
} from '../services/simulator.service';
import {
  ScenarioCategory,
  ScenarioInput,
  ScenarioSliderParam,
  SimulationResult,
} from '../types/simulator.types';

// ──────────────────────────────────────────────
// Query Keys
// ──────────────────────────────────────────────

export const SIMULATOR_KEYS = {
  baseline: ['simulator', 'baseline'] as const,
};

// ──────────────────────────────────────────────
// Default param sets per category
// ──────────────────────────────────────────────

const DEFAULT_PARAMS: Record<ScenarioCategory, ScenarioSliderParam[]> = {
  Transport: [
    { id: 'car_trips', label: 'Car Trips Per Week', unit: 'trips', currentValue: 5, min: 0, max: 7, step: 1 },
    { id: 'km_per_trip', label: 'Avg. Distance Per Trip', unit: 'km', currentValue: 15, min: 1, max: 50, step: 1 },
  ],
  Food: [
    { id: 'veg_meals', label: 'Vegetarian Meals Per Week', unit: 'meals', currentValue: 2, min: 0, max: 21, step: 1 },
    { id: 'meat_meals', label: 'Meat Meals Per Week', unit: 'meals', currentValue: 10, min: 0, max: 21, step: 1 },
  ],
  Energy: [
    { id: 'electricity_kwh', label: 'Monthly Electricity Usage', unit: 'kWh', currentValue: 250, min: 50, max: 600, step: 10 },
    { id: 'standby_hours', label: 'Daily Standby Device Hours', unit: 'hrs', currentValue: 8, min: 0, max: 24, step: 1 },
  ],
  Shopping: [
    { id: 'new_items', label: 'New Clothing Items / Month', unit: 'items', currentValue: 3, min: 0, max: 15, step: 1 },
    { id: 'online_orders', label: 'Online Orders / Month', unit: 'orders', currentValue: 6, min: 0, max: 30, step: 1 },
  ],
  Mixed: [
    { id: 'car_trips', label: 'Car Trips Per Week', unit: 'trips', currentValue: 5, min: 0, max: 7, step: 1 },
    { id: 'veg_meals', label: 'Vegetarian Meals Per Week', unit: 'meals', currentValue: 2, min: 0, max: 21, step: 1 },
    { id: 'electricity_kwh', label: 'Monthly Electricity Usage', unit: 'kWh', currentValue: 250, min: 50, max: 600, step: 10 },
  ],
  GoalBased: [
    { id: 'target_score', label: 'Target Score', unit: 'pts', currentValue: 90, min: 50, max: 100, step: 1 },
    { id: 'timeline_weeks', label: 'Timeline', unit: 'weeks', currentValue: 4, min: 1, max: 12, step: 1 },
  ],
};

// ──────────────────────────────────────────────
// Main hook
// ──────────────────────────────────────────────

export function useSimulatorData() {
  const queryClient = useQueryClient();

  // ── Baseline data ──
  const baselineQuery = useQuery({
    queryKey: SIMULATOR_KEYS.baseline,
    queryFn: getSimulatorBaseline,
    staleTime: 5 * 60 * 1000,
  });

  // ── Local scenario builder state ──
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory>('Transport');
  const [params, setParams] = useState<ScenarioSliderParam[]>(DEFAULT_PARAMS['Transport']);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [savedLocally, setSavedLocally] = useState<boolean>(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const selectCategory = useCallback((cat: ScenarioCategory) => {
    setSelectedCategory(cat);
    setParams(DEFAULT_PARAMS[cat]);
    setResult(null);
    setSavedLocally(false);
  }, []);

  const updateParam = useCallback((paramId: string, value: number) => {
    setParams((prev) =>
      prev.map((p) => (p.id === paramId ? { ...p, currentValue: value } : p)),
    );
    setResult(null); // invalidate result when params change
    setSavedLocally(false);
  }, []);

  const applyPreset = useCallback(
    (overrides: Record<string, number>) => {
      setParams((prev) =>
        prev.map((p) => (overrides[p.id] !== undefined ? { ...p, currentValue: overrides[p.id] } : p)),
      );
      setResult(null);
      setSavedLocally(false);
    },
    [],
  );

  // ── Run simulation mutation ──
  const runMutation = useMutation({
    mutationFn: () =>
      runSimulation({ input: { category: selectedCategory, params } }),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  // ── Save scenario mutation ──
  const saveMutation = useMutation({
    mutationFn: ({ name }: { name: string }) => {
      if (!result) return Promise.reject(new Error('No result to save'));
      return saveScenario(name, { category: selectedCategory, params }, result);
    },
    onSuccess: () => {
      setSavedLocally(true);
      queryClient.invalidateQueries({ queryKey: SIMULATOR_KEYS.baseline });
    },
  });

  const currentInput: ScenarioInput = { category: selectedCategory, params };

  const handleRunSimulation = useCallback(() => {
    runMutation.mutate();
  }, [runMutation]);

  return {
    // Data
    baseline: baselineQuery.data?.baseline,
    savedScenarios: baselineQuery.data?.savedScenarios ?? [],
    isLoadingBaseline: baselineQuery.isLoading,
    // Builder state
    selectedCategory,
    params,
    currentInput,
    result,
    savedLocally,
    helpVisible,
    setHelpVisible,
    // Actions
    selectCategory,
    updateParam,
    applyPreset,
    // Simulation
    runSimulation: handleRunSimulation,
    isRunning: runMutation.isPending,
    runError: runMutation.error,
    // Save
    saveScenario: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  };
}
