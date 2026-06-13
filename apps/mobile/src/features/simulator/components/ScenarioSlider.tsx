import React, { useCallback, useMemo, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ScenarioSliderParam } from '../types/simulator.types';

interface ScenarioSliderProps {
  param: ScenarioSliderParam;
  onChange: (value: number) => void;
}

/**
 * Custom slider using PanResponder — no extra packages required.
 */
export function ScenarioSlider({ param, onChange }: ScenarioSliderProps) {
  const { colors } = useTheme();
  const [trackWidth, setTrackWidth] = useState(1);

  const percentage = ((param.currentValue - param.min) / (param.max - param.min)) * 100;

  const getValueFromX = useCallback(
    (x: number): number => {
      const ratio = Math.min(Math.max(x / trackWidth, 0), 1);
      const rawValue = ratio * (param.max - param.min) + param.min;
      const stepped = Math.round(rawValue / param.step) * param.step;
      return Math.min(Math.max(stepped, param.min), param.max);
    },
    [trackWidth, param.max, param.min, param.step],
  );

  const panHandlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt: GestureResponderEvent) => {
          onChange(getValueFromX(evt.nativeEvent.locationX));
        },
        onPanResponderMove: (evt: GestureResponderEvent) => {
          onChange(getValueFromX(evt.nativeEvent.locationX));
        },
      }).panHandlers,
    [onChange, getValueFromX],
  );

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width || 1);
  }, []);

  return (
    <View
      style={styles.container}
      accessibilityRole="adjustable"
      accessibilityLabel={param.label}
      accessibilityValue={{ min: param.min, max: param.max, now: param.currentValue }}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text_primary }]}>{param.label}</Text>
        <View style={[styles.valueBadge, { backgroundColor: colors.primary + '1A' }]}>
          <Text style={[styles.valueText, { color: colors.primary }]}>
            {param.currentValue} {param.unit}
          </Text>
        </View>
      </View>

      {/* Interactive track */}
      <View
        style={[styles.trackContainer, { backgroundColor: colors.border }]}
        onLayout={onTrackLayout}
        {...panHandlers}
      >
        <View
          style={[styles.fill, { backgroundColor: colors.primary, width: `${percentage}%` }]}
        />
        <View
          style={[
            styles.thumb,
            { backgroundColor: colors.primary, left: `${percentage}%` as unknown as number },
          ]}
        />
      </View>

      <View style={styles.rangeRow}>
        <Text style={[styles.rangeText, { color: colors.text_secondary }]}>
          {param.min} {param.unit}
        </Text>
        <Text style={[styles.percentageText, { color: colors.text_secondary }]}>
          {Math.round(percentage)}%
        </Text>
        <Text style={[styles.rangeText, { color: colors.text_secondary }]}>
          {param.max} {param.unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 14, fontFamily: 'Inter', fontWeight: '500', flex: 1 },
  valueBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  valueText: { fontSize: 13, fontFamily: 'Outfit', fontWeight: '700' },
  trackContainer: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
    justifyContent: 'center',
    marginVertical: 10,
  },
  fill: { height: 6, borderRadius: 3, position: 'absolute', left: 0, top: 0 },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
    top: -8,
    marginLeft: -11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rangeText: { fontSize: 11, fontFamily: 'Inter', fontWeight: '400' },
  percentageText: { fontSize: 11, fontFamily: 'Inter', fontWeight: '500' },
});
