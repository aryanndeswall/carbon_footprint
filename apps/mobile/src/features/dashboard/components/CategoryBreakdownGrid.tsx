import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CategoryCard } from './CategoryCard';
import { CategoryMetric } from '../types/dashboard.types';

interface CategoryBreakdownGridProps {
  categories: CategoryMetric[];
}

export const CategoryBreakdownGrid: React.FC<CategoryBreakdownGridProps> = ({ categories }) => {
  return (
    <View style={styles.grid}>
      {categories.map((category) => (
        <CategoryCard key={category.name} category={category} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
