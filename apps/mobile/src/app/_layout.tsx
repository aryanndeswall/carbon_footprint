import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';

const queryClient = new QueryClient();

function StackLayout() {
  const { colors } = useAppTheme();
  const { isAuthenticated, isOnboarded, isLoading } = useAuthStore();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'modals' && segments[1] === 'onboarding';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/auth/sign-in');
      }
    } else {
      if (!isOnboarded) {
        if (!inOnboarding) {
          router.replace('/modals/onboarding');
        }
      } else {
        if (inAuthGroup || inOnboarding) {
          router.replace('/(tabs)/dashboard');
        }
      }
    }
  }, [isAuthenticated, isOnboarded, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modals/activity-log" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modals/onboarding" options={{ presentation: 'modal' }} />
      <Stack.Screen name="score" options={{ presentation: 'modal' }} />
      <Stack.Screen name="forecast" />
      <Stack.Screen name="simulator" />
      <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <StackLayout />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
