import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { Avatar } from '../../../components/ui/Avatar';
import { Cloud, CloudOff, Flame } from 'lucide-react-native';

interface DashboardHeaderProps {
  streak: number;
  userName?: string;
  isOffline?: boolean;
  onSyncToggle?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  streak,
  userName = 'Jane Doe',
  isOffline = false,
  onSyncToggle,
}) => {
  const { colors, spacing } = useTheme();
  const router = useRouter();

  // Streak badge pulse animation
  const streakScale = useSharedValue(1);

  useEffect(() => {
    streakScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1000 }),
        withTiming(1.0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [streakScale]);

  const animatedStreakStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  const handleStreakPress = () => {
    // Navigate to profile passport tab where achievements and streaks are displayed
    router.push('/(tabs)/profile');
  };

  return (
    <View style={[styles.container, { paddingVertical: spacing.sm, borderBottomColor: colors.border }]}>
      {/* Profile Avatar on the left */}
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        accessibilityLabel="Go to profile"
        accessibilityRole="button"
        style={({ pressed }) => [styles.avatarPressable, pressed && { opacity: 0.85 }]}
      >
        <Avatar initials={userName} size="sm" />
      </Pressable>

      {/* Streak Badge in the center (Pulsing orange/flame) */}
      <Animated.View style={[styles.streakWrapper, animatedStreakStyle]}>
        <Pressable
          onPress={handleStreakPress}
          accessibilityLabel={`Active streak: ${streak} days`}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.streakBadge,
            { borderColor: colors.streak, backgroundColor: '#FFF7ED' },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Flame size={16} color={colors.streak} />
          <Text style={[styles.streakText, { color: colors.streak }]}>
            {streak} Day Streak
          </Text>
        </Pressable>
      </Animated.View>

      {/* Network Sync status on the right */}
      <Pressable
        onPress={onSyncToggle}
        accessibilityLabel={isOffline ? "You are offline" : "You are online and synced"}
        accessibilityRole="button"
        style={({ pressed }) => [styles.syncPressable, pressed && { opacity: 0.7 }]}
      >
        {isOffline ? (
          <CloudOff size={20} color={colors.error} />
        ) : (
          <Cloud size={20} color={colors.primary} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    height: 52,
  },
  avatarPressable: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  streakWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  syncPressable: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
});
