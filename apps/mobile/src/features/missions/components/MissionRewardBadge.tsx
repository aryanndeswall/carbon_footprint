import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Flame, Leaf } from 'lucide-react-native';

interface MissionRewardBadgeProps {
  scoreReward: number;
  carbonReward?: number;
}

export const MissionRewardBadge: React.FC<MissionRewardBadgeProps> = ({
  scoreReward,
  carbonReward,
}) => {
  const { colors, typography, roundness } = useTheme();

  return (
    <View style={styles.badgeRow}>
      {/* Score Reward */}
      <View style={[styles.badgeItem, { backgroundColor: '#FFF7ED', borderColor: colors.streak, borderRadius: roundness.sm }]}>
        <Flame size={12} color={colors.streak} />
        <Text style={[styles.badgeText, typography.caption, { color: colors.streak, fontWeight: '700' }]}>
          +{scoreReward} Score
        </Text>
      </View>

      {/* Carbon Saving Reward */}
      {carbonReward !== undefined && carbonReward > 0 && (
        <View style={[styles.badgeItem, { backgroundColor: colors.success_container, borderColor: colors.primary, borderRadius: roundness.sm }]}>
          <Leaf size={12} color={colors.primary} />
          <Text style={[styles.badgeText, typography.caption, { color: colors.primary_dim, fontWeight: '700' }]}>
            {carbonReward.toFixed(1)} kg CO₂
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: {
    marginLeft: 4,
    fontWeight: '600',
  },
});
