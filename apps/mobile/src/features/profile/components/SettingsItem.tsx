import React from 'react';
import { View, StyleSheet, Text, Pressable, Switch } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { LucideIcon, ChevronRight } from 'lucide-react-native';

interface SettingsItemProps {
  label: string;
  icon: LucideIcon;
  iconColor?: string;
  onPress?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  accessibilityLabel?: string;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  icon: IconComponent,
  iconColor,
  onPress,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  accessibilityLabel,
}) => {
  const { colors, typography } = useTheme();

  const activeIconColor = iconColor || colors.text_primary;

  const renderContent = () => (
    <View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
      <View style={styles.leftRow}>
        <IconComponent size={20} color={activeIconColor} />
        <Text style={[typography.bodyMedium, { color: colors.text_primary, marginLeft: 12 }]}>
          {label}
        </Text>
      </View>

      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
          accessibilityLabel={accessibilityLabel || label}
        />
      ) : (
        <ChevronRight size={18} color={colors.text_secondary} />
      )}
    </View>
  );

  if (hasSwitch) {
    return <View style={styles.wrapper}>{renderContent()}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && { backgroundColor: `${colors.border}50` },
      ]}
    >
      {renderContent()}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 48, // 48px touch target
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
