import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { ForecastSummary } from '../types/dashboard.types';
import { Calendar, ArrowRight, TrendingUp } from 'lucide-react-native';

interface ForecastCardProps {
  forecast: ForecastSummary;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast }) => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push('/forecast');
  };

  return (
    <Card variant="interactive" onPress={handlePress} style={styles.card}>
      <View style={styles.header}>
        <Calendar size={18} color={colors.primary} />
        <Text style={[typography.bodyMedium, { color: colors.text_secondary, fontWeight: '700', marginLeft: 8 }]}>
          {forecast.period} Forecast
        </Text>
      </View>

      <View style={styles.trendRow}>
        <View style={styles.metric}>
          <Text style={[typography.caption, { color: colors.text_secondary }]}>
            CURRENT
          </Text>
          <Text style={[typography.h2, { color: colors.text_primary }]}>
            {forecast.currentScore}
          </Text>
        </View>

        <ArrowRight size={20} color={colors.border} />

        <View style={styles.metric}>
          <Text style={[typography.caption, { color: colors.primary }]}>
            PROJECTED
          </Text>
          <View style={styles.projectedScoreContainer}>
            <Text style={[typography.h2, { color: colors.primary }]}>
              {forecast.projectedScore}
            </Text>
            <TrendingUp size={16} color={colors.primary} style={{ marginLeft: 4 }} />
          </View>
        </View>

        <View style={[styles.confidenceContainer, { backgroundColor: colors.border }]}>
          <Text style={[typography.caption, { color: colors.text_primary, fontWeight: '700' }]}>
            {forecast.confidence}%
          </Text>
          <Text style={[styles.confidenceLabel, { color: colors.text_secondary }]}>
            Confidence
          </Text>
        </View>
      </View>

      <Text style={[typography.caption, { color: colors.text_secondary, marginTop: spacing.sm, fontStyle: 'italic' }]}>
        {forecast.summary}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metric: {
    alignItems: 'flex-start',
  },
  projectedScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
});
