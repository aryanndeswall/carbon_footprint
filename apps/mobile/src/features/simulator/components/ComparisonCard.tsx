import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ComparisonOption, DifficultyLevel, ImpactLevel } from '../types/simulator.types';

const IMPACT_COLORS: Record<ImpactLevel, string> = {
  High: '#22C55E',
  Medium: '#38BDF8',
  Low: '#F97316',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  Easy: '●',
  Medium: '●●',
  Hard: '●●●',
};

interface ComparisonCardProps {
  comparisons: ComparisonOption[];
}

export function ComparisonCard({ comparisons }: ComparisonCardProps) {
  const { colors } = useTheme();

  if (comparisons.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text_primary }]}>Compare Options</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {comparisons
          .sort((a, b) => b.carbonImpactKg - a.carbonImpactKg)
          .map((option) => {
            const impactColor = IMPACT_COLORS[option.impactLevel];
            return (
              <View
                key={option.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: impactColor + '0D',
                    borderColor: impactColor + '33',
                  },
                ]}
              >
                {option.rank === 1 && (
                  <View style={[styles.topBadge, { backgroundColor: impactColor }]}>
                    <Text style={styles.topBadgeText}>Best</Text>
                  </View>
                )}

                <Text style={[styles.cardTitle, { color: colors.text_primary }]}>{option.label}</Text>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Carbon</Text>
                  <Text style={[styles.metricValue, { color: impactColor }]}>
                    -{option.carbonImpactKg} kg
                  </Text>
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Score</Text>
                  <Text style={[styles.metricValue, { color: colors.primary }]}>
                    +{option.scoreImpact}
                  </Text>
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Effort</Text>
                  <Text style={[styles.difficultyDots, { color: colors.text_secondary }]}>
                    {DIFFICULTY_LABELS[option.difficulty]}
                  </Text>
                </View>

                <View style={[styles.impactChip, { backgroundColor: impactColor + '1A' }]}>
                  <Text style={[styles.impactChipText, { color: impactColor }]}>
                    {option.impactLevel} Impact
                  </Text>
                </View>
              </View>
            );
          })}
      </ScrollView>
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
  row: {
    gap: 12,
    paddingRight: 4,
  },
  card: {
    width: 160,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  topBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  topBadgeText: {
    fontSize: 10,
    fontFamily: 'Outfit',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  metricValue: {
    fontSize: 13,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  difficultyDots: {
    fontSize: 10,
    letterSpacing: 2,
  },
  impactChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 4,
  },
  impactChipText: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
});
