import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { SavedScenario, ScenarioCategory } from '../types/simulator.types';

const CATEGORY_EMOJIS: Record<ScenarioCategory, string> = {
  Transport: '🚌',
  Food: '🥗',
  Energy: '⚡',
  Shopping: '🛍️',
  Mixed: '🌿',
  GoalBased: '🎯',
};

function formatRelativeDate(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Saved Today';
  if (diffDays === 1) return 'Saved Yesterday';
  return `Saved ${diffDays} days ago`;
}

interface SavedScenarioCardProps {
  scenario: SavedScenario;
}

export function SavedScenarioCard({ scenario }: SavedScenarioCardProps) {
  const { colors } = useTheme();
  const emoji = CATEGORY_EMOJIS[scenario.category];
  const isPositive = scenario.scoreImpact >= 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '1A' }]}>
        <Text style={styles.icon}>{emoji}</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.text_primary }]}>{scenario.name}</Text>
        <Text style={[styles.date, { color: colors.text_secondary }]}>
          {formatRelativeDate(scenario.savedAt)}
        </Text>
      </View>

      <View style={styles.metrics}>
        <Text style={[styles.metricMain, { color: isPositive ? '#22C55E' : '#F97316' }]}>
          {isPositive ? '+' : ''}
          {scenario.scoreImpact} pts
        </Text>
        <Text style={[styles.metricSub, { color: colors.text_secondary }]}>
          -{scenario.carbonReductionKg} kg CO₂
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Outfit',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  metrics: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metricMain: {
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  metricSub: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
});
