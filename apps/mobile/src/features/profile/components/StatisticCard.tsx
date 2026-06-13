import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';

interface StatisticCardProps {
  label: string;
  value: string | number;
  subtext?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  label,
  value,
  subtext,
}) => {
  const { colors, typography } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <Text style={[typography.h3, { color: colors.text_primary }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, fontWeight: '600' }]}>
        {label}
      </Text>
      {subtext && (
        <Text style={[typography.caption, { color: colors.text_secondary, fontSize: 10, marginTop: 2 }]}>
          {subtext}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    padding: 12,
  },
});
