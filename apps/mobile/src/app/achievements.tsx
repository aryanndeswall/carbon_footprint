import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Card } from '../components/ui/Card';
import { ChevronLeft, Award, Zap, ShieldAlert, Star } from 'lucide-react-native';

export default function AchievementsScreen() {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();

  const achievements = [
    { title: 'First Steps', description: 'Log your first activity.', unlocked: true, date: '2026-06-12' },
    { title: 'Eco Rider', description: 'Log 5 metro trips.', unlocked: true, date: '2026-06-13' },
    { title: 'Veggie Fanatic', description: 'Log 10 vegetarian meals.', unlocked: false },
    { title: 'Streak Master', description: 'Maintain a 10-day streak.', unlocked: false },
  ];

  return (
    <ScreenContainer style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.md }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={colors.text_primary} />
          </Pressable>
          <Text style={[typography.h2, { color: colors.text_primary, marginLeft: 8 }]}>
            Achievements
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ padding: spacing.lg }}>
          
          <View style={styles.badgeGrid}>
            {achievements.map((ach, index) => (
              <Card
                key={index}
                variant={ach.unlocked ? 'default' : 'outlined'}
                style={[
                  styles.badgeCard,
                  !ach.unlocked && { opacity: 0.5 },
                ] as any}
              >
                <View style={[styles.iconContainer, { backgroundColor: ach.unlocked ? colors.success_container : colors.border }]}>
                  {ach.unlocked ? (
                    <Award size={32} color={colors.primary} />
                  ) : (
                    <Star size={32} color={colors.text_secondary} />
                  )}
                </View>
                <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', marginTop: 12 }]}>
                  {ach.title}
                </Text>
                <Text style={[typography.caption, { color: colors.text_secondary, textAlign: 'center', marginTop: 4 }]}>
                  {ach.description}
                </Text>
                {ach.unlocked && ach.date && (
                  <Text style={[typography.caption, { color: colors.primary, marginTop: 8, fontSize: 10 }]}>
                    Unlocked {ach.date}
                  </Text>
                )}
              </Card>
            ))}
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
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
  scrollContent: {
    paddingBottom: 40,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
