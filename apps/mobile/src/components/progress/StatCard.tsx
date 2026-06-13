import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../ui/Card';

interface StatCardProps {
  value: string | number;
  label: string;
  subValue?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  subValue,
  icon,
  variant = 'default',
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Card variant={variant} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: spacing.xs }]}>
            {label}
          </Text>
          <Text style={[typography.h2, { color: colors.text_primary }]}>
            {value}
          </Text>
          {subValue && (
            <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 2 }]}>
              {subValue}
            </Text>
          )}
        </View>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  iconContainer: {
    marginLeft: 12,
  },
});
