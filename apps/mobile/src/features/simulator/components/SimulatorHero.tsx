import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface SimulatorHeroProps {
  onHelpPress: () => void;
}

export function SimulatorHero({ onHelpPress }: SimulatorHeroProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: colors.text_secondary }]}>
          CARBON SENSE
        </Text>
        <Text style={[styles.title, { color: colors.text_primary }]}>
          What-If Simulator
        </Text>
        <Text style={[styles.subtitle, { color: colors.text_secondary }]}>
          Explore Future Outcomes
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.helpButton, { backgroundColor: colors.primary + '1A', borderColor: colors.primary + '33' }]}
        onPress={onHelpPress}
        accessibilityLabel="How It Works"
        accessibilityRole="button"
      >
        <Text style={[styles.helpIcon, { color: colors.primary }]}>?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  textBlock: {
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit',
    fontWeight: '700',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: {
    fontSize: 18,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
});
