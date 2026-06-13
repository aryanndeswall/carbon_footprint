import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Settings, ChevronRight } from 'lucide-react-native';

interface SettingsSectionProps {
  onPress: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ onPress }) => {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Card variant="interactive" onPress={onPress} style={styles.card}>
        <View style={styles.row}>
          <Settings size={20} color={colors.text_primary} />
          <Text style={[typography.bodyMedium, { color: colors.text_primary, marginLeft: 12 }]}>
            Settings & Options
          </Text>
        </View>
        <ChevronRight size={18} color={colors.text_secondary} />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
