import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface LoadingOverlayProps {
  visible?: boolean;
  fullscreen?: boolean;
  message?: string;
  style?: ViewStyle;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible = true,
  fullscreen = false,
  message,
  style,
}) => {
  const { colors, spacing, typography, roundness } = useTheme();

  if (!visible) return null;

  const renderContent = () => (
    <View
      style={[
        styles.container,
        fullscreen
          ? { backgroundColor: 'rgba(0,0,0,0.4)', flex: 1, justifyContent: 'center' }
          : [
              styles.sectionContainer,
              {
                backgroundColor: colors.surface,
                borderRadius: roundness.lg,
                borderColor: colors.border,
                padding: spacing.lg,
              },
            ],
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={message || "Loading..."}
    >
      <View
        style={[
          styles.innerBox,
          !fullscreen && { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
          fullscreen && {
            backgroundColor: colors.surface,
            borderRadius: roundness.lg,
            padding: spacing.xl,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
          },
        ]}
      >
        <ActivityIndicator size={fullscreen ? 'large' : 'small'} color={colors.primary} />
        {message && (
          <Text
            style={[
              typography.bodyMedium,
              {
                color: colors.text_primary,
                marginTop: spacing.md,
                textAlign: 'center',
                fontWeight: '600',
              },
            ]}
          >
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (fullscreen) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        {renderContent()}
      </Modal>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 120,
  },
  innerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
});
