import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { ProgressRing } from '../../components/progress/ProgressRing';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Cloud, CloudOff, Compass, ArrowRight, Zap, Car, Utensils, ShoppingBag } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors, spacing, typography, roundness } = useTheme();
  const user = useAuthStore((state) => state.user);

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<number>(() => Date.now());
  const [offline, setOffline] = useState(false);
  
  // Mission skip state
  const [missionSkipped, setMissionSkipped] = useState(false);
  const [activitiesCount, setActivitiesCount] = useState(user?.activitiesLogged ?? 0);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API fetch delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastRefreshed(Date.now());
    setRefreshing(false);
  }, []);

  // 60-second Staleness Rule implementation
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const ageInSeconds = (now - lastRefreshed) / 1000;
      if (ageInSeconds > 60) {
        handleRefresh();
      }
    }, [lastRefreshed, handleRefresh])
  );

  // Mock score calculations: if activities logged = 0, score is 0 (forces Zero State)
  const isFirstRun = activitiesCount === 0;
  const scoreValue = isFirstRun ? 0 : 78;
  const dailyLimit = 5.0; // kg CO2
  const todayEmissions = isFirstRun ? 0 : 3.42;
  const progressRatio = todayEmissions / dailyLimit;

  const handleLogQuickActivity = (title: string) => {
    setActivitiesCount((prev) => prev + 1);
    router.push('/modals/activity-log');
  };

  return (
    <ScreenContainer
      scrollable
      contentContainerStyle={styles.scrollContent}
      style={{ backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <View style={[styles.inner, { padding: spacing.lg }]}>
        
        {/* Header Row: User Info & Sync Status */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
              WELCOME BACK
            </Text>
            <Text style={[typography.h2, { color: colors.text_primary }]}>
              {user?.name || 'Eco Warrior'}
            </Text>
          </View>
          <Pressable onPress={() => setOffline(!offline)} style={styles.syncStatus}>
            {offline ? (
              <CloudOff size={22} color={colors.error} />
            ) : (
              <Cloud size={22} color={colors.primary} />
            )}
          </Pressable>
        </View>

        {/* F-1: First-Run Onboarding Banner */}
        {isFirstRun && (
          <Card variant="interactive" style={[styles.firstRunCard, { borderColor: colors.primary }] as any}>
            <Text style={[typography.h3, { color: colors.primary_dim, marginBottom: 4 }]}>
              Welcome to Carbon Sense!
            </Text>
            <Text style={[typography.body, { color: colors.text_secondary, marginBottom: spacing.md }]}>
              {"Let's build healthy carbon habits. Start by reviewing your first custom daily mission."}
            </Text>
            <Pressable
              style={[styles.firstRunCTA, { backgroundColor: colors.primary, borderRadius: roundness.md }]}
              onPress={() => router.push('/(tabs)/missions')}
            >
              <Text style={[typography.bodyMedium, { color: '#FFFFFF' }]}>
                View First Mission
              </Text>
              <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </Pressable>
          </Card>
        )}

        {/* Hero Score & Ring Section */}
        <View style={styles.heroSection}>
          <ProgressRing
            progress={progressRatio}
            score={scoreValue}
            label="Sustainability Score"
            isZeroState={scoreValue === 0} // F-2: Unfilled dashed ring if score is 0
            size={190}
          />
          
          {/* F-2: Hide carbon statistics in Zero State */}
          {!isFirstRun && (
            <View style={styles.carbonStatsContainer}>
              <Text style={[typography.body, { color: colors.text_secondary }]}>
                {"Today's Footprint: "}
                <Text style={{ color: colors.text_primary, fontWeight: '700' }}>
                  {todayEmissions} kg CO₂
                </Text>{' '}
                / {dailyLimit} kg
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions Row */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            QUICK ACTIONS
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <Pressable
              onPress={() => handleLogQuickActivity('Metro')}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[typography.bodyMedium, { color: colors.text_primary }]}>🚇 Metro Ride</Text>
            </Pressable>
            <Pressable
              onPress={() => handleLogQuickActivity('Veg Meal')}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[typography.bodyMedium, { color: colors.text_primary }]}>🥗 Veggie Meal</Text>
            </Pressable>
            <Pressable
              onPress={() => handleLogQuickActivity('Lights Off')}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[typography.bodyMedium, { color: colors.text_primary }]}>💡 Off Lights</Text>
            </Pressable>
            
            {/* F-8: Simulate Quick Action Chip */}
            <Pressable
              onPress={() => router.push('/simulator')}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.simulation, borderWidth: 1 }]}
            >
              <Text style={[typography.bodyMedium, { color: colors.simulation, fontWeight: '700' }]}>
                🔮 Simulate
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Daily Mission Card Section */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            {"TODAY'S HIGHLIGHTED MISSION"}
          </Text>

          {/* F-5: Mission Skip Behavior */}
          {missionSkipped ? (
            <Card variant="default" style={styles.skippedCard}>
              <Text style={[typography.bodyMedium, { color: colors.text_secondary }]}>
                Mission Skipped for Today
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/missions')} style={styles.skippedLink}>
                <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '600' }]}>
                  See More Missions →
                </Text>
              </Pressable>
            </Card>
          ) : (
            <Card variant="interactive" style={styles.missionCard}>
              <View style={styles.missionCardHeader}>
                <Badge label="Transport" variant="info" />
                <Badge label="+10 Score" variant="streak" />
              </View>
              <Text style={[typography.h3, { color: colors.text_primary, marginVertical: spacing.xs }]}>
                Use Public Transport
              </Text>
              <Text style={[typography.body, { color: colors.text_secondary, marginBottom: spacing.md }]}>
                Swap a personal car trip for a train, bus, or metro ride today and save approx 2.1kg CO₂.
              </Text>
              <View style={styles.missionActions}>
                <Button
                  title="Log Transit"
                  onPress={() => handleLogQuickActivity('Metro')}
                  style={{ flex: 1, marginRight: 8, height: 40 }}
                />
                <Button
                  title="Skip"
                  variant="secondary"
                  onPress={() => setMissionSkipped(true)}
                  style={{ width: 80, height: 40 }}
                />
              </View>
            </Card>
          )}
        </View>

        {/* Category Breakdown 2x2 Grid */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            FOOTPRINT BREAKDOWN
          </Text>
          <View style={styles.grid}>
            <Card style={styles.gridCard}>
              <Car size={24} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.text_primary, marginTop: 8 }]}>Transport</Text>
              <Text style={[typography.body, { color: colors.text_secondary }]}>{isFirstRun ? '0' : '1.92'} kg</Text>
            </Card>
            <Card style={styles.gridCard}>
              <Utensils size={24} color={colors.warning} />
              <Text style={[typography.bodyMedium, { color: colors.text_primary, marginTop: 8 }]}>Food</Text>
              <Text style={[typography.body, { color: colors.text_secondary }]}>{isFirstRun ? '0' : '1.50'} kg</Text>
            </Card>
            <Card style={styles.gridCard}>
              <Zap size={24} color={colors.simulation} />
              <Text style={[typography.bodyMedium, { color: colors.text_primary, marginTop: 8 }]}>Energy</Text>
              <Text style={[typography.body, { color: colors.text_secondary }]}>0 kg</Text>
            </Card>
            <Card style={styles.gridCard}>
              <ShoppingBag size={24} color={colors.error} />
              <Text style={[typography.bodyMedium, { color: colors.text_primary, marginTop: 8 }]}>Shopping</Text>
              <Text style={[typography.body, { color: colors.text_secondary }]}>0 kg</Text>
            </Card>
          </View>
        </View>

      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 80,
  },
  inner: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  syncStatus: {
    padding: 8,
  },
  firstRunCard: {
    borderWidth: 2,
    marginBottom: 24,
    padding: 16,
  },
  firstRunCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  carbonStatsContainer: {
    marginTop: 16,
  },
  section: {
    marginBottom: 28,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  missionCard: {
    padding: 16,
  },
  missionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  missionActions: {
    flexDirection: 'row',
  },
  skippedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  skippedLink: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 16,
  },
});
