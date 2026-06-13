import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { CoachResponse } from '../types/coach.types';
import { Eye, ShieldAlert, Award } from 'lucide-react-native';

interface CoachResponseCardProps {
  response: CoachResponse;
}

export const CoachResponseCard: React.FC<CoachResponseCardProps> = ({ response }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Text style={[typography.h3, { color: colors.primary_dim, marginBottom: spacing.md }]}>
        AI Recommendation
      </Text>

      {/* Observation */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Eye size={16} color={colors.primary} />
          <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', marginLeft: 8 }]}>
            Observation
          </Text>
        </View>
        <Text style={[typography.body, { color: colors.text_secondary, marginLeft: 24, marginTop: 4 }]}>
          {response.observation}
        </Text>
      </View>

      {/* Reason */}
      <View style={[styles.section, { marginTop: spacing.md }]}>
        <View style={styles.sectionHeader}>
          <ShieldAlert size={16} color={colors.warning} />
          <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', marginLeft: 8 }]}>
            Reason
          </Text>
        </View>
        <Text style={[typography.body, { color: colors.text_secondary, marginLeft: 24, marginTop: 4 }]}>
          {response.reason}
        </Text>
      </View>

      {/* Recommendation */}
      <View style={[styles.section, { marginTop: spacing.md }]}>
        <View style={styles.sectionHeader}>
          <Award size={16} color={colors.streak} />
          <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', marginLeft: 8 }]}>
            Recommendation
          </Text>
        </View>
        <Text style={[typography.body, { color: colors.text_secondary, marginLeft: 24, marginTop: 4, fontWeight: '500' }]}>
          {response.recommendation}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    width: '100%',
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
