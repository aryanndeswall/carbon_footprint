import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ActivityItem } from '../types/dashboard.types';
import { Car, Utensils, Zap, ShoppingBag, ChevronRight } from 'lucide-react-native';

interface ActivityRowProps {
  activity: ActivityItem;
  now: number;
  onPress?: () => void;
}

export const ActivityRow: React.FC<ActivityRowProps> = ({ activity, now, onPress }) => {
  const { colors, spacing, typography, roundness } = useTheme();

  // Maps category to icon and color
  const getCategoryTheme = () => {
    switch (activity.category) {
      case 'Transport':
        return { icon: Car, color: colors.primary };
      case 'Food':
        return { icon: Utensils, color: colors.warning };
      case 'Energy':
        return { icon: Zap, color: colors.simulation };
      case 'Shopping':
        return { icon: ShoppingBag, color: colors.error };
      default:
        return { icon: Zap, color: colors.primary };
    }
  };

  const { icon: IconComp, color } = getCategoryTheme();

  // Format relative timestamp
  const getRelativeTime = (isoString: string, currentTimestamp: number) => {
    try {
      if (currentTimestamp === 0) return 'Recently';
      const diffMs = currentTimestamp - new Date(isoString).getTime();
      if (diffMs < 0) return 'Just now';
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Activity: ${activity.activity_type}, Quantity: ${activity.quantity} ${activity.unit}`}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: roundness.md,
          padding: spacing.md,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
        <IconComp size={18} color={color} />
      </View>

      <View style={styles.content}>
        <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
          {activity.activity_type}
        </Text>
        <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 2 }]}>
          {getRelativeTime(activity.timestamp, now)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
          {activity.quantity} <Text style={typography.caption}>{activity.unit}</Text>
        </Text>
        <ChevronRight size={16} color={colors.text_secondary} style={{ marginLeft: 4 }} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 64,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
