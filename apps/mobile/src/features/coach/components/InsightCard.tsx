import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Lightbulb } from 'lucide-react-native';
import { CoachInsight } from '../types/coach.types';

interface InsightCardProps {
  insight: CoachInsight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(400).springify()}>
      <Card
        variant="elevated"
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <Lightbulb size={24} color={colors.primary} />
          <Text style={[typography.h3, { color: colors.primary_dim, marginLeft: 8 }]}>
            {insight.headline}
          </Text>
        </View>
        
        <Text style={[typography.body, { color: colors.text_primary, marginTop: spacing.md, lineHeight: 22 }]}>
          {insight.summary}
        </Text>
        
        <Text style={[typography.bodyMedium, { color: colors.text_secondary, marginTop: spacing.sm, fontStyle: 'italic' }]}>
          {insight.recommendation}
        </Text>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
