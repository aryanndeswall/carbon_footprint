import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Trend } from '../types/coach.types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface TrendCardProps {
  trend: Trend;
}

export const TrendCard: React.FC<TrendCardProps> = ({ trend }) => {
  const { colors, spacing, typography } = useTheme();

  // Status mapping
  const getTrendColor = () => {
    switch (trend.state) {
      case 'Improving':
        return colors.primary; // Green
      case 'Stable':
        return colors.simulation; // Blue / Freeze Blue
      case 'Declining':
      default:
        return colors.warning; // Orange
    }
  };

  const getTrendIcon = () => {
    const iconSize = 18;
    const color = getTrendColor();
    switch (trend.state) {
      case 'Improving':
        return <TrendingUp size={iconSize} color={color} />;
      case 'Stable':
        return <Minus size={iconSize} color={color} />;
      case 'Declining':
      default:
        return <TrendingDown size={iconSize} color={color} />;
    }
  };

  const formattedPercentage = trend.percentage > 0 
    ? `+${trend.percentage}%` 
    : trend.percentage < 0 
      ? `${trend.percentage}%` 
      : '0%';

  return (
    <Card variant="flat" style={StyleSheet.flatten([styles.card, { backgroundColor: colors.surface }])}>
      <View style={styles.header}>
        <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700' }]}>
          {trend.category.toUpperCase()}
        </Text>
        <View style={[styles.iconContainer, { backgroundColor: `${getTrendColor()}15` }]}>
          {getTrendIcon()}
        </View>
      </View>

      <Text style={[typography.h3, { color: colors.text_primary, marginTop: spacing.xs }]}>
        {trend.state}
      </Text>

      <View style={styles.footer}>
        <Text style={[typography.caption, { color: getTrendColor(), fontWeight: '700' }]}>
          {formattedPercentage}
        </Text>
        <Text style={[typography.caption, { color: colors.text_secondary, marginLeft: 4 }]}>
          {trend.period}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
