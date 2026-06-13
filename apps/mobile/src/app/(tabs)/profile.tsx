import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/layout/BottomSheet';
import { Settings, Flame, Award, Calendar, ChevronRight, User, Bell, Shield, Moon } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { colors, spacing, typography, roundness } = useTheme();

  // Settings modal visibility state
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Profile goals mock matching F-11 specifications
  const goals = [
    {
      id: 'goal-1',
      title: 'Reduce Transit Footprint',
      description: 'Cut weekly car travel by 20km.',
      progress: 0.65,
      type: 'Reduce Transport',
      filterQuery: 'category=Transport',
    },
    {
      id: 'goal-2',
      title: 'Maintain 7-Day Streak',
      description: 'Log daily activities for one week straight.',
      progress: 0.85,
      type: 'Maintain Streak',
      filterQuery: 'difficulty=Easy',
    },
    {
      id: 'goal-3',
      title: 'Vegetarian Committer',
      description: 'Choose vegetarian lunch options 4 times.',
      progress: 0.5,
      type: 'Reduce Food',
      filterQuery: 'category=Food',
    },
  ];

  const handleGoalCrossLink = (filter: string) => {
    router.push(`/(tabs)/missions?${filter}`);
  };

  const handleLogout = async () => {
    setSettingsVisible(false);
    await logout();
    router.replace('/auth/sign-in');
  };

  return (
    <ScreenContainer scrollable contentContainerStyle={styles.scrollContent}>
      <View style={[styles.inner, { padding: spacing.lg }]}>
        
        {/* Header with Quick Access Gear Icon (F-10) */}
        <View style={styles.headerRow}>
          <Text style={[typography.h2, { color: colors.text_primary }]}>
            My Passport
          </Text>
          <Pressable onPress={() => setSettingsVisible(true)} style={styles.settingsBtn}>
            <Settings size={24} color={colors.text_primary} />
          </Pressable>
        </View>

        {/* Profile Hero section */}
        <Card variant="elevated" style={[styles.heroCard, { marginBottom: spacing.lg }] as any}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <User size={40} color="#FFFFFF" />
          </View>
          <Text style={[typography.h2, { color: colors.text_primary, marginTop: spacing.sm }]}>
            {user?.name || 'Eco Advocate'}
          </Text>
          <Text style={[typography.caption, { color: colors.text_secondary }]}>
            {user?.email || 'user@carbonsense.com'}
          </Text>

          {/* Active Flame Badge */}
          <View style={[styles.streakContainer, { backgroundColor: '#FFF7ED', borderColor: colors.streak }]}>
            <Flame size={20} color={colors.streak} />
            <Text style={[typography.bodyMedium, { color: colors.streak, fontWeight: '700', marginLeft: 4 }]}>
              6 Day Streak
            </Text>
          </View>
        </Card>

        {/* 2x2 Impact Grid */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            IMPACT METRICS
          </Text>
          <View style={styles.grid}>
            <Card style={styles.gridCard}>
              <Text style={[typography.h2, { color: colors.primary }]}>32.5</Text>
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, textAlign: 'center' }]}>
                kg CO₂ Saved
              </Text>
            </Card>
            <Card style={styles.gridCard}>
              <Text style={[typography.h2, { color: colors.streak }]}>6</Text>
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, textAlign: 'center' }]}>
                Active Streak
              </Text>
            </Card>
            <Card style={styles.gridCard}>
              <Text style={[typography.h2, { color: colors.simulation }]}>14</Text>
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, textAlign: 'center' }]}>
                Missions Done
              </Text>
            </Card>
            <Card style={styles.gridCard}>
              <Text style={[typography.h2, { color: colors.text_primary }]}>85</Text>
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, textAlign: 'center' }]}>
                Total Score
              </Text>
            </Card>
          </View>
        </View>

        {/* Goals List with Cross-Links (F-11) */}
        <View style={styles.section}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
            MY ACTIVE GOALS
          </Text>
          {goals.map((goal) => (
            <Card key={goal.id} variant="default" style={[styles.goalCard, { marginBottom: spacing.sm }] as any}>
              <View style={styles.goalHeader}>
                <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
                  {goal.title}
                </Text>
                <Badge label={goal.type} variant="info" />
              </View>
              <Text style={[typography.caption, { color: colors.text_secondary, marginVertical: spacing.xs }]}>
                {goal.description}
              </Text>
              
              {/* Goal-Mission Cross-Link */}
              <Pressable
                onPress={() => handleGoalCrossLink(goal.filterQuery)}
                style={styles.crossLink}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                  View Related Missions →
                </Text>
              </Pressable>
            </Card>
          ))}
        </View>

        {/* Settings bottom trigger row (DR-2) */}
        <View style={styles.section}>
          <Card variant="interactive" onPress={() => setSettingsVisible(true)} style={styles.triggerRow}>
            <View style={styles.row}>
              <Settings size={20} color={colors.text_primary} />
              <Text style={[typography.bodyMedium, { color: colors.text_primary, marginLeft: 12 }]}>
                Settings & Options
              </Text>
            </View>
            <ChevronRight size={18} color={colors.text_secondary} />
          </Card>
        </View>

        {/* DR-2: Slide-up settings Bottom Sheet */}
        <BottomSheet
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          title="Account Settings"
        >
          <View style={styles.settingsContent}>
            
            {/* Setting: Notifications */}
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.row}>
                <Bell size={20} color={colors.text_primary} />
                <Text style={[typography.bodyMedium, { color: colors.text_primary, marginLeft: 12 }]}>
                  Push Notifications
                </Text>
              </View>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
            </View>

            {/* Setting: Dark Mode */}
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.row}>
                <Moon size={20} color={colors.text_primary} />
                <Text style={[typography.bodyMedium, { color: colors.text_primary, marginLeft: 12 }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} />
            </View>

            {/* Setting: Privacy Policy */}
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.row}>
                <Shield size={20} color={colors.text_primary} />
                <Text style={[typography.bodyMedium, { color: colors.text_primary, marginLeft: 12 }]}>
                  Privacy & Data Security
                </Text>
              </View>
              <ChevronRight size={18} color={colors.text_secondary} />
            </View>

            {/* Logout CTA */}
            <Button
              title="Sign Out"
              variant="danger"
              onPress={handleLogout}
              style={[styles.logoutBtn, { marginTop: spacing.lg }] as any}
            />
          </View>
        </BottomSheet>

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
    marginBottom: 20,
  },
  settingsBtn: {
    padding: 4,
  },
  heroCard: {
    padding: 24,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
  },
  section: {
    marginBottom: 28,
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
  goalCard: {
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crossLink: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  triggerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsContent: {
    width: '100%',
    paddingBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  logoutBtn: {
    width: '100%',
  },
});
