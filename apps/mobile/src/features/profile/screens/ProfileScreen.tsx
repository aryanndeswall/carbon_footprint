import React, { useState, useCallback } from 'react';
import { View, StyleSheet, RefreshControl, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/useAuthStore';
import { ScreenContainer } from '../../../components/layout/ScreenContainer';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/layout/BottomSheet';
import { useProfileData } from '../hooks/useProfileData';
import { ProfileHero } from '../components/ProfileHero';
import { ImpactSummary } from '../components/ImpactSummary';
import { AchievementSection } from '../components/AchievementSection';
import { GoalsSection } from '../components/GoalsSection';
import { StatisticsSection } from '../components/StatisticsSection';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsItem } from '../components/SettingsItem';
import { User, Bell, Shield, Moon, LifeBuoy, Info } from 'lucide-react-native';

export const ProfileScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();

  // Settings Bottom Sheet visibility
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Queries & refresh
  const { data, isLoading, isError, refetch, invalidateProfile } = useProfileData();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(() => Date.now());

  // Focus-based staleness invalidation (60s threshold)
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const ageInSeconds = (now - lastRefreshedAt) / 1000;
      if (ageInSeconds > 60) {
        invalidateProfile();
        setLastRefreshedAt(now);
      }
    }, [lastRefreshedAt, invalidateProfile])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      setLastRefreshedAt(Date.now());
    } catch (e) {
      console.error('Profile refresh failed', e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleLogout = async () => {
    setSettingsVisible(false);
    await logout();
    router.replace('/auth/sign-in');
  };

  if (isLoading) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={[styles.skeletonContainer, { padding: spacing.lg }]}>
          <Skeleton variant="circle" height={72} />
          <Skeleton variant="text" width="40%" height={24} style={{ alignSelf: 'center', marginTop: 12 }} />
          <Skeleton variant="card" height={100} style={{ marginTop: 24 }} />
          <Skeleton variant="card" height={150} />
          <Skeleton variant="card" height={150} />
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer style={{ backgroundColor: colors.background }}>
        <View style={styles.errorContainer}>
          <ErrorState
            message="Unable to load profile passport. Please check your network and retry."
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
          {/* Header row */}
          <View style={styles.header}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
              PASSPORT
            </Text>
            <Text style={[typography.h2, { color: colors.text_primary }]}>
              My Sustainability Journey
            </Text>
          </View>

          {/* 1. Profile Hero (handles F-10 Settings trigger top right) */}
          <ProfileHero
            user={data.user}
            onPressSettings={() => setSettingsVisible(true)}
            onPressEditProfile={() => console.log('Edit profile pressed')}
          />

          {/* 2. Impact Summary metrics (2x2 grid) */}
          <ImpactSummary metrics={data.impact} />

          {/* 3. Achievements section */}
          <AchievementSection achievements={data.achievements} />

          {/* 4. Goals section (includes F-11 missions cross link) */}
          <GoalsSection goals={data.goals} />

          {/* 5. Statistics section */}
          <StatisticsSection statistics={data.statistics} />

          {/* 6. Settings section (collapsed trigger F-10 / DR-2) */}
          <SettingsSection onPress={() => setSettingsVisible(true)} />
        </View>
      </ScreenContainer>

      {/* DR-2: Bottom Sheet Settings Modal Overlay */}
      <BottomSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        title="Settings & Preferences"
      >
        <View style={styles.sheetContent}>
          {/* Account */}
          <SettingsItem
            label="Account Details"
            icon={User}
            onPress={() => console.log('Account details')}
          />

          {/* Notifications Toggle */}
          <SettingsItem
            label="Push Notifications"
            icon={Bell}
            hasSwitch
            switchValue={pushEnabled}
            onSwitchChange={setPushEnabled}
          />

          {/* Dark Mode Toggle */}
          <SettingsItem
            label="Dark Mode"
            icon={Moon}
            hasSwitch
            switchValue={darkModeEnabled}
            onSwitchChange={setDarkModeEnabled}
          />

          {/* Privacy */}
          <SettingsItem
            label="Privacy & Data Settings"
            icon={Shield}
            onPress={() => console.log('Privacy policy')}
          />

          {/* Help Support */}
          <SettingsItem
            label="Help & Support"
            icon={LifeBuoy}
            onPress={() => console.log('Support')}
          />

          {/* About */}
          <SettingsItem
            label="About Carbon Sense"
            icon={Info}
            onPress={() => console.log('About')}
          />

          {/* Sign Out CTA */}
          <Button
            title="Sign Out"
            variant="danger"
            onPress={handleLogout}
            style={StyleSheet.flatten([styles.logoutBtn, { marginTop: spacing.xl }])}
            accessibilityLabel="Sign out of account"
          />
        </View>
      </BottomSheet>
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
  skeletonContainer: {
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheetContent: {
    width: '100%',
    paddingBottom: 24,
  },
  logoutBtn: {
    width: '100%',
    height: 48,
  },
});
