import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DailyMission } from '../types/dashboard.types';
import { CheckCircle, XCircle } from 'lucide-react-native';

interface DailyMissionCardProps {
  mission: DailyMission;
  onComplete: () => void;
}

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({
  mission,
  onComplete,
}) => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();

  // Local state for skip state (F-5 fix requirement)
  const [isSkipped, setIsSkipped] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsSkipped(true);
  };

  const navigateToMissions = () => {
    router.push('/(tabs)/missions');
  };

  // 1. Collapsed Skip State (F-5 Fix)
  if (isSkipped) {
    return (
      <Card variant="outlined" style={[styles.skippedCard, { borderColor: colors.border }] as any}>
        <View style={styles.skippedRow}>
          <XCircle size={20} color={colors.text_secondary} />
          <Text style={[typography.bodyMedium, { color: colors.text_secondary, marginLeft: 8, flex: 1 }]}>
            Mission skipped for today.
          </Text>
          <Pressable
            onPress={navigateToMissions}
            accessibilityLabel="See more missions"
            accessibilityRole="button"
            style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              See More Missions →
            </Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  // 2. Mission Completed State
  if (mission.status === 'completed') {
    return (
      <Card variant="outlined" style={[styles.completedCard, { borderColor: colors.primary }] as any}>
        <View style={styles.completedContent}>
          <CheckCircle size={32} color={colors.primary} />
          <View style={styles.completedTextContainer}>
            <Text style={[typography.h3, { color: colors.primary_dim }]}>
              Mission Completed!
            </Text>
            <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 2 }]}>
              {`You earned +${mission.scoreReward} Score and saved ${mission.carbonReward}kg CO₂`}
            </Text>
          </View>
          <Pressable
            onPress={navigateToMissions}
            accessibilityLabel="View mission history"
            accessibilityRole="button"
            style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              History →
            </Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  // Helper colors for category badge
  const categoryBadgeVariant = mission.category === 'Food' ? 'warning' : 'info';

  return (
    <Card variant="interactive" style={styles.card}>
      {/* Card Header with badges */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Badge label={mission.category} variant={categoryBadgeVariant} />
          <Badge label={mission.difficulty} variant="neutral" />
        </View>
        <Badge label={`+${mission.scoreReward} Score`} variant="streak" />
      </View>

      {/* Title & Description */}
      <View style={styles.content}>
        <Text style={[typography.h3, { color: colors.text_primary }]}>
          {mission.title}
        </Text>
        <Text style={[typography.body, { color: colors.text_secondary, marginTop: spacing.xs }]}>
          {mission.description}
        </Text>
        <Text style={[typography.caption, { color: colors.success_text, marginTop: spacing.xs, fontWeight: '600' }]}>
          🌱 Estimated Impact: {mission.carbonReward} kg CO₂ saved
        </Text>
      </View>

      {/* Call to Actions */}
      <View style={[styles.actionRow, { marginTop: spacing.md }]}>
        <Button
          title="Mark Completed"
          onPress={handleComplete}
          loading={loading}
          style={styles.completeBtn}
          accessibilityLabel={`Complete mission: ${mission.title}`}
        />
        <Button
          title="Skip"
          variant="secondary"
          onPress={handleSkip}
          style={styles.skipBtn}
          accessibilityLabel={`Skip mission: ${mission.title}`}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  content: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  completeBtn: {
    flex: 1,
    height: 40,
    paddingHorizontal: 0,
  },
  skipBtn: {
    width: 80,
    height: 40,
    paddingHorizontal: 0,
  },
  skippedCard: {
    padding: 14,
  },
  skippedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  completedCard: {
    padding: 16,
  },
  completedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
});
