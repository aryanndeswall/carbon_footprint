import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ScenarioCategory, ScenarioPreset, ScenarioSliderParam } from '../types/simulator.types';
import { ScenarioCategorySelector } from './ScenarioCategorySelector';
import { ScenarioSlider } from './ScenarioSlider';

const PRESETS: Record<ScenarioCategory, ScenarioPreset[]> = {
  Transport: [
    { id: 'use-metro', label: 'Use Metro', category: 'Transport', overrides: { car_trips: 2, km_per_trip: 10 } },
    { id: 'carpool', label: 'Carpool', category: 'Transport', overrides: { car_trips: 3, km_per_trip: 15 } },
    { id: 'cycle', label: 'Cycle to Work', category: 'Transport', overrides: { car_trips: 0, km_per_trip: 0 } },
  ],
  Food: [
    { id: 'vegetarian', label: 'Vegetarian Lifestyle', category: 'Food', overrides: { veg_meals: 14, meat_meals: 0 } },
    { id: 'reduce-meat', label: 'Reduce Meat', category: 'Food', overrides: { veg_meals: 7, meat_meals: 5 } },
  ],
  Energy: [
    { id: 'reduce-10', label: 'Reduce by 10%', category: 'Energy', overrides: { electricity_kwh: 225, standby_hours: 5 } },
    { id: 'reduce-20', label: 'Reduce by 20%', category: 'Energy', overrides: { electricity_kwh: 200, standby_hours: 3 } },
  ],
  Shopping: [
    { id: 'second-hand', label: 'Buy Second-Hand', category: 'Shopping', overrides: { new_items: 0, online_orders: 2 } },
  ],
  Mixed: [
    { id: 'eco-week', label: 'Eco Week', category: 'Mixed', overrides: { car_trips: 1, veg_meals: 10, electricity_kwh: 200 } },
  ],
  GoalBased: [
    { id: 'score-90', label: 'Reach Score 90', category: 'GoalBased', overrides: { target_score: 90, timeline_weeks: 4 } },
    { id: 'footprint-15', label: 'Reduce by 15%', category: 'GoalBased', overrides: { target_score: 88, timeline_weeks: 6 } },
  ],
};

interface ScenarioBuilderProps {
  selectedCategory: ScenarioCategory;
  params: ScenarioSliderParam[];
  activePresetId?: string;
  onCategoryChange: (cat: ScenarioCategory) => void;
  onParamChange: (paramId: string, value: number) => void;
  onPresetSelect: (overrides: Record<string, number>, presetId: string) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export function ScenarioBuilder({
  selectedCategory,
  params,
  activePresetId,
  onCategoryChange,
  onParamChange,
  onPresetSelect,
  onRunSimulation,
  isRunning,
}: ScenarioBuilderProps) {
  const { colors } = useTheme();
  const presets = PRESETS[selectedCategory] ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text_primary }]}>Build Scenario</Text>

      {/* Category selector */}
      <ScenarioCategorySelector
        selected={selectedCategory}
        onSelect={onCategoryChange}
      />

      {/* Presets */}
      {presets.length > 0 && (
        <View style={styles.presetsBlock}>
          <Text style={[styles.presetsLabel, { color: colors.text_secondary }]}>Quick Presets</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => onPresetSelect(preset.overrides, preset.id)}
                  style={[
                    styles.presetChip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.primary + '1A',
                      borderColor: isActive ? colors.primary : colors.primary + '40',
                    },
                  ]}
                  accessibilityLabel={`Preset: ${preset.label}`}
                  accessibilityRole="button"
                >
                  <Text style={[styles.presetLabel, { color: isActive ? '#FFFFFF' : colors.primary }]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Sliders */}
      <View style={styles.slidersBlock}>
        {params.map((param) => (
          <ScenarioSlider
            key={param.id}
            param={param}
            onChange={(value) => onParamChange(param.id, value)}
          />
        ))}
      </View>

      {/* Run CTA */}
      <TouchableOpacity
        style={[styles.runButton, { backgroundColor: colors.primary, opacity: isRunning ? 0.7 : 1 }]}
        onPress={onRunSimulation}
        disabled={isRunning}
        accessibilityLabel="Run Simulation"
        accessibilityRole="button"
      >
        <Text style={styles.runButtonText}>
          {isRunning ? 'Simulating…' : '⚡ Run Simulation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  presetsBlock: {
    gap: 10,
  },
  presetsLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  presetsRow: {
    gap: 8,
    paddingRight: 8,
  },
  presetChip: {
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  presetLabel: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
  slidersBlock: {
    gap: 24,
  },
  runButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  runButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
