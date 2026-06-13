import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/progress/ProgressBar';
import { WeeklyMission } from '../types/missions.types';
import { Trophy, Star, CheckCircle } from 'lucide-react-native';

interface WeeklyMissionCardProps {
  mission: WeeklyMission;
}

export const WeeklyMissionCard: React.FC<WeeklyMissionCardProps> = ({ mission }) => {
  const { colors, spacing, typography } = useTheme();

  // Progress Ratio (0 to 1)
  const progressRatio = Math.max(0, Math.min(1.0, mission.currentProgress / mission.totalTarget));

  return (
    <Card variant={mission.isCompleted ? 'outlined' : 'flat'} style={[styles.card, mission.isCompleted && { borderColor: colors.primary, borderWidth: 1 }] as any}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Trophy size={18} color={mission.isCompleted ? colors.primary : colors.text_secondary} />
          <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', marginLeft: 8 }]}>
            {mission.title}
          </Text>
        </View>
        
        {/* Completion status */}
        {mission.isCompleted ? (
          <View style={styles.completedBadge}>
            <CheckCircle size={14} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.primary_dim, fontWeight: '700', marginLeft: 4 }]}>
              Done
            </Text>
          </View>
        ) : (
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600' }]}>
            {mission.currentProgress} / {mission.totalTarget} Completed
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <ProgressBar progress={progressRatio} color={colors.primary} height={6} />
      </View>

      {/* Reward Indicator */}
      <View style={[styles.rewardFooter, { marginTop: spacing.sm }]}>
        <View style={styles.rewardBox}>
          <Star size={12} color={colors.streak} />
          <Text style={[typography.caption, { color: colors.text_secondary, marginLeft: 4 }]}>
            Reward: <Text style={{ color: colors.streak, fontWeight: '700' }}>+{mission.rewardScore} Score</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressSection: {
    marginVertical: 4,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
