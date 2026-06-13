import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { MissionProgressRing } from './MissionProgressRing';
import { MissionProgress } from '../types/missions.types';
import { Award } from 'lucide-react-native';

interface MissionHeroProps {
  progress: MissionProgress;
}

export const MissionHero: React.FC<MissionHeroProps> = ({ progress }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Card variant="elevated" style={[styles.heroCard, { backgroundColor: colors.surface }] as any}>
      <View style={styles.contentRow}>
        
        {/* Left Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700' }]}>
            {"TODAY'S HABIT LOOP"}
          </Text>
          <Text style={[typography.h1, { color: colors.text_primary, marginTop: spacing.xs }]}>
            {progress.percentage}% Done
          </Text>
          <Text style={[typography.body, { color: colors.text_secondary, marginTop: 4 }]}>
            {progress.completedCount} of {progress.totalCount} missions completed
          </Text>

          {/* Award Status */}
          <View style={styles.rewardRow}>
            <Award size={18} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.primary_dim, fontWeight: '700', marginLeft: 6 }]}>
              +{progress.scoreEarned} Score earned today
            </Text>
          </View>
        </View>

        {/* Right Circular Visualizer */}
        <View style={styles.ringContainer}>
          <MissionProgressRing percentage={progress.percentage} size={110} />
        </View>

      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    padding: 20,
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsContainer: {
    flex: 1.3,
    justifyContent: 'center',
  },
  ringContainer: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
});
