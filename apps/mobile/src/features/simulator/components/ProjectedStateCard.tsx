import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { BaselineState, ProjectedState } from '../types/simulator.types';

interface ProjectedStateCardProps {
  baseline: BaselineState;
  projected: ProjectedState;
}

function AnimatedNumber({
  from,
  to,
  suffix,
  color,
}: {
  from: number;
  to: number;
  suffix: string;
  color: string;
}) {
  const animValueRef = useRef<Animated.Value | null>(null);
  if (animValueRef.current === null) {
    animValueRef.current = new Animated.Value(from);
  }
  const displayRef = useRef(from);
  const [display, setDisplay] = React.useState(from);

  useEffect(() => {
    const anim = animValueRef.current;
    if (!anim) return;

    const listenerId = anim.addListener(({ value }) => {
      const rounded = Math.round(value * 10) / 10;
      if (rounded !== displayRef.current) {
        displayRef.current = rounded;
        setDisplay(rounded);
      }
    });

    Animated.timing(anim, {
      toValue: to,
      duration: 800,
      useNativeDriver: false,
    }).start();

    return () => anim.removeListener(listenerId);
  }, [to]);

  return (
    <Text style={[styles.metricValue, { color }]}>
      {display}
      <Text style={styles.suffix}>{suffix}</Text>
    </Text>
  );
}

export function ProjectedStateCard({ baseline, projected }: ProjectedStateCardProps) {
  const { colors } = useTheme();
  const scoreGain = projected.sustainabilityScore - baseline.sustainabilityScore;
  const footprintChange = projected.footprintKg - baseline.footprintKg;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary + '60',
          shadowColor: colors.primary,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.headerText, { color: colors.primary }]}>Projected State</Text>

        <View style={[styles.gainBadge, { backgroundColor: colors.primary + '1A' }]}>
          <Text style={[styles.gainText, { color: colors.primary }]}>
            {scoreGain >= 0 ? '+' : ''}
            {scoreGain} pts
          </Text>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <AnimatedNumber
            from={baseline.footprintKg}
            to={projected.footprintKg}
            suffix=" kg"
            color={colors.text_primary}
          />
          <Text style={[styles.metricUnit, { color: colors.text_secondary }]}>CO₂</Text>
          <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Footprint</Text>
          {footprintChange < 0 && (
            <Text style={[styles.delta, { color: '#22C55E' }]}>
              {footprintChange.toFixed(1)} kg
            </Text>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metric}>
          <AnimatedNumber
            from={baseline.sustainabilityScore}
            to={projected.sustainabilityScore}
            suffix=""
            color={colors.primary}
          />
          <Text style={[styles.metricUnit, { color: colors.text_secondary }]}>pts</Text>
          <Text style={[styles.metricLabel, { color: colors.text_secondary }]}>Score</Text>
          {scoreGain > 0 && (
            <Text style={[styles.delta, { color: '#22C55E' }]}>+{scoreGain}</Text>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metric}>
          <AnimatedNumber
            from={baseline.forecastScore}
            to={projected.forecastScore}
            suffix=""
            color={colors.text_primary}
          />
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
    borderWidth: 1.5,
    padding: 20,
    gap: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
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
    flex: 1,
  },
  gainBadge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  gainText: {
    fontSize: 12,
    fontFamily: 'Outfit',
    fontWeight: '700',
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
  suffix: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
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
  delta: {
    fontSize: 11,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 56,
    marginHorizontal: 12,
  },
});
