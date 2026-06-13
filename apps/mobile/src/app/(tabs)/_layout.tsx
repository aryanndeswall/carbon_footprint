import React from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Home, Target, MessageSquare, Users, User, Plus } from 'lucide-react-native';

export default function TabsLayout() {
  const { colors, spacing, roundness, typography } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Mock badge states (in real application, read from stores/queries)
  const uncompletedMissionsCount = 2; 
  const hasUnreadInsight = true;

  // Tab bar height (approx. 60px) + 16px clearance
  const tabBarHeight = 60;
  const fabBottomOffset = tabBarHeight + 16;

  // Hide FAB if on specific screens if they are tabs (e.g. if we are on a tab we don't want it)
  // According to NAV-2, it's only hidden on simulator, which is a root stack screen.
  // So it remains visible on all tabs.
  const showFAB = true;

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text_secondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: tabBarHeight,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            ...typography.caption,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="missions"
          options={{
            title: 'Missions',
            tabBarIcon: ({ color }) => <Target size={22} color={color} />,
            tabBarBadge: uncompletedMissionsCount > 0 ? uncompletedMissionsCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.primary,
              color: '#FFFFFF',
              fontSize: 10,
              lineHeight: 14,
            },
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            title: 'Coach',
            tabBarIcon: ({ color }) => (
              <View>
                <MessageSquare size={22} color={color} />
                {hasUnreadInsight && (
                  <View style={[styles.redDot, { backgroundColor: colors.error }]} />
                )}
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={22} color={color} />,
          }}
        />
      </Tabs>

      {showFAB && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            {
              bottom: fabBottomOffset,
              backgroundColor: colors.primary,
              borderRadius: roundness.xl,
            },
            pressed && styles.fabPressed,
          ]}
          onPress={() => router.push('/modals/activity-log')}
        >
          <Plus size={24} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  redDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
