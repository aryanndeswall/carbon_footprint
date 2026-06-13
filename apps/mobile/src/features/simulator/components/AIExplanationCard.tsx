import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { AIExplanation } from '../types/simulator.types';

interface AIExplanationCardProps {
  explanation: AIExplanation;
}

export function AIExplanationCard({ explanation }: AIExplanationCardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: '#38BDF8' + '40',
        },
      ]}
    >
      {/* AI Badge */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: '#38BDF8' + '1A' }]}>
          <Text style={[styles.badgeIcon]}>✦</Text>
          <Text style={[styles.badgeText, { color: '#38BDF8' }]}>AI Explanation</Text>
        </View>
      </View>

      {/* Three-part structured explanation */}
      <View style={styles.block}>
        <Text style={[styles.blockLabel, { color: colors.text_secondary }]}>Action</Text>
        <Text style={[styles.blockText, { color: colors.text_primary }]}>{explanation.action}</Text>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View style={styles.block}>
        <Text style={[styles.blockLabel, { color: colors.text_secondary }]}>Impact</Text>
        <Text style={[styles.blockText, { color: colors.text_primary }]}>{explanation.impact}</Text>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View style={styles.block}>
        <Text style={[styles.blockLabel, { color: '#38BDF8' }]}>Recommendation</Text>
        <Text style={[styles.blockText, { color: colors.text_primary }]}>{explanation.recommendation}</Text>
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
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  badgeIcon: {
    fontSize: 12,
    color: '#38BDF8',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  block: {
    gap: 4,
  },
  blockLabel: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  blockText: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 22,
  },
  separator: {
    height: 1,
  },
});
