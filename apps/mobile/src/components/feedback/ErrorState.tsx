import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  style,
}) => {
  const { colors, spacing, typography, roundness } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          padding: spacing.md,
          borderColor: colors.error,
          backgroundColor: colors.error_container,
          borderRadius: roundness.md,
        },
        style,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${message}`}
    >
      <Text style={[typography.body, { color: colors.error_text, textAlign: 'center', marginBottom: spacing.sm }]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          title="Retry"
          variant="secondary"
          onPress={onRetry}
          style={styles.button}
          textStyle={{ color: colors.error_text }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
  },
  button: {
    height: 36,
    paddingHorizontal: 16,
  },
});
