import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ImpactDirection, ImpactMetric } from '../types/simulator.types';

const DIRECTION_COLORS: Record<ImpactDirection, string> = {
  positive: '#22C55E',
  neutral: '#38BDF8',
  negative: '#F97316',
};

interface ImpactSummaryCardProps {
  impacts: ImpactMetric[];
}

export function ImpactSummaryCard({ impacts }: ImpactSummaryCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text_primary }]}>Impact Summary</Text>

      <View style={styles.grid}>
        {impacts.map((impact) => {
          const impactColor = DIRECTION_COLORS[impact.direction];
          return (
            <View
              key={impact.label}
              style={[styles.card, { backgroundColor: impactColor + '12', borderColor: impactColor + '30' }]}
            >
              <Text style={[styles.cardValue, { color: impactColor }]}>{impact.value}</Text>
              <Text style={[styles.cardLabel, { color: colors.text_secondary }]}>{impact.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flex: 1,
    minWidth: '44%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  cardValue: {
    fontSize: 22,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
