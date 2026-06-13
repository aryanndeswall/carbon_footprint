import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressRing } from '../../../components/progress/ProgressRing';

interface MissionProgressRingProps {
  percentage: number; // 0 to 100
  size?: number;
}

export const MissionProgressRing: React.FC<MissionProgressRingProps> = ({
  percentage,
  size = 120,
}) => {
  const progressRatio = Math.max(0, Math.min(1.0, percentage / 100));

  return (
    <View style={styles.container}>
      <ProgressRing
        progress={progressRatio}
        size={size}
        strokeWidth={10}
        label="Missions Completed"
        isZeroState={percentage === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
