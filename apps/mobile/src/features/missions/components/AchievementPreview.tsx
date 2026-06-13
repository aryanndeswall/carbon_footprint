import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui/Card';
import { AchievementPreview as AchievementPreviewType } from '../types/missions.types';
import { Medal, ArrowRight } from 'lucide-react-native';

interface AchievementPreviewProps {
  achievement: AchievementPreviewType;
}

export const AchievementPreview: React.FC<AchievementPreviewProps> = ({ achievement }) => {
  const { colors, typography } = useTheme();

  return (
    <Card variant="interactive" style={styles.card}>
      <View style={styles.row}>
        
        {/* Medal Emblem */}
        <View style={[styles.emblemContainer, { backgroundColor: '#FFF7ED', borderColor: colors.streak }]}>
          <Medal size={22} color={colors.streak} />
        </View>

        {/* Text Details */}
        <View style={styles.details}>
          <Text style={[typography.caption, { color: colors.text_secondary, fontWeight: '700' }]}>
            UPCOMING ACHIEVEMENT
          </Text>
          <Text style={[typography.h3, { color: colors.text_primary, marginTop: 2 }]}>
            {achievement.title}
          </Text>
          <Text style={[typography.caption, { color: colors.primary, marginTop: 4, fontWeight: '700' }]}>
            {achievement.remainingCount} missions remaining to unlock
          </Text>
        </View>

        <ArrowRight size={18} color={colors.text_secondary} />

      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emblemContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
});
