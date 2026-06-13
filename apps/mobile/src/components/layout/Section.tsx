import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  title,
  subtitle,
  children,
  style,
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.lg }, style]}>
      <View style={{ marginBottom: spacing.sm }}>
        <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700' }]}>
          {title.toUpperCase()}
        </Text>
        {subtitle && (
          <Text style={[typography.bodyMedium, { color: colors.text_secondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
