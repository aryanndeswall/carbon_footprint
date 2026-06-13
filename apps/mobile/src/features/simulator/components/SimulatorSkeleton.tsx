import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '../../../components/feedback/Skeleton';
import { useTheme } from '../../../hooks/useTheme';

export function SimulatorSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero skeleton */}
      <Skeleton variant="card" height={72} style={styles.heroSkeleton} />

      <View style={styles.content}>
        {/* Scenario builder skeleton */}
        <View style={[styles.card, { borderColor: colors.border }]}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="card" height={44} />
          <Skeleton variant="card" height={56} />
          <Skeleton variant="card" height={56} />
          <Skeleton variant="card" height={52} />
        </View>

        {/* State cards skeleton */}
        <View style={[styles.card, { borderColor: colors.border }]}>
          <Skeleton variant="card" height={80} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSkeleton: {
    marginHorizontal: 0,
    borderRadius: 0,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
});
