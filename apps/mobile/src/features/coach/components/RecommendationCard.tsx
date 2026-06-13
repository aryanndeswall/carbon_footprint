import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Leaf, Flame } from 'lucide-react-native';
import { Recommendation } from '../types/coach.types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  index,
}) => {
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();

  const handleCTA = () => {
    // Navigate directly based on the CTA route
    router.push(recommendation.ctaNavigation as any);
  };

  const getDifficultyVariant = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'success';
      case 'Hard':
        return 'error';
      case 'Medium':
      default:
        return 'warning';
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(300).springify()}>
      <Card variant="interactive" style={styles.card}>
        <View style={styles.headerRow}>
          <Badge label={recommendation.category} variant="info" />
          <Badge
            label={recommendation.difficulty}
            variant={getDifficultyVariant(recommendation.difficulty)}
          />
        </View>

        <Text style={[typography.h3, { color: colors.text_primary, marginTop: spacing.sm }]}>
          {recommendation.title}
        </Text>
        
        <Text style={[typography.body, { color: colors.text_secondary, marginTop: 4, marginBottom: spacing.md }]}>
          {recommendation.description}
        </Text>

        {/* Metrics Grid */}
        <View style={[styles.metricsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.metricItem}>
            <Leaf size={14} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.text_secondary, marginLeft: 4 }]}>
              Impact: <Text style={{ color: colors.primary_dim, fontWeight: '700' }}>-{recommendation.rewardCarbon} kg CO₂</Text>
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Flame size={14} color={colors.streak} />
            <Text style={[typography.caption, { color: colors.text_secondary, marginLeft: 4 }]}>
              Reward: <Text style={{ color: colors.streak, fontWeight: '700' }}>+{recommendation.rewardScore} Score</Text>
            </Text>
          </View>
        </View>

        <Button
          title={recommendation.ctaLabel}
          onPress={handleCTA}
          variant="secondary"
          style={styles.ctaButton}
          accessibilityLabel={`${recommendation.ctaLabel}: ${recommendation.title}`}
        />
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
    gap: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButton: {
    height: 40,
    width: '100%',
  },
});
