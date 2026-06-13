import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { QuickActionCard } from './QuickActionCard';

export const QuickActionsRow: React.FC = () => {
  const router = useRouter();

  const handleActionPress = (action: string) => {
    switch (action) {
      case 'Metro Ride':
        router.push('/modals/activity-log?category=Transport');
        break;
      case 'Bus Commute':
        router.push('/modals/activity-log?category=Transport');
        break;
      case 'Vegetarian Meal':
        router.push('/modals/activity-log?category=Food');
        break;
      case 'Electricity Usage':
        router.push('/modals/activity-log?category=Electricity');
        break;
      case 'Simulate':
        router.push('/simulator');
        break;
      default:
        router.push('/modals/activity-log');
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      <QuickActionCard label="Metro Ride" onPress={() => handleActionPress('Metro Ride')} />
      <QuickActionCard label="Vegetarian Meal" onPress={() => handleActionPress('Vegetarian Meal')} />
      <QuickActionCard label="Electricity Usage" onPress={() => handleActionPress('Electricity Usage')} />
      <QuickActionCard label="Bus Commute" onPress={() => handleActionPress('Bus Commute')} />
      {/* P1 Addition: Simulate Quick Action Chip */}
      <QuickActionCard label="Simulate" onPress={() => handleActionPress('Simulate')} isSimulate />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingRight: 16,
  },
});
