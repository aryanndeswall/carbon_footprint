import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ActivityRow } from './ActivityRow';
import { ActivityItem } from '../types/dashboard.types';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { useRouter } from 'expo-router';

interface RecentActivityListProps {
  activities: ActivityItem[];
  now: number;
  onActivityPress?: (activity: ActivityItem) => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  now,
  onActivityPress,
}) => {
  const { spacing } = useTheme();
  const router = useRouter();

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        title="No activities logged yet"
        description="Start logging your transport, food, and energy usage to see your environmental footprint history."
        actionTitle="Log First Activity"
        onActionPress={() => router.push('/modals/activity-log')}
      />
    );
  }

  // Cap at last 5 activities
  const recentItems = activities.slice(0, 5);

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      {recentItems.map((activity) => (
        <ActivityRow
          key={activity.id}
          activity={activity}
          now={now}
          onPress={() => onActivityPress?.(activity)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
