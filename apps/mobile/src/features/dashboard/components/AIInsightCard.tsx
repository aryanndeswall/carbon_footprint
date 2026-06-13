import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { AIInsight } from '../types/dashboard.types';
import { Lightbulb, ArrowRight } from 'lucide-react-native';

interface AIInsightCardProps {
  insight: AIInsight;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight }) => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push('/(tabs)/coach');
  };

  return (
    <Card variant="interactive" onPress={handlePress} style={styles.card}>
      <View style={styles.header}>
        <Lightbulb size={20} color={colors.primary} />
        <Text style={[typography.bodyMedium, { color: colors.primary_dim, fontWeight: '700', marginLeft: 8 }]}>
          AI Carbon Coach
        </Text>
      </View>

      <Text style={[typography.body, { color: colors.text_primary, marginTop: spacing.xs, lineHeight: 20 }]}>
        {`"${insight.text}"`}
      </Text>

      {insight.suggestion && (
        <Text style={[typography.caption, { color: colors.text_secondary, marginTop: spacing.sm, fontWeight: '600' }]}>
          💡 Suggestion: {insight.suggestion}
        </Text>
      )}

      <View style={[styles.ctaRow, { marginTop: spacing.sm }]}>
        <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
          Ask Coach anything
        </Text>
        <ArrowRight size={14} color={colors.primary} style={{ marginLeft: 4 }} />
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
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
