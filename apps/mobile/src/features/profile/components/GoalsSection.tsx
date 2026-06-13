import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { GoalProgressCard } from './GoalProgressCard';
import { Button } from '../../../components/ui/Button';
import { Goal } from '../types/profile.types';

interface GoalsSectionProps {
  goals: Goal[];
  onPressCreateGoal?: () => void;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  onPressCreateGoal,
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
        ACTIVE GOALS
      </Text>

      {goals.length === 0 ? (
        <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
          <Text style={[typography.body, { color: colors.text_secondary, marginBottom: spacing.md }]}>
            Create your first sustainability goal.
          </Text>
          {onPressCreateGoal && (
            <Button
              title="Create Goal"
              onPress={onPressCreateGoal}
              variant="secondary"
              style={styles.createBtn}
            />
          )}
        </View>
      ) : (
        <View style={styles.list}>
          {goals.map((goal) => (
            <GoalProgressCard key={goal.id} goal={goal} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  list: {
    gap: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  createBtn: {
    height: 36,
  },
});
