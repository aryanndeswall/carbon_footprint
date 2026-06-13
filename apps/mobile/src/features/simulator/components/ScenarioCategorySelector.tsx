import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ScenarioCategory } from '../types/simulator.types';

const CATEGORIES: { id: ScenarioCategory; label: string; emoji: string }[] = [
  { id: 'Transport', label: 'Transport', emoji: '🚌' },
  { id: 'Food', label: 'Food', emoji: '🥗' },
  { id: 'Energy', label: 'Energy', emoji: '⚡' },
  { id: 'Shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'Mixed', label: 'Lifestyle', emoji: '🌿' },
  { id: 'GoalBased', label: 'Goal', emoji: '🎯' },
];

interface ScenarioCategorySelectorProps {
  selected: ScenarioCategory;
  onSelect: (cat: ScenarioCategory) => void;
}

export function ScenarioCategorySelector({ selected, onSelect }: ScenarioCategorySelectorProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.background,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            accessibilityLabel={`Category: ${cat.label}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <Text style={[styles.label, { color: isActive ? '#FFFFFF' : colors.text_secondary }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
