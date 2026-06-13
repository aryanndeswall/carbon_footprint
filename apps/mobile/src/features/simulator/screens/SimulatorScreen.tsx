import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { AIExplanationCard } from '../components/AIExplanationCard';
import { ComparisonCard } from '../components/ComparisonCard';
import { CurrentStateCard } from '../components/CurrentStateCard';
import { HelpBottomSheet } from '../components/HelpBottomSheet';
import { ImpactSummaryCard } from '../components/ImpactSummaryCard';
import { PostSimulationCTABar } from '../components/PostSimulationCTABar';
import { ProjectedStateCard } from '../components/ProjectedStateCard';
import { SavedScenarioCard } from '../components/SavedScenarioCard';
import { ScenarioBuilder } from '../components/ScenarioBuilder';
import { SimulatorHero } from '../components/SimulatorHero';
import { SimulatorSkeleton } from '../components/SimulatorSkeleton';
import { useSimulatorData } from '../hooks/useSimulatorData';

export function SimulatorScreen() {
  const { colors } = useTheme();

  const {
    baseline,
    savedScenarios,
    isLoadingBaseline,
    selectedCategory,
    params,
    result,
    savedLocally,
    helpVisible,
    setHelpVisible,
    selectCategory,
    updateParam,
    applyPreset,
    runSimulation,
    isRunning,
    runError,
    saveScenario,
    isSaving,
  } = useSimulatorData();

  // Active preset tracking (local to screen)
  const [activePresetId, setActivePresetId] = useState<string | undefined>(undefined);

  const handlePresetSelect = useCallback(
    (overrides: Record<string, number>, presetId: string) => {
      applyPreset(overrides);
      setActivePresetId(presetId);
    },
    [applyPreset],
  );

  const handleCategoryChange = useCallback(
    (cat: typeof selectedCategory) => {
      selectCategory(cat);
      setActivePresetId(undefined);
    },
    [selectCategory],
  );

  const handleSaveScenario = useCallback(() => {
    const defaultName = `${selectedCategory} Scenario`;
    Alert.alert(
      'Save Scenario',
      `Save as "${defaultName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => saveScenario({ name: defaultName }),
        },
      ],
    );
  }, [saveScenario, selectedCategory]);

  const handleLogActivity = useCallback(() => {
    router.push('/modals/activity-log');
  }, []);

  // ── Loading state ──
  if (isLoadingBaseline || !baseline) {
    return <SimulatorSkeleton />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        // Extra bottom padding for sticky CTA bar
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header */}
        <SimulatorHero onHelpPress={() => setHelpVisible(true)} />

        {/* Current State (always visible) */}
        <CurrentStateCard baseline={baseline} />

        {/* Scenario Builder */}
        <View style={styles.gap} />
        <ScenarioBuilder
          selectedCategory={selectedCategory}
          params={params}
          activePresetId={activePresetId}
          onCategoryChange={handleCategoryChange}
          onParamChange={updateParam}
          onPresetSelect={handlePresetSelect}
          onRunSimulation={runSimulation}
          isRunning={isRunning}
        />

        {/* Error state */}
        {runError && (
          <View style={[styles.errorBanner, { backgroundColor: '#EF444420', borderColor: '#EF4444' }]}>
            <Text style={styles.errorText}>Unable to generate simulation.</Text>
            <TouchableOpacity onPress={runSimulation} accessibilityRole="button">
              <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Simulation Results */}
        {result && (
          <>
            <View style={styles.gap} />
            <ProjectedStateCard baseline={result.baseline} projected={result.projected} />

            <View style={styles.gap} />
            <ImpactSummaryCard impacts={result.impacts} />

            <View style={styles.gap} />
            <AIExplanationCard explanation={result.aiExplanation} />

            {result.comparisons.length > 0 && (
              <>
                <View style={styles.gap} />
                <ComparisonCard comparisons={result.comparisons} />
              </>
            )}
          </>
        )}

        {/* Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <View style={styles.savedSection}>
            <Text style={[styles.savedTitle, { color: colors.text_primary }]}>Saved Scenarios</Text>
            <View style={styles.savedList}>
              {savedScenarios.map((scenario) => (
                <SavedScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </View>
          </View>
        )}

        {/* Empty state */}
        {savedScenarios.length === 0 && !result && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔮</Text>
            <Text style={[styles.emptyTitle, { color: colors.text_primary }]}>
              Create your first scenario
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.text_secondary }]}>
              Explore future outcomes before making a change.
            </Text>
          </View>
        )}

        {/* Bottom padding for sticky CTA */}
        {result && <View style={styles.ctaPadding} />}
      </ScrollView>

      {/* Sticky Post-Simulation CTA Bar */}
      {result && (
        <PostSimulationCTABar
          onSave={handleSaveScenario}
          onLogActivity={handleLogActivity}
          isSaving={isSaving}
          isSaved={savedLocally}
        />
      )}

      {/* Help Bottom Sheet */}
      <HelpBottomSheet visible={helpVisible} onClose={() => setHelpVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  gap: {
    height: 16,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#EF4444',
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Outfit',
    fontWeight: '600',
  },
  savedSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 12,
  },
  savedTitle: {
    fontSize: 18,
    fontFamily: 'Outfit',
    fontWeight: '700',
  },
  savedList: {
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Outfit',
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaPadding: {
    height: 96,
  },
});
