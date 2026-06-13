import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/progress/ProgressBar';
import { X, Award, Flame, Calendar, Activity } from 'lucide-react-native';

export default function ScoreScreen() {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();

  const scoreStats = [
    { label: 'Consistency Score', value: 85, icon: Calendar, description: 'Based on your consecutive daily log rate.' },
    { label: 'Mission Score', value: 92, icon: Award, description: 'Reflects daily mission completion rates.' },
    { label: 'Streak Score', value: 75, icon: Flame, description: 'Based on streak count and protective freezes used.' },
    { label: 'Improvement Score', value: 80, icon: Activity, description: 'Your carbon reduction delta versus last week.' },
  ];

  return (
    <ScreenContainer style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.md }]}>
        <Text style={[typography.h3, { color: colors.text_primary }]}>
          Sustainability Score
        </Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={colors.text_primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ padding: spacing.lg }}>
          
          <Card variant="elevated" style={styles.heroCard}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
              OVERALL GRADE
            </Text>
            <Text style={[typography.display, { color: colors.primary, marginVertical: 8 }]}>
              85
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.primary_dim, fontWeight: '700' }]}>
              Excellent Sustainability Habits
            </Text>
            <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, textAlign: 'center' }]}>
              You are in the top 12% of contributors in your region this week.
            </Text>
          </Card>

          <View style={styles.section}>
            <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.md }]}>
              SCORE BREAKDOWN
            </Text>

            {scoreStats.map((stat, index) => {
              const IconComp = stat.icon;
              return (
                <Card key={index} variant="outlined" style={[styles.statRow, { marginBottom: spacing.sm }] as any}>
                  <View style={styles.row}>
                    <IconComp size={22} color={colors.primary} />
                    <View style={styles.statContent}>
                      <View style={styles.statHeader}>
                        <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
                          {stat.label}
                        </Text>
                        <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
                          {stat.value}/100
                        </Text>
                      </View>
                      <ProgressBar progress={stat.value / 100} style={{ marginVertical: 8 }} />
                      <Text style={[typography.caption, { color: colors.text_secondary }]}>
                        {stat.description}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>

        </View>
      </ScrollView>
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
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 28,
  },
  section: {
    marginBottom: 20,
  },
  statRow: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statContent: {
    flex: 1,
    marginLeft: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
