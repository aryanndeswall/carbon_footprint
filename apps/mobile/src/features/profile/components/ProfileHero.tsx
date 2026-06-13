import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { User, Flame, Settings } from 'lucide-react-native';
import { UserProfile } from '../types/profile.types';

interface ProfileHeroProps {
  user: UserProfile;
  onPressSettings: () => void;
  onPressEditProfile?: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  onPressSettings,
  onPressEditProfile,
}) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Card variant="elevated" style={styles.card}>
        
        {/* Settings Quick Access gear icon (F-10) */}
        <Pressable
          onPress={onPressSettings}
          accessibilityRole="button"
          accessibilityLabel="Open Settings"
          style={styles.settingsIcon}
        >
          <Settings size={22} color={colors.text_primary} />
        </Pressable>

        {/* User details layout */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
            <User size={36} color="#FFFFFF" />
          </View>
          
          <Text style={[typography.h2, { color: colors.text_primary, marginTop: spacing.sm }]}>
            {user.name}
          </Text>
          
          <Text style={[typography.caption, { color: colors.text_secondary }]}>
            {user.email}
          </Text>
        </View>

        {/* Sustainability Score & Streak Banner */}
        <View style={styles.badgeRow}>
          {/* Sustainability Score */}
          <View style={[styles.pillBadge, { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }]}>
            <Text style={[typography.caption, { color: colors.primary_dim, fontWeight: '700' }]}>
              SCORE: {user.sustainabilityScore}
            </Text>
          </View>

          {/* Current Streak */}
          <View style={[styles.pillBadge, { backgroundColor: '#FFF7ED', borderColor: colors.streak }]}>
            <Flame size={14} color={colors.streak} />
            <Text style={[typography.caption, { color: colors.streak, fontWeight: '700', marginLeft: 4 }]}>
              {user.currentStreak} Day Streak
            </Text>
          </View>
        </View>

        <Text style={[typography.caption, { color: colors.text_secondary, marginTop: spacing.md }]}>
          Member Since {user.memberSince}
        </Text>

        {onPressEditProfile && (
          <Button
            title="Edit Profile"
            onPress={onPressEditProfile}
            variant="secondary"
            style={styles.editButton}
            textStyle={{ fontSize: 13 }}
            accessibilityLabel="Edit Profile Info"
          />
        )}

      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  settingsIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButton: {
    height: 32,
    paddingHorizontal: 16,
    marginTop: 16,
  },
});
