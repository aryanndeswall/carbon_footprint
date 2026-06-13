import React, { useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Text, Modal } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useMissionsData, useCompleteMissionMutation } from '../hooks/useMissionsData';
import { MissionHero } from '../components/MissionHero';
import { DailyMissionCard } from '../components/DailyMissionCard';
import { WeeklyMissionCard } from '../components/WeeklyMissionCard';
import { CompletedMissionCard } from '../components/CompletedMissionCard';
import { AchievementPreview } from '../components/AchievementPreview';
import { Sparkles, Flame, CheckCircle } from 'lucide-react-native';

export const MissionsScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const params = useLocalSearchParams();

  // Route highlighted state (F-3 first-run arrivals)
  const isFirstArrival = params.highlight === 'first';
  const [showTutorialHighlight, setShowTutorialHighlight] = useState(isFirstArrival);

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(() => Date.now());
  const [celebrationData, setCelebrationData] = useState<{
    visible: boolean;
    title: string;
    scoreReward: number;
  } | null>(null);

  // Queries & Mutations
  const { data, isLoading, isError, refetch, invalidateMissions } = useMissionsData();
  const completeMutation = useCompleteMissionMutation();

  // Staleness detection
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const ageInSeconds = (now - lastRefreshedAt) / 1000;
      if (ageInSeconds > 60) {
        invalidateMissions();
        setLastRefreshedAt(now);
      }
    }, [lastRefreshedAt, invalidateMissions])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      setLastRefreshedAt(Date.now());
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleCTAAction = async (id: string, currentStatus: string) => {
    // If not started yet, mark as in_progress (locally for demo/mock)
    if (currentStatus === 'available') {
      // In a real app we'd trigger a start mutation.
      // For MVP, we can simulate progress and refetch.
      await refetch();
    } else if (currentStatus === 'in_progress') {
      // Complete Mission with optimistic updates
      try {
        const targetMission = data?.dailyMissions.find((m) => m.id === id);
        
        // Trigger completion mutation
        await completeMutation.mutateAsync(id);

        // Turn off highlight if active
        setShowTutorialHighlight(false);

        // Trigger celebration popup
        setCelebrationData({
          visible: true,
          title: targetMission?.title || 'Daily Action',
          scoreReward: targetMission?.rewardScore || 3,
        });
      } catch (err) {
        console.error('Failed to complete mission', err);
      }
    }
  };

  const closeCelebration = () => {
    setCelebrationData(null);
  };

  if (isLoading) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={[styles.skeletonContainer, { padding: spacing.lg }]}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="card" height={130} />
          <Skeleton variant="text" width="40%" style={{ marginTop: 12 }} />
          <Skeleton variant="card" height={100} />
          <Skeleton variant="card" height={100} />
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={styles.errorContainer}>
          <ErrorState
            message="Unable to load missions list. Please check your network connection and retry."
            onRetry={() => { refetch(); }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <ScreenContainer
        scrollable
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          
          {/* Header titles */}
          <View style={styles.header}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
              DAILY HABIT LOOP
            </Text>
            <Text style={[typography.h2, { color: colors.text_primary }]}>
              {`Missions`}
            </Text>
            <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4 }]}>
              {`${data.progress.completedCount} of ${data.progress.totalCount} Completed Today`}
            </Text>
          </View>

          {/* 1. Progress Hero Banner */}
          <MissionHero progress={data.progress} />

          {/* 2. Daily Missions List */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
              DAILY ACTIONS
            </Text>
            <View style={styles.listContainer}>
              {data.dailyMissions.map((mission, index) => {
                // Highlight only the first available card if firstArrival is triggered
                const shouldHighlight = index === 0 && showTutorialHighlight && mission.status !== 'completed';
                return (
                  <DailyMissionCard
                    key={mission.id}
                    mission={mission}
                    isHighlighted={shouldHighlight}
                    onPressCTA={handleCTAAction}
                  />
                );
              })}
            </View>
          </View>

          {/* 3. Weekly Missions List */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
              WEEKLY MILESTONES
            </Text>
            <View style={styles.listContainer}>
              {data.weeklyMissions.map((weekly) => (
                <WeeklyMissionCard key={weekly.id} mission={weekly} />
              ))}
            </View>
          </View>

          {/* 4. Achievement Preview */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
              RETENTION ROAD
            </Text>
            <AchievementPreview achievement={data.achievements} />
          </View>

          {/* 5. Completed Missions list */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
              RECENTLY COMPLETED
            </Text>
            <View style={styles.listContainer}>
              {data.completedMissions.map((comp) => (
                <CompletedMissionCard key={comp.id} completed={comp} />
              ))}
            </View>
          </View>

        </View>
      </ScreenContainer>

      {/* Completion Celebration Overlay Popup Modal */}
      {celebrationData && (
        <Modal
          animationType="fade"
          transparent
          visible={celebrationData.visible}
          onRequestClose={closeCelebration}
        >
          <View style={styles.modalOverlay}>
            <Card variant="elevated" style={[styles.celebrationCard, { backgroundColor: colors.surface }] as any}>
              <View style={styles.celebrationIconRow}>
                <Sparkles size={48} color={colors.primary} />
              </View>
              <Text style={[typography.h2, { color: colors.primary_dim, textAlign: 'center', marginTop: spacing.md }]}>
                🎉 Mission Complete!
              </Text>
              <Text style={[typography.body, { color: colors.text_primary, textAlign: 'center', marginVertical: spacing.sm }]}>
                {`You successfully logged:\n"${celebrationData.title}"`}
              </Text>

              {/* Award Details grid */}
              <View style={[styles.awardGrid, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                <View style={styles.awardItem}>
                  <Flame size={20} color={colors.streak} />
                  <Text style={[typography.bodyMedium, { color: colors.streak, fontWeight: '700', marginTop: 4 }]}>
                    +{celebrationData.scoreReward} Score
                  </Text>
                  <Text style={[typography.caption, { color: colors.text_secondary }]}>Sustainability</Text>
                </View>

                <View style={styles.awardItem}>
                  <CheckCircle size={20} color={colors.primary} />
                  <Text style={[typography.bodyMedium, { color: colors.primary_dim, fontWeight: '700', marginTop: 4 }]}>
                    +1 Daily Log
                  </Text>
                  <Text style={[typography.caption, { color: colors.text_secondary }]}>Habit Loop</Text>
                </View>
              </View>

              <Button
                title="Awesome!"
                onPress={closeCelebration}
                style={StyleSheet.flatten([styles.celebrationCTA, { backgroundColor: colors.primary }])}
              />
            </Card>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 4,
  },
  section: {
    width: '100%',
  },
  listContainer: {
    gap: 12,
  },
  skeletonContainer: {
    gap: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  celebrationCard: {
    width: '90%',
    maxWidth: 340,
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  celebrationIconRow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  awardGrid: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 16,
    justifyContent: 'space-around',
  },
  awardItem: {
    alignItems: 'center',
  },
  celebrationCTA: {
    width: '100%',
    height: 44,
  },
});
