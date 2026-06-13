import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/layout/BottomSheet';
import { ChevronLeft, HelpCircle, Save, CheckCircle, RefreshCw } from 'lucide-react-native';

export default function SimulatorScreen() {
  const router = useRouter();
  const { colors, spacing, typography, roundness } = useTheme();
  const { width } = useWindowDimensions();

  // States
  const [helpVisible, setHelpVisible] = useState(false);
  const [simulationRun, setSimulationRun] = useState(false);
  const [savedScenario, setSavedScenario] = useState(false);
  
  // Slider simulated values
  const [transitSlider, setTransitSlider] = useState(30); // km public transport
  const [meatFreeMeals, setMeatFreeMeals] = useState(3); // count

  // Preset chips (Required by spec)
  const presets = [
    { label: 'Use Metro 🚇', transit: 50, meals: 3 },
    { label: 'Cycle to Work 🚲', transit: 20, meals: 3 },
    { label: 'Veggie Day 🥦', transit: 30, meals: 7 },
  ];

  const applyPreset = (transit: number, meals: number) => {
    setTransitSlider(transit);
    setMeatFreeMeals(meals);
    setSimulationRun(true);
  };

  // Auto-show tutorial on first visit (mocked)
  useEffect(() => {
    const timer = setTimeout(() => {
      setHelpVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveScenario = () => {
    setSavedScenario(true);
    // Simulate save timeout
    setTimeout(() => {
      setSavedScenario(false);
    }, 2000);
  };

  const handleLogActivity = () => {
    // Navigates to activity log modal pre-seeded with Transport or Food
    router.push(`/modals/activity-log?category=Transport&quantity=${transitSlider}`);
  };

  // Visual variables
  const currentScore = 78;
  const projectedScore = currentScore + Math.floor(transitSlider / 10) + meatFreeMeals;
  const currentCarbon = 3.42;
  const projectedCarbon = Math.max(1.1, currentCarbon - (transitSlider * 0.05) - (meatFreeMeals * 0.15));

  // Determine layout: stack comparison cards vertically if viewport width is narrow (< 360px)
  const isNarrowViewport = width < 360;

  return (
    <ScreenContainer style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.md }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.text_primary} />
          </Pressable>
          <Text style={[typography.h2, { color: colors.text_primary, marginLeft: 8 }]}>
            What-If Simulator
          </Text>
        </View>
        <Pressable onPress={() => setHelpVisible(true)} style={styles.helpBtn}>
          <HelpCircle size={24} color={colors.text_primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ padding: spacing.lg }}>
          
          {/* Preset Choices Section */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
              PRESET SCENARIOS
            </Text>
            <View style={styles.presetsRow}>
              {presets.map((preset, index) => (
                <Pressable
                  key={index}
                  onPress={() => applyPreset(preset.transit, preset.meals)}
                  style={[
                    styles.presetChip,
                    {
                      borderColor: colors.simulation,
                      backgroundColor: colors.surface,
                      borderRadius: roundness.md,
                    },
                  ]}
                >
                  <Text style={[typography.caption, { color: colors.text_primary, fontWeight: '600' }]}>
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Scenario Builder / Inputs */}
          <View style={styles.section}>
            <Card variant="outlined" style={styles.builderCard}>
              <Text style={[typography.h3, { color: colors.text_primary, marginBottom: spacing.md }]}>
                Scenario Settings
              </Text>
              
              {/* Transit Slider */}
              <View style={styles.inputContainer}>
                <Text style={[typography.bodyMedium, { color: colors.text_primary }]}>
                  Weekly Public Transit Distance: {transitSlider} km
                </Text>
                {/* Simulated Custom Slider */}
                <View style={styles.sliderTrackWrapper}>
                  <Pressable
                    onPress={() => {
                      setTransitSlider((prev) => (prev >= 60 ? 10 : prev + 10));
                      setSimulationRun(true);
                    }}
                    style={[styles.sliderTrack, { backgroundColor: colors.border }]}
                  >
                    <View
                      style={[
                        styles.sliderFill,
                        {
                          width: `${(transitSlider / 60) * 100}%`,
                          backgroundColor: colors.simulation, // Simulation Blue
                        },
                      ]}
                    />
                  </Pressable>
                </View>
                <Text style={[typography.caption, { color: colors.text_secondary }]}>
                  Tap slider track to adjust transit distance.
                </Text>
              </View>

              {/* Meals Selector */}
              <View style={styles.inputContainer}>
                <Text style={[typography.bodyMedium, { color: colors.text_primary }]}>
                  Weekly Meat-Free Meals: {meatFreeMeals} meals
                </Text>
                <View style={styles.counterRow}>
                  <Button
                    title="-"
                    variant="secondary"
                    onPress={() => {
                      setMeatFreeMeals((prev) => Math.max(0, prev - 1));
                      setSimulationRun(true);
                    }}
                    style={styles.counterBtn}
                  />
                  <Text style={[typography.h3, { color: colors.text_primary, marginHorizontal: 16 }]}>
                    {meatFreeMeals}
                  </Text>
                  <Button
                    title="+"
                    variant="secondary"
                    onPress={() => {
                      setMeatFreeMeals((prev) => Math.min(21, prev + 1));
                      setSimulationRun(true);
                    }}
                    style={styles.counterBtn}
                  />
                </View>
              </View>
            </Card>
          </View>

          {/* Simulation Results (Current vs Projected) */}
          {simulationRun && (
            <View style={styles.section}>
              <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
                PROJECTED OUTCOMES
              </Text>

              <View style={[styles.comparisonWrapper, isNarrowViewport && styles.comparisonVertical]}>
                
                {/* Current Card */}
                <Card variant="outlined" style={[styles.compareCard, { borderColor: colors.border }] as any}>
                  <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
                    CURRENT
                  </Text>
                  <Text style={[typography.h1, { color: colors.text_primary, marginVertical: 4 }]}>
                    {currentScore}
                  </Text>
                  <Text style={[typography.caption, { color: colors.text_secondary }]}>
                    {currentCarbon.toFixed(2)} kg CO₂/day
                  </Text>
                </Card>

                {/* Projected Card */}
                <Card variant="outlined" style={[styles.compareCard, { borderColor: colors.primary }] as any}>
                  <Text style={[typography.caption, { color: colors.primary_dim, fontWeight: '600' }]}>
                    PROJECTED
                  </Text>
                  <Text style={[typography.h1, { color: colors.primary, marginVertical: 4 }]}>
                    {projectedScore}
                  </Text>
                  <Text style={[typography.caption, { color: colors.success_text, fontWeight: '600' }]}>
                    {projectedCarbon.toFixed(2)} kg CO₂/day
                  </Text>
                </Card>

              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* F-9: Sticky Post-Simulation CTA Bar */}
      {simulationRun && (
        <View style={[styles.ctaBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Button
            title={savedScenario ? "✓ Saved" : "💾 Save Scenario"}
            variant="secondary"
            onPress={handleSaveScenario}
            style={styles.ctaButton}
            textStyle={savedScenario ? { color: colors.success_text } : undefined}
          />
          <Button
            title="✅ Log Activity"
            onPress={handleLogActivity}
            style={styles.ctaButton}
          />
        </View>
      )}

      {/* P2: Help Bottom Sheet Tutorial */}
      <BottomSheet
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        title="How It Works"
      >
        <View style={styles.helpContent}>
          <Text style={[typography.body, { color: colors.text_primary, marginBottom: spacing.md }]}>
            Follow these simple steps to simulate your potential climate footprint reduction:
          </Text>
          <View style={styles.helpStep}>
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '700' }]}>1. Choose a Preset</Text>
            <Text style={[typography.caption, { color: colors.text_secondary }]}>Or select custom sliders below to build a hypothetical scenario.</Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '700' }]}>2. Adjust Custom Sliders</Text>
            <Text style={[typography.caption, { color: colors.text_secondary }]}>Alter your transit distance or food preferences dynamically.</Text>
          </View>
          <View style={styles.helpStep}>
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '700' }]}>3. Compare Outcomes</Text>
            <Text style={[typography.caption, { color: colors.text_secondary }]}>Review your Sustainability Score improvement and carbon savings estimates side-by-side.</Text>
          </View>
          <Button title="Got It" onPress={() => setHelpVisible(false)} style={{ marginTop: spacing.md }} />
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 4,
  },
  helpBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 120, // clearance for sticky CTA bar
  },
  section: {
    marginBottom: 24,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  builderCard: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  sliderTrackWrapper: {
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  counterBtn: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonWrapper: {
    flexDirection: 'row',
    gap: 12,
  },
  comparisonVertical: {
    flexDirection: 'column',
  },
  compareCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  ctaButton: {
    flex: 1,
    height: 44,
  },
  helpContent: {
    paddingBottom: 20,
  },
  helpStep: {
    marginBottom: 12,
  },
});
