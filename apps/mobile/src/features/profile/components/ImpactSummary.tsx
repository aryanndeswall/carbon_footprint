import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { ImpactCard } from './ImpactCard';
import { Leaf, Award, Trophy, Users } from 'lucide-react-native';
import { ImpactMetrics } from '../types/profile.types';

interface ImpactSummaryProps {
  metrics: ImpactMetrics;
}

export const ImpactSummary: React.FC<ImpactSummaryProps> = ({ metrics }) => {
  const { spacing, colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
        MY TOTAL IMPACT
      </Text>
      
      <View style={styles.grid}>
        <ImpactCard
          title="Carbon Saved"
          value={`${metrics.carbonSaved.toFixed(1)} kg`}
          icon={Leaf}
          iconColor={colors.primary}
        />
        
        <ImpactCard
          title="Activities Logged"
          value={metrics.activitiesLogged}
          icon={Award}
          iconColor={colors.streak}
        />

        <ImpactCard
          title="Missions Done"
          value={metrics.missionsCompleted}
          icon={Trophy}
          iconColor={colors.simulation}
        />

        <ImpactCard
          title="Contributions"
          value={metrics.communityContributions}
          icon={Users}
          iconColor={colors.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
