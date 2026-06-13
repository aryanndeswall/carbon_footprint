import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ProgressBar } from '../../../components/progress/ProgressBar';
import { MissionRewardBadge } from './MissionRewardBadge';
import { DailyMission } from '../types/missions.types';
import { Car, Utensils, Zap, ShoppingBag, Users, Sparkles, CheckCircle, Info } from 'lucide-react-native';

interface DailyMissionCardProps {
  mission: DailyMission;
  isHighlighted?: boolean;
  onPressCTA: (id: string, currentStatus: string) => void;
}

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({
  mission,
  isHighlighted = false,
  onPressCTA,
}) => {
  const { colors, spacing, typography, roundness } = useTheme();

  // Local state for tip visibility
  const [tipVisible, setTipVisible] = useState(isHighlighted);

  // Border pulsing animation for F-3 first-run highlight
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (isHighlighted) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 800 }),
          withTiming(0.4, { duration: 800 })
        ),
        -1,
        true
      );

      // Auto dismiss tip after 4 seconds
      const timer = setTimeout(() => {
        setTipVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isHighlighted, pulseOpacity]);

  const pulsingBorderStyle = useAnimatedStyle(() => {
    if (!isHighlighted) return {};
    return {
      borderColor: colors.primary,
      borderWidth: 2,
      shadowColor: colors.primary,
      shadowOpacity: pulseOpacity.value * 0.4,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
    };
  });

  // Category Icon Mapper
  const getCategoryIcon = () => {
    const iconSize = 20;
    switch (mission.category) {
      case 'Transport':
        return <Car size={iconSize} color={colors.primary} />;
      case 'Food':
        return <Utensils size={iconSize} color={colors.warning} />;
      case 'Energy':
        return <Zap size={iconSize} color={colors.simulation} />;
      case 'Shopping':
        return <ShoppingBag size={iconSize} color={colors.error} />;
      case 'Community':
        return <Users size={iconSize} color={colors.primary} />;
      case 'Special':
      default:
        return <Sparkles size={iconSize} color={colors.streak} />;
    }
  };

  // Difficulty Badge Config
  const getDifficultyConfig = () => {
    switch (mission.difficulty) {
      case 'Easy':
        return { label: 'Easy', variant: 'success' as const };
      case 'Hard':
        return { label: 'Hard', variant: 'error' as const };
      case 'Medium':
      default:
        return { label: 'Medium', variant: 'warning' as const };
    }
  };

  const difficulty = getDifficultyConfig();

  // CTA Text mapper based on status
  const getCTAText = () => {
    switch (mission.status) {
      case 'in_progress':
        return 'Complete';
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      case 'available':
      default:
        return 'Start';
    }
  };

  const isCompleted = mission.status === 'completed';
  const isExpired = mission.status === 'expired';

  return (
    <View style={styles.outerContainer}>
      {/* F-3 First-Run Coach Tooltip Card */}
      {isHighlighted && tipVisible && (
        <Pressable
          onPress={() => setTipVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss tutorial tip"
          style={[styles.tooltipContainer, { backgroundColor: colors.primary, borderRadius: roundness.md, padding: spacing.md }]}
        >
          <View style={styles.tooltipContent}>
            <Info size={16} color="#FFFFFF" />
            <Text style={[styles.tooltipText, typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>
              {"👋 Here's your first mission.\nComplete it to earn your first Sustainability Score!"}
            </Text>
          </View>
        </Pressable>
      )}

      {/* Pulsing Mission Card */}
      <Animated.View style={[pulsingBorderStyle, { borderRadius: roundness.lg, overflow: 'hidden' }]}>
        <Card
          variant={isCompleted ? 'outlined' : 'flat'}
          style={[
            styles.card,
            isExpired && styles.expiredCard,
            isCompleted && { borderColor: colors.primary, borderWidth: 1 },
          ] as any}
        >
          <View style={styles.rowHeader}>
            <View style={styles.categoryTitle}>
              <View style={[styles.iconBox, { backgroundColor: colors.border }]}>
                {getCategoryIcon()}
              </View>
              <Text style={[typography.bodyMedium, { color: colors.text_secondary, fontWeight: '700', marginLeft: 8 }]}>
                {mission.category}
              </Text>
            </View>
            <Badge label={difficulty.label} variant={difficulty.variant} />
          </View>

          {/* Title & description */}
          <Text style={[typography.h3, { color: isExpired ? colors.text_secondary : colors.text_primary, marginTop: spacing.sm }]}>
            {mission.title}
          </Text>
          <Text style={[typography.body, { color: colors.text_secondary, marginTop: 4, lineHeight: 18 }]}>
            {mission.description}
          </Text>

          {/* Progress Indicator inside In-Progress cards */}
          {mission.status === 'in_progress' && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={mission.progress} color={colors.primary} height={6} />
              <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4 }]}>
                Progress: {Math.round(mission.progress * 100)}%
              </Text>
            </View>
          )}

          {/* Reward Metrics */}
          <View style={styles.footerRow}>
            <MissionRewardBadge scoreReward={mission.rewardScore} carbonReward={mission.rewardCarbon} />
            
            {/* Action CTAs */}
            {!isCompleted && !isExpired && (
              <Button
                title={getCTAText()}
                onPress={() => onPressCTA(mission.id, mission.status)}
                variant={mission.status === 'in_progress' ? 'primary' : 'secondary'}
                style={styles.ctaButton}
                accessibilityLabel={`${getCTAText()} mission: ${mission.title}`}
              />
            )}

            {isCompleted && (
              <View style={styles.completedIndicator}>
                <CheckCircle size={18} color={colors.primary} />
                <Text style={[typography.bodyMedium, { color: colors.primary_dim, fontWeight: '700', marginLeft: 6 }]}>
                  Completed
                </Text>
              </View>
            )}

            {isExpired && (
              <Text style={[typography.bodyMedium, { color: colors.text_secondary, fontWeight: '600' }]}>
                Expired
              </Text>
            )}
          </View>
        </Card>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    position: 'relative',
  },
  tooltipContainer: {
    marginBottom: 8,
    width: '100%',
  },
  tooltipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipText: {
    marginLeft: 8,
    lineHeight: 16,
  },
  card: {
    padding: 16,
  },
  expiredCard: {
    opacity: 0.6,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  ctaButton: {
    height: 36,
    paddingHorizontal: 16,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
