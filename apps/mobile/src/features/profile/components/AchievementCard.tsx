import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Achievement } from '../types/profile.types';

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index }) => {
  const { colors, typography, roundness } = useTheme();

  // Format date nicely
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Earned';
    }
  };

  return (
    <Animated.View entering={ZoomIn.delay(index * 100).duration(300)}>
      <Card variant="interactive" style={styles.card}>
        <View style={styles.row}>
          {/* Badge Visual */}
          <View style={[styles.badgeContainer, { backgroundColor: colors.background, borderRadius: roundness.md }]}>
            <Text style={styles.badgeText}>{achievement.badge}</Text>
          </View>

          {/* Details */}
          <View style={styles.content}>
            <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
              {achievement.title}
            </Text>
            <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 2 }]}>
              {achievement.description}
            </Text>
            <Text style={[typography.caption, { color: colors.primary_dim, marginTop: 4, fontWeight: '700' }]}>
              Earned on {formatDate(achievement.earnedAt)}
            </Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
});
