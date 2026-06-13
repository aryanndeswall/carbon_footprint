import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Forecast } from '../types/coach.types';
import { TrendingUp, ShieldCheck } from 'lucide-react-native';

interface ForecastInsightCardProps {
  forecast: Forecast;
}

export const ForecastInsightCard: React.FC<ForecastInsightCardProps> = ({ forecast }) => {
  const { colors, spacing, typography, roundness } = useTheme();
  const router = useRouter();

  return (
    <Card variant="flat" style={styles.card}>
      <View style={styles.header}>
        <TrendingUp size={20} color={colors.simulation} />
        <Text style={[typography.h3, { color: colors.text_primary, marginLeft: 8 }]}>
          Score Forecast
        </Text>
      </View>

      {/* Grid of Scores */}
      <View style={styles.scoreGrid}>
        <View style={[styles.scoreBox, { backgroundColor: colors.background, borderRadius: roundness.md }]}>
          <Text style={[typography.caption, { color: colors.text_secondary }]}>CURRENT</Text>
          <Text style={[typography.h1, { color: colors.text_primary, marginTop: spacing.xs }]}>
            {forecast.currentScore}
          </Text>
        </View>

        <View style={[styles.scoreBox, { backgroundColor: `${colors.simulation}15`, borderRadius: roundness.md, borderColor: colors.simulation, borderWidth: 1 }]}>
          <Text style={[typography.caption, { color: colors.simulation }]}>PROJECTED</Text>
          <Text style={[typography.h1, { color: colors.simulation, marginTop: spacing.xs }]}>
            {forecast.projectedScore}
          </Text>
        </View>
      </View>

      {/* Confidence Score Pill */}
      <View style={styles.confidenceRow}>
        <ShieldCheck size={14} color={colors.primary} />
        <Text style={[typography.caption, { color: colors.text_secondary, marginLeft: 4 }]}>
          Confidence: <Text style={{ color: colors.primary_dim, fontWeight: '700' }}>{forecast.confidence}%</Text>
        </Text>
      </View>

      {/* AI Explanation */}
      <Text style={[typography.body, { color: colors.text_secondary, marginTop: spacing.md, lineHeight: 20 }]}>
        {forecast.explanation}
      </Text>

      {/* F-7: Coach -> Simulator Discovery Handoff */}
      <Pressable
        onPress={() => router.push('/simulator')}
        accessibilityRole="button"
        accessibilityLabel="Navigate to simulator to explore habit change impacts"
        style={styles.handoffCTA}
      >
        <Text style={[typography.bodyMedium, { color: colors.simulation, fontWeight: '700' }]}>
          🔮 What if I changed my habits? →
        </Text>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  scoreBox: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  handoffCTA: {
    marginTop: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
});
