import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { ProgressBar } from '../../../components/progress/ProgressBar';
import { CategoryMetric } from '../types/dashboard.types';
import { Car, Utensils, Zap, ShoppingBag } from 'lucide-react-native';

interface CategoryCardProps {
  category: CategoryMetric;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const { colors, spacing, typography } = useTheme();

  // Get color and icon based on category name
  const getCategoryTheme = () => {
    switch (category.name) {
      case 'Transport':
        return { icon: Car, color: colors.primary };
      case 'Food':
        return { icon: Utensils, color: colors.warning };
      case 'Energy':
        return { icon: Zap, color: colors.simulation };
      case 'Shopping':
        return { icon: ShoppingBag, color: colors.error };
      default:
        return { icon: Zap, color: colors.primary };
    }
  };

  const { icon: IconComponent, color } = getCategoryTheme();

  return (
    <Card variant="outlined" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconComponent size={18} color={color} />
        </View>
        <Text style={[typography.bodyMedium, { color: colors.text_secondary, fontWeight: '600', marginLeft: 8 }]}>
          {category.name}
        </Text>
      </View>

      <Text style={[typography.h3, { color: colors.text_primary, marginTop: spacing.sm }]}>
        {category.value.toFixed(1)} <Text style={typography.caption}>kg CO₂</Text>
      </Text>

      {/* Mini Progress Indicator */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={category.progress} color={color} height={6} />
        <View style={styles.limitLabelContainer}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontSize: 10 }]}>
            {Math.round(category.progress * 100)}% of limit ({category.limit} kg)
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    flex: 1,
    minWidth: '45%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: 10,
    width: '100%',
  },
  limitLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});
