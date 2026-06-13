import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BaselineState } from '../types/simulator.types';

interface CurrentStateCardProps {
  baseline: BaselineState;
}

export function CurrentStateCard({ baseline }: CurrentStateCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: colors.text_secondary }]} />
        <Text style={[styles.headerText, { color: colors.text_secondary }]}>Current State</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text_primary }]}>
            {baseline.footprintKg}
          </Text>
          <Text style={[styles.metricUnit, { color: colors.text_secondary }]}>kg CO₂</Text>
          <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Footprint</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text_primary }]}>
            {baseline.sustainabilityScore}
          </Text>
          <Text style={[styles.metricUnit, { color: colors.text_secondary }]}>pts</Text>
          <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Score</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metric}>
          <Text style={[styles.metricValue, { color: colors.text_primary }]}>
            {baseline.forecastScore}
          </Text>
          <Text style={[styles.metricUnit, { color: colors.text_secondary }]}>pts</Text>
          <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Forecast</Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerText: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 32,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    marginTop: -2,
  },
  metricLabel: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '500',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 56,
    marginHorizontal: 12,
  },
});
