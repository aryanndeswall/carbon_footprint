import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { AchievementCard } from './AchievementCard';
import { Achievement } from '../types/profile.types';

interface AchievementSectionProps {
  achievements: Achievement[];
}

export const AchievementSection: React.FC<AchievementSectionProps> = ({ achievements }) => {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700', marginBottom: spacing.sm }]}>
        RECENT ACCOMPLISHMENTS
      </Text>

      {achievements.length === 0 ? (
        <View style={[styles.emptyContainer, { borderColor: colors.border }]}>
          <Text style={[typography.body, { color: colors.text_secondary }]}>
            Complete missions to earn achievements.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {achievements.map((ach, index) => (
            <AchievementCard
              key={ach.id}
              achievement={ach}
              index={index}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  list: {
    gap: 10,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
});
