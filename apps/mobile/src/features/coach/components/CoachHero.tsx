import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const CoachHero: React.FC = () => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.md }]}>
      <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
        INTELLIGENCE
      </Text>
      <Text style={[typography.h2, { color: colors.text_primary, marginTop: spacing.xs }]}>
        AI Carbon Coach
      </Text>
      <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 2 }]}>
        Personal Sustainability Mentor
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
