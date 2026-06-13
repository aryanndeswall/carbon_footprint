import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat' | 'interactive';
  radiusSize?: 'md' | 'lg' | 'xl';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'flat',
  radiusSize = 'lg',
  header,
  footer,
  style,
  onPress,
  accessibilityLabel,
}) => {
  const { colors, spacing, roundness } = useTheme();

  const getCardStyles = (): ViewStyle => {
    const borderRadius = roundness[radiusSize];
    const base: ViewStyle = {
      borderRadius,
      padding: spacing.md,
      backgroundColor: colors.surface,
    };

    switch (variant) {
      case 'elevated':
      case 'interactive':
        return {
          ...base,
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
          elevation: 2,
        };
      case 'outlined':
        return {
          ...base,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'default':
      case 'flat':
      default:
        return {
          ...base,
          backgroundColor: colors.surface,
        };
    }
  };

  const renderContent = () => (
    <>
      {header && (
        <View style={[styles.headerContainer, { borderBottomColor: colors.border, marginBottom: spacing.sm }]}>
          {header}
        </View>
      )}
      <View style={styles.bodyContainer}>
        {children}
      </View>
      {footer && (
        <View style={[styles.footerContainer, { borderTopColor: colors.border, marginTop: spacing.sm }]}>
          {footer}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          getCardStyles(),
          style,
          pressed && { opacity: 0.95, transform: [{ scale: 0.98 }] },
        ]}
      >
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <View style={[getCardStyles(), style]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
  bodyContainer: {
    width: '100%',
  },
  footerContainer: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
