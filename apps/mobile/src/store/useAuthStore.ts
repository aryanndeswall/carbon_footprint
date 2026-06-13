import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  activitiesLogged: number;
  diet_type?: string;
  transport_preference?: string;
  state_code?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (email: string, token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  setOnboarded: (onboarded: boolean) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isOnboarded: false,
  isLoading: true,
  login: async (email, token, user) => {
    await SecureStore.setItemAsync('session_jwt', token);
    set({ token, user, isAuthenticated: true, isOnboarded: user.activitiesLogged > 0 });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('session_jwt');
    set({ token: null, user: null, isAuthenticated: false, isOnboarded: false });
  },
  setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),
  setUserProfile: (profile) => set((state) => ({
    user: state.user ? { ...state.user, ...profile } : null
  })),
  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('session_jwt');
      if (token) {
        // In a real application, we would decode or fetch profile.
        // For MVP, we seed a mock user if the token exists.
        const mockUser: UserProfile = {
          id: 'mock-uuid-123',
          email: 'user@carbonsense.com',
          name: 'Jane Doe',
          activitiesLogged: 1, // Seeded as onboarded by default
        };
        set({ token, user: mockUser, isAuthenticated: true, isOnboarded: true, isLoading: false });
      } else {
        set({ token: null, user: null, isAuthenticated: false, isOnboarded: false, isLoading: false });
      }
    } catch (error) {
      set({ token: null, user: null, isAuthenticated: false, isOnboarded: false, isLoading: false });
    }
  },
}));
