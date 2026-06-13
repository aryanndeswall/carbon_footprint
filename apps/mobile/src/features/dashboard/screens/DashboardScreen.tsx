import React, { useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Text, Pressable, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/useAuthStore';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Card } from '../../../components/ui/Card';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from '../components/DashboardHeader';
import { HeroProgressRing } from '../components/HeroProgressRing';
import { DailyMissionCard } from '../components/DailyMissionCard';
import { QuickActionsRow } from '../components/QuickActionsRow';
import { AIInsightCard } from '../components/AIInsightCard';
import { ForecastCard } from '../components/ForecastCard';
import { CategoryBreakdownGrid } from '../components/CategoryBreakdownGrid';
import { RecentActivityList } from '../components/RecentActivityList';
import { X, WifiOff } from 'lucide-react-native';

export const DashboardScreen: React.FC = () => {
  const { colors, spacing, typography, roundness } = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // States
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(() => Date.now());
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(false); // Can toggle via header to test offline banner
  const [now, setNow] = useState<number>(() => Date.now());

  // TanStack Query Hook
  const { data, isLoading, isError, refetch, invalidateAndRefetch } = useDashboardData();

  // Pull to Refresh Handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      const current = Date.now();
      setLastRefreshedAt(current);
      setNow(current);
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // 60-second Staleness Rule implementation
  useFocusEffect(
    useCallback(() => {
      const current = Date.now();
      setNow(current);
      if (lastRefreshedAt > 0) {
        const ageInSeconds = (current - lastRefreshedAt) / 1000;
        if (ageInSeconds > 60) {
          invalidateAndRefetch();
          setLastRefreshedAt(current);
        }
      }
    }, [lastRefreshedAt, invalidateAndRefetch])
  );

  // Toggle Connection Status
  const handleSyncToggle = () => {
    setIsOffline((prev) => !prev);
    Alert.alert(
      isOffline ? 'Online Mode' : 'Offline Mode',
      isOffline 
        ? 'Application is back online. Syncing pending logs...' 
        : 'Application is offline. Logged actions will be queued locally.'
    );
  };

  // Simulated Mission Completion
  const handleMissionComplete = () => {
    Alert.alert(
      'Congratulations!',
      'You completed today\'s daily mission! Your Sustainability Score and Streak have been updated.',
      [
        {
          text: 'Awesome',
          onPress: () => {
            // Refetch dashboard data to update views
            refetch();
          },
        },
      ]
    );
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={[styles.skeletonContainer, { padding: spacing.lg }]}>
          {/* Header Skeleton */}
          <View style={styles.skeletonHeader}>
            <Skeleton variant="circle" height={32} />
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="circle" height={24} />
          </View>
          {/* Hero Progress Ring Skeleton */}
          <View style={styles.skeletonHero}>
            <Skeleton variant="circle" height={190} />
            <Skeleton variant="text" width="60%" style={{ marginTop: 16 }} />
          </View>
          {/* Daily Mission Skeleton */}
          <Skeleton variant="card" height={160} />
          {/* Quick Actions Row Skeleton */}
          <View style={styles.skeletonRow}>
            <Skeleton variant="list" width={100} height={40} />
            <Skeleton variant="list" width={120} height={40} />
            <Skeleton variant="list" width={100} height={40} />
          </View>
          {/* Grid Skeleton */}
          <View style={styles.skeletonRow}>
            <Skeleton variant="card" height={100} style={{ flex: 1 }} />
            <Skeleton variant="card" height={100} style={{ flex: 1 }} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Error Boundary State
  if (isError || !data) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={styles.errorContainer}>
          <ErrorState
            message="Unable to load today's dashboard. We encountered a network error while fetching your carbon profile. Please check your connection and retry."
            onRetry={() => { refetch(); }}
          />
        </View>
      </ScreenContainer>
    );
  }

  // First-run Welcome Banner rule
  // (Shows if user has logged 0 activities, and has not dismissed the banner yet)
  const isFirstRun = data.activitiesLoggedCount === 0 || (user?.activitiesLogged === 0);
  const showWelcomeBanner = isFirstRun && !isBannerDismissed;

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
        {/* Offline sync Banner */}
        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: colors.error_container }]}>
            <WifiOff size={16} color={colors.error_text} />
            <Text style={[typography.caption, { color: colors.error_text, marginLeft: 8, fontWeight: '600' }]}>
              {"You're offline. Activities will sync automatically."}
            </Text>
          </View>
        )}

        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          
          {/* 1. Dashboard Header */}
          <DashboardHeader
            streak={data.streak}
            userName={user?.name || 'Eco Advocate'}
            isOffline={isOffline}
            onSyncToggle={handleSyncToggle}
          />

          {/* 2. Welcome First-Run Banner */}
          {showWelcomeBanner && (
            <Card variant="interactive" style={[styles.welcomeCard, { borderColor: colors.primary }] as any}>
              <View style={styles.welcomeHeader}>
                <Text style={[typography.h3, { color: colors.primary_dim }]}>
                  🌱 Welcome to Carbon Sense!
                </Text>
                <Pressable
                  onPress={() => setIsBannerDismissed(true)}
                  accessibilityLabel="Dismiss welcome banner"
                  accessibilityRole="button"
                  style={styles.closeBannerBtn}
                >
                  <X size={16} color={colors.text_secondary} />
                </Pressable>
              </View>
              <Text style={[typography.body, { color: colors.text_secondary, marginTop: 4, marginBottom: spacing.md }]}>
                Start your first mission to earn your first Sustainability Score and begin your green journey.
              </Text>
              <Pressable
                style={[styles.welcomeCTA, { backgroundColor: colors.primary, borderRadius: roundness.md }]}
                onPress={() => router.push('/(tabs)/missions')}
                accessibilityLabel="View daily missions list"
                accessibilityRole="button"
              >
                <Text style={[typography.bodyMedium, { color: '#FFFFFF', fontWeight: '700' }]}>
                  Start First Mission →
                </Text>
              </Pressable>
            </Card>
          )}

          {/* 3. Hero Progress Ring */}
          <HeroProgressRing
            score={data.score}
            scoreTrend={data.scoreTrend}
            todayEmissions={data.categories.reduce((acc, curr) => acc + curr.value, 0)}
            dailyLimit={15.0} // Target Daily Footprint Limit
            isZeroState={isFirstRun}
          />

          {/* 4. Daily Mission Card */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
              {"TODAY'S HIGHLIGHTED MISSION"}
            </Text>
            <DailyMissionCard mission={data.mission} onComplete={handleMissionComplete} />
          </View>

          {/* 5. Quick Actions Horizontal Scroll */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
              QUICK LOG ACTIONS
            </Text>
            <QuickActionsRow />
          </View>

          {/* 6. AI Insight Card */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
              RECOMMENDED INSIGHT
            </Text>
            <AIInsightCard insight={data.insights} />
          </View>

          {/* 7. Forecast Card */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
              PROGRESS FORECAST
            </Text>
            <ForecastCard forecast={data.forecast} />
          </View>

          {/* 8. Category Breakdown Grid */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
              CARBON BREAKDOWN
            </Text>
            <CategoryBreakdownGrid categories={data.categories} />
          </View>

          {/* 9. Recent Activity List */}
          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
              RECENT LOGS
            </Text>
            <RecentActivityList activities={data.activities} now={now} />
          </View>

        </View>
      </ScreenContainer>
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  welcomeCard: {
    borderWidth: 1.5,
    padding: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBannerBtn: {
    padding: 4,
  },
  welcomeCTA: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: '100%',
  },
  section: {
    width: '100%',
  },
  skeletonContainer: {
    gap: 24,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonHero: {
    alignItems: 'center',
    marginVertical: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
