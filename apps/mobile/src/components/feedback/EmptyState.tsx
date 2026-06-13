import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  illustration?: React.ReactNode;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  actionTitle,
  onActionPress,
  style,
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl }, style]}>
      {illustration && <View style={styles.illustrationContainer}>{illustration}</View>}
      <Text style={[typography.h3, { color: colors.text_primary, textAlign: 'center', marginBottom: spacing.sm }]}>
        {title}
      </Text>
      <Text style={[typography.body, { color: colors.text_secondary, textAlign: 'center', marginBottom: spacing.lg }]}>
        {description}
      </Text>
      {actionTitle && onActionPress && (
        <Button title={actionTitle} onPress={onActionPress} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  illustrationContainer: {
    marginBottom: 24,
  },
  button: {
    minWidth: 160,
  },
});
