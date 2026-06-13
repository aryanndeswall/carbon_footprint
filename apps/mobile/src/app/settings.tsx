import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { X } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { colors, spacing, typography } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/sign-in');
  };

  return (
    <ScreenContainer style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, padding: spacing.md }]}>
        <Text style={[typography.h3, { color: colors.text_primary }]}>
          Settings
        </Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={colors.text_primary} />
        </Pressable>
      </View>

      <View style={{ padding: spacing.lg, gap: 16 }}>
        <Card style={styles.card}>
          <Text style={[typography.bodyMedium, { color: colors.text_primary, fontWeight: '700', marginBottom: 4 }]}>
            Carbon Sense Mobile v1.0
          </Text>
          <Text style={[typography.caption, { color: colors.text_secondary }]}>
            Built with React Native & Expo. All rights reserved.
          </Text>
        </Card>

        <Button title="Sign Out" variant="danger" onPress={handleLogout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  card: {
    padding: 16,
  },
});
