# Frontend Architecture Specification: Mobile Client

This document defines the complete and authoritative frontend architecture for the Carbon Footprint Awareness Platform mobile application, built using **React Native**, **Expo SDK**, and **TypeScript**.

---

## 1. Core Technology Stack

* **Framework**: React Native (Expo SDK 51+)
* **Navigation**: Expo Router (v3+) - File-based routing with static layout optimization.
* **State Management**: 
  * **Server State**: TanStack Query (React Query v5) for query caching, synchronization, mutations, and optimistic updates.
  * **Local UI State**: Zustand (v4) for global theme, authentication session, and offline queue storage.
* **Storage**:
  * **Secure Storage**: `expo-secure-store` for JWT tokens and auth credentials.
  * **Fast Local Cache**: `react-native-mmkv` for high-performance key-value local storage (Zustand persistence).
* **Styling**: Vanilla React Native `StyleSheet` with design token values.
* **Animations**: `react-native-reanimated` (v3) for micro-animations and layout transitions.
* **Connectivity**: `@react-native-community/netinfo` for network status monitoring.

---

## 2. Directory Layout & Folder Structure

```text
frontend/
├── app/                          # Expo Router Entrypoints (Routes)
│   ├── (auth)/                   # Authentication Group
│   │   ├── _layout.tsx           # Auth Layout (Redirects if logged in)
│   │   ├── login.tsx             # Login Screen
│   │   └── signup.tsx            # Signup Screen
│   ├── (onboarding)/             # Onboarding Group
│   │   ├── _layout.tsx
│   │   └── index.tsx             # Onboarding Form Screen
│   ├── (tabs)/                   # Protected Tab Navigator Group
│   │   ├── _layout.tsx           # Tab Shell (Theme context injection)
│   │   ├── index.tsx             # Carbon Dashboard Screen
│   │   ├── missions.tsx          # Daily Missions Screen
│   │   ├── coach.tsx             # AI Coach Chat Screen
│   │   └── profile.tsx           # User Profile & Settings Screen
│   ├── activity/                 # Activities Stack
│   │   ├── log.tsx               # Add Activity Screen
│   │   └── [id].tsx              # Activity Breakdown Details Modal
│   ├── _layout.tsx               # Root App Shell (Providers & Auth Listener)
│   └── index.tsx                 # Entry Guard Route (Auth router switch)
├── src/                          # Application Source code
│   ├── components/               # Shared Reusable UI Components
│   │   ├── common/               # Buttons, Inputs, Cards, Text
│   │   ├── feedback/             # Skeleton Loaders, Empty States, Modals
│   │   └── dashboard/            # ProgressRings, Charts, ActivityList
│   ├── context/                  # Context Providers (Theme, Auth wrapper)
│   ├── hooks/                    # Custom React Hooks (queries, mutations)
│   ├── services/                 # Infrastructure and Clients
│   │   ├── api.ts                # Axios Client Instance with Interceptors
│   │   ├── supabase.ts           # Supabase Client Wrapper
│   │   └── sync.ts               # Offline Queue Sync Orchestrator
│   ├── store/                    # Zustand Global Stores
│   │   ├── useAuthStore.ts       # Auth Session State
│   │   ├── useThemeStore.ts      # App Theme Preferences
│   │   └── useSyncStore.ts       # Offline Queue Store
│   ├── styles/                   # Design Tokens
│   │   ├── colors.ts             # Palette (light / dark)
│   │   ├── spacing.ts            # Spacing grid (4px base)
│   │   └── typography.ts         # Google Fonts Outfit/Inter configuration
│   ├── types/                    # TypeScript Typings and Schemas
│   └── utils/                    # Helper Utilities
```

---

## 3. Screen Hierarchy & Navigation Flow

### Navigation Guarding State Machine
The root route `app/_layout.tsx` coordinates auth status listeners and routes traffic conditionally:

```text
                      ┌─────────────────────────┐
                      │    Root App Startup     │
                      └────────────┬────────────┘
                                   │
                                   ▼
                      ┌─────────────────────────┐
                      │  Is Authenticated?      │
                      └─────┬─────────────┬─────┘
                            │             │
                       (No) │             │ (Yes)
                            ▼             ▼
               ┌────────────────┐   ┌────────────────────────┐
               │  (Auth) Stack  │   │ Onboarding Completed?  │
               │  Login/Signup  │   └─────┬─────────────┬────┘
               └────────────────┘         │             │
                                     (No) │             │ (Yes)
                                          ▼             ▼
                              ┌────────────────┐   ┌────────────────┐
                              │  (Onboarding)  │   │  (Tabs) Shell  │
                              │  Preference    │   │  Dashboard,    │
                              │  Ingestion     │   │  Missions,     │
                              └────────────────┘   │  Coach, Profile│
                                                   └────────────────┘
```

---

## 4. State Management & Data Sync (TanStack Query)

### Server State Strategy
All API data fetches and updates are wrapped in custom React hooks leveraging **TanStack Query**. This minimizes unnecessary HTTP requests and enables instant cache invalidation.

```typescript
// Example Custom Hook: src/hooks/useFootprint.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useTodayFootprint = () => {
  return useQuery({
    queryKey: ['footprints', 'today'],
    queryFn: async () => {
      const response = await api.get('/footprints/today');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache valid for 5 minutes
  });
};
```

### Local Client State Strategy (Zustand)
Zustand is used for client-only state variables that require local persistence, such as user settings, active session variables, and the offline activity log queue.

```typescript
// Persistent Zustand Store: src/store/useSyncStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/storage'; // MMKV wrapper

interface OfflineActivity {
  id: string;
  category: string;
  activity_type: string;
  quantity: number;
  unit: string;
  created_at: string;
}

interface SyncState {
  queue: OfflineActivity[];
  enqueueActivity: (activity: Omit<OfflineActivity, 'id' | 'created_at'>) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      enqueueActivity: (activity) => set((state) => ({
        queue: [...state.queue, {
          ...activity,
          id: Math.random().toString(36).substring(7),
          created_at: new Date().toISOString()
        }]
      })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'sync-queue-storage',
      storage: createJSONStorage(() => zustandStorage)
    }
  )
);
```

---

## 5. Authentication Flow (Supabase Auth Integration)

* **Session Management**: Session persistence is handled by Supabase Client SDK and synced locally using Expo Secure Store.
* **Token Ingestion**:
  On startup, Supabase triggers `onAuthStateChange`. If a session exists, the JWT token is extracted, stored securely, and configured as the default bearer header in the Axios client:
  ```typescript
  // src/services/api.ts
  import axios from 'axios';
  import * as SecureStore from 'expo-secure-store';

  export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 10000,
  });

  api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('session_jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```

---

## 6. Offline Support & Sync Strategy

### 1. Connection Monitoring
The app wraps the main screen container with a NetInfo listener. Global online status is exposed via a React hook (`useIsOnline`). When offline, a top-level network status banner is animated into view.

### 2. Offline Queueing
When offline, if a user submits a log on the `Add Activity` screen:
1. The request is intercepted.
2. The payload is written to the **Zustand Offline Queue** (`useSyncStore`).
3. An optimistic update is pushed to TanStack Query's footprint cache (simulating the addition locally).
4. The user receives a success dialog: *"Logged offline. We will sync this once you're back online!"*

### 3. Background Sync Manager
When connection status recovers (`isOnline: true`):
1. The Sync Orchestrator (`src/services/sync.ts`) is invoked.
2. It reads the queued activities, sending POST requests sequentially to `/api/v1/activities`.
3. If a request fails with a validation error, it is discarded, and a warning is logged.
4. On completion of the queue sweep, it clears the Zustand queue, triggers a refresh query for footprints/streaks caches (`queryClient.invalidateQueries()`), and displays a success toast.

---

## 7. UI/UX Specifications & Core Screens

### 7.1 Design & Theme Tokens

#### Colors (Vanilla HSL Tokens)
* **Light Palette**:
  * Background: `hsl(210, 20%, 98%)`
  * Card Background: `hsl(0, 0%, 100%)`
  * Primary Green (Climate Action): `hsl(142, 72%, 29%)`
  * Text Primary: `hsl(222, 47%, 11%)`
  * Border: `hsl(214, 32%, 91%)`
* **Dark Palette**:
  * Background: `hsl(222, 47%, 11%)`
  * Card Background: `hsl(224, 71%, 4%)`
  * Primary Green: `hsl(142, 69%, 45%)`
  * Text Primary: `hsl(210, 40%, 98%)`
  * Border: `hsl(217, 32%, 17%)`

---

### 7.2 Carbon Dashboard Screen (`app/(tabs)/index.tsx`)
* **Core Elements**:
  * **Today's Emissions Ring**: A circular SVG progress ring indicating today's footprint (e.g. 3.42 kg CO₂) contrasted against the daily target threshold (e.g. 5.0 kg CO₂).
  * **Category Cards**: Dynamic vertical cards for `Transport`, `Food`, `Electricity`, and `Shopping`. Each card highlights the raw value (e.g. 1.92 kg CO₂) and has a progress bar matching the category's footprint distribution.
  * **Quick Actions**: Horizontal quick log buttons for common activities (e.g., "Car 10km", "Veg Meal").
  * **Recent History List**: Vertical scrolling history list showing the last 5 activities, complete with skeleton loading states during refresh.

### 7.3 Daily Missions Screen (`app/(tabs)/missions.tsx`)
* **Core Elements**:
  * **Featured Daily Mission Card**: High-contrast card showing today's mission headline, category, difficulty tag, and estimated carbon savings.
  * **Mission Actions**: Dual action buttons: "Mark Completed" and "Skip Mission".
  * **Weekly Savings Progress Chart**: A custom bar chart showing carbon saved over the past 7 days via completed missions.
  * **History Accordion**: List of past assigned missions, categorized by "Completed" and "Missed".

### 7.4 Streak & Habits Screen (`app/(tabs)/profile.tsx` & Headers)
* **Core Elements**:
  * **Active Streak Badge**: Highlighted indicator showing the active streak count (e.g. 6 Days) with flame animations.
  * **Streak Calendar**: A monthly calendar showing days colored green (activities logged), blue (freeze applied), and grey (missed/inactive).
  * **Freeze Management Card**: Displays available streak freezes (e.g., "1 Freeze Remaining") with a manual trigger button: "Protect Today's Streak".
  * **Streak Milestones List**: Displays upcoming milestones (e.g., "10-day streak: Green Champion badge").

### 7.5 AI Coach Chat Screen (`app/(tabs)/coach.tsx`)
* **Core Elements**:
  * **Message Logs**: Thread displaying conversation history with context-aware coach bubbles (containing markdown formatting).
  * **Typing Indicator**: Animated loading indicator showing when the coach is preparing a response.
  * **Suggestions Header**: Horizontal chip list with quick questions like *"How did I do this week?"* or *"Give me tips on home energy savings"*.
  * **Network Fallback Banner**: Disables inputs and displays a cached recommendation card if the backend is unreachable.

---

## 8. Feedback states

### 8.1 Loading States (Skeleton Shimmers)
* Skeletons are used during content loads instead of spinner overlay HUDs. Skeletons replicate card layout structures with animated opacity loops to improve perceived performance.

### 8.2 Empty States
* Empty screens (e.g. no activity log history, empty mission logs) display:
  1. A minimal custom illustration.
  2. A friendly status message (e.g. *"You haven't logged any activities today."*).
  3. A primary Action button that immediately routes to the ingestion wizard (e.g., *"Log Transit"*).

### 8.3 Error Banners
* Error banners are injected inline inside the affected card or component, providing a **Retry** button rather than crashing the whole view or displaying full-screen error overlays.
