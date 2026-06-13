import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ProgressBar } from '../../../components/progress/ProgressBar';
import { Goal } from '../types/profile.types';

interface GoalProgressCardProps {
  goal: Goal;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({ goal }) => {
  const { colors, typography } = useTheme();
  const router = useRouter();

  const handleCrossLink = () => {
    // Navigate to missions tab with query filter
    router.push(`/(tabs)/missions?${goal.filterQuery}` as any);
  };

  const getGoalBadgeLabel = (type: string) => {
    switch (type) {
      case 'Reach Score 90':
        return 'Score';
      case 'Maintain Streak':
        return 'Streak';
      case 'Reduce Transport':
        return 'Transport';
      case 'Reduce Food':
        return 'Food';
      case 'Reduce Energy':
      default:
        return 'Energy';
    }
  };

  const progressRatio = Math.max(0, Math.min(1.0, goal.currentValue / goal.targetValue));
  const completionPercentage = Math.round(progressRatio * 100);

  const isCompleted = goal.status === 'completed';

  return (
    <Card variant={isCompleted ? 'outlined' : 'flat'} style={StyleSheet.flatten([styles.card, isCompleted && { borderColor: colors.primary, borderWidth: 1 }])}>
      <View style={styles.header}>
        <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', flex: 1 }]}>
          {goal.title}
        </Text>
        <Badge label={getGoalBadgeLabel(goal.type)} variant={isCompleted ? 'success' : 'info'} />
      </View>

      <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4 }]}>
        {goal.description}
      </Text>

      {/* Progress metrics and bar */}
      <View style={styles.progressSection}>
        <View style={styles.metricsRow}>
          <Text style={[typography.caption, { color: colors.text_primary, fontWeight: '600' }]}>
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </Text>
          <Text style={[typography.caption, { color: colors.primary_dim, fontWeight: '700' }]}>
            {completionPercentage}%
          </Text>
        </View>
        <ProgressBar progress={progressRatio} color={colors.primary} height={6} />
      </View>

      {/* F-11: Goal -> Mission Cross Link */}
      {!isCompleted && (
        <Pressable
          onPress={handleCrossLink}
          accessibilityRole="button"
          accessibilityLabel={`View missions related to ${goal.title}`}
          style={styles.crossLink}
        >
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            View Related Missions →
          </Text>
        </Pressable>
      )}

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            ✨ Goal Achieved!
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressSection: {
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  crossLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  completedBadge: {
    marginTop: 12,
  },
});
