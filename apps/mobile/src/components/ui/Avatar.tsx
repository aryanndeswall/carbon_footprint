import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { User } from 'lucide-react-native';

interface AvatarProps {
  source?: { uri: string } | number;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  size = 'md',
  style,
}) => {
  const { colors, spacing, typography } = useTheme();

  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { size: 32, textStyle: typography.caption, iconSize: 16 };
      case 'lg':
        return { size: 64, textStyle: typography.h2, iconSize: 32 };
      case 'md':
      default:
        return { size: 48, textStyle: typography.bodyMedium, iconSize: 24 };
    }
  };

  const { size: dimSize, textStyle, iconSize } = getDimensions();

  const containerStyle: ViewStyle = {
    width: dimSize,
    height: dimSize,
    borderRadius: dimSize / 2,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  const imageStyle: ImageStyle = {
    width: dimSize,
    height: dimSize,
  };

  const renderContent = () => {
    if (source) {
      return (
        <Image
          source={source}
          style={imageStyle}
          accessibilityRole="image"
          accessibilityLabel="User profile avatar"
        />
      );
    }

    if (initials) {
      const displayInitials = initials.substring(0, 2).toUpperCase();
      return (
        <Text
          style={[textStyle, { color: colors.text_secondary, fontWeight: '600' }]}
          numberOfLines={1}
        >
          {displayInitials}
        </Text>
      );
    }

    return (
      <User size={iconSize} color={colors.text_secondary} />
    );
  };

  return (
    <View
      style={[containerStyle, style]}
      accessibilityLabel="Avatar profile image"
      accessibilityRole="image"
    >
      {renderContent()}
    </View>
  );
};
