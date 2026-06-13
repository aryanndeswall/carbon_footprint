import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function SignupScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { colors, spacing, typography } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Mock signup for MVP. Sets activitiesLogged: 0 to force onboarding.
      const mockToken = 'mock-jwt-token-12345';
      const mockUser = {
        id: 'mock-user-id',
        email,
        name,
        activitiesLogged: 0, // 0 forces the index guard to redirect to Onboarding
      };
      await login(email, mockToken, mockUser);
      router.replace('/modals/onboarding');
    } catch (err) {
      setError('Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.scrollContent} scrollable>
      <View style={[styles.inner, { padding: spacing.lg }]}>
        <View style={styles.headerContainer}>
          <Text style={[typography.display, { color: colors.primary, marginBottom: spacing.xs }]}>
            Join Carbon Sense
          </Text>
          <Text style={[typography.body, { color: colors.text_secondary }]}>
            Start your sustainability journey today.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            containerStyle={{ marginBottom: spacing.md }}
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={{ marginBottom: spacing.md }}
          />

          <Input
            label="Password"
            placeholder="Choose a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={{ marginBottom: spacing.md }}
          />

          {error ? (
            <Text style={[typography.caption, { color: colors.error, marginBottom: spacing.md }]}>
              {error}
            </Text>
          ) : null}

          <Button title="Create Account" onPress={handleSignup} loading={loading} style={styles.submitBtn} />
        </View>

        <View style={styles.footer}>
          <Text style={[typography.caption, { color: colors.text_secondary }]}>
            Already have an account?{' '}
          </Text>
          <Pressable onPress={() => router.push('/auth/sign-in')}>
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
              Sign In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
    marginBottom: 32,
  },
  submitBtn: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
