import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { CompletedMission } from '../types/missions.types';
import { CheckCircle, Award } from 'lucide-react-native';

interface CompletedMissionCardProps {
  completed: CompletedMission;
}

export const CompletedMissionCard: React.FC<CompletedMissionCardProps> = ({ completed }) => {
  const { colors, typography } = useTheme();

  // Format date nicely
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Completed';
    }
  };

  return (
    <Card variant="default" style={styles.card}>
      <View style={styles.row}>
        
        {/* Success Check Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <CheckCircle size={18} color={colors.primary} />
        </View>

        {/* Title & timestamp */}
        <View style={styles.content}>
          <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700' }]}>
            {completed.title}
          </Text>
          <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 2 }]}>
            Completed on {formatDate(completed.completedAt)}
          </Text>
        </View>

        {/* Earned Badge */}
        <View style={[styles.rewardContainer, { backgroundColor: '#FFF7ED', borderColor: colors.streak }]}>
          <Award size={12} color={colors.streak} />
          <Text style={[typography.caption, { color: colors.streak, fontWeight: '700', marginLeft: 4 }]}>
            +{completed.rewardScore} Score
          </Text>
        </View>

      </View>
    </Card>
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
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
});
