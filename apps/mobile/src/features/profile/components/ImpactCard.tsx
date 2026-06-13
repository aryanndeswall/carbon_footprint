import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { LucideIcon } from 'lucide-react-native';

interface ImpactCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
}

export const ImpactCard: React.FC<ImpactCardProps> = ({
  title,
  value,
  icon: IconComponent,
  iconColor,
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <IconComponent size={20} color={iconColor} />
      </View>
      <Text style={[typography.h2, { color: colors.text_primary, marginTop: spacing.sm }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.text_secondary, marginTop: 4, textAlign: 'center' }]}>
        {title}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
