import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboarded, setUserProfile, user } = useAuthStore();
  const { colors, spacing, typography, roundness } = useTheme();

  const [diet, setDiet] = useState('vegetarian');
  const [transport, setTransport] = useState('metro');
  const [housing, setHousing] = useState('apartment');
  const [stateCode, setStateCode] = useState('DL');

  const diets = [
    { key: 'vegetarian', label: 'Vegetarian 🥦' },
    { key: 'vegan', label: 'Vegan 🌱' },
    { key: 'omnivore', label: 'Omnivore 🥩' },
  ];

  const transports = [
    { key: 'metro', label: 'Metro/Train 🚇' },
    { key: 'cycle', label: 'Cycle/Walk 🚲' },
    { key: 'bus', label: 'Bus 🚌' },
    { key: 'car', label: 'Personal Car 🚗' },
  ];

  const housings = [
    { key: 'apartment', label: 'Apartment 🏢' },
    { key: 'house', label: 'Detached House 🏡' },
  ];

  const handleComplete = () => {
    setUserProfile({
      diet_type: diet,
      transport_preference: transport,
      state_code: stateCode,
      activitiesLogged: 1, // mark as complete
    });
    setOnboarded(true);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <ScreenContainer scrollable>
      <View style={[styles.inner, { padding: spacing.lg }]}>
        <View style={styles.header}>
          <Text style={[typography.h2, { color: colors.text_primary, marginBottom: spacing.xs }]}>
            Personalize Carbon Sense
          </Text>
          <Text style={[typography.body, { color: colors.text_secondary, marginBottom: spacing.lg }]}>
            Help us tailor your daily missions and calculations to your lifestyle.
          </Text>
        </View>

        {/* Diet Selection */}
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
          <Text style={[typography.bodyMedium, { color: colors.text_primary, marginBottom: spacing.sm }]}>
            What is your primary diet?
          </Text>
          <View style={styles.chipRow}>
            {diets.map((item) => {
              const selected = diet === item.key;
              return (
                <Card
                  key={item.key}
                  variant={selected ? 'interactive' : 'outlined'}
                  radiusSize="md"
                  onPress={() => setDiet(item.key)}
                  accessibilityLabel={`Diet preference: ${item.label}`}
                  style={[
                    styles.chipCard,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.success_container : colors.surface,
                    },
                  ] as any}
                >
                  <Text style={[typography.bodyMedium, { color: selected ? colors.primary_dim : colors.text_primary }]}>
                    {item.label}
                  </Text>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Transport Preference */}
        <View style={[styles.section, { marginBottom: spacing.lg }]}>
          <Text style={[typography.bodyMedium, { color: colors.text_primary, marginBottom: spacing.sm }]}>
            How do you usually commute?
          </Text>
          <View style={styles.chipRow}>
            {transports.map((item) => {
              const selected = transport === item.key;
              return (
                <Card
                  key={item.key}
                  variant={selected ? 'interactive' : 'outlined'}
                  radiusSize="md"
                  onPress={() => setTransport(item.key)}
                  accessibilityLabel={`Transportation preference: ${item.label}`}
                  style={[
                    styles.chipCard,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.success_container : colors.surface,
                    },
                  ] as any}
                >
                  <Text style={[typography.bodyMedium, { color: selected ? colors.primary_dim : colors.text_primary }]}>
                    {item.label}
                  </Text>
                </Card>
              );
            })}
          </View>
        </View>

        {/* Housing Selection */}
        <View style={[styles.section, { marginBottom: spacing.xl }]}>
          <Text style={[typography.bodyMedium, { color: colors.text_primary, marginBottom: spacing.sm }]}>
            What is your housing type?
          </Text>
          <View style={styles.chipRow}>
            {housings.map((item) => {
              const selected = housing === item.key;
              return (
                <Card
                  key={item.key}
                  variant={selected ? 'interactive' : 'outlined'}
                  radiusSize="md"
                  onPress={() => setHousing(item.key)}
                  accessibilityLabel={`Housing type: ${item.label}`}
                  style={[
                    styles.chipCard,
                    {
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.success_container : colors.surface,
                    },
                  ] as any}
                >
                  <Text style={[typography.bodyMedium, { color: selected ? colors.primary_dim : colors.text_primary }]}>
                    {item.label}
                  </Text>
                </Card>
              );
            })}
          </View>
        </View>

        <Button 
          title="Get Started" 
          onPress={handleComplete} 
          style={styles.submitBtn} 
          accessibilityLabel="Save preferences and get started"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingBottom: 40,
  },
  header: {
    marginTop: 20,
  },
  section: {
    width: '100%',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  submitBtn: {
    marginTop: 24,
  },
});
