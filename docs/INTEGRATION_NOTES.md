# INTEGRATION_NOTES.md

## Executive Summary

This document serves as the guide for the upcoming FE-19 Backend Integration phase of the Carbon Sense mobile application. Based on a full-stack audit of current frontend component implementations and backend FastAPI routers, the readiness metrics are outlined below:

* **Overall Integration Readiness Score:** 65/100
* **Critical Issues:** 3
* **High-Risk Issues:** 4
* **Medium-Risk Issues:** 2

While the core auth middleware, activities database, and carbon engine are functional, significant discrepancies exist regarding mock-to-prod API aggregation, missing tables (weekly missions and goals), and casing differences.

---

## Critical Issues

### Missing Consolidated Summary Endpoints
* **Severity:** Critical
* **Affected Screen:** Dashboard, Missions, Coach, Profile, Simulator
* **Affected Endpoint:** `GET /dashboard`, `GET /missions`, `GET /coach`, `GET /profile`, `GET /simulator/baseline`
* **Problem:** Frontend features rely on single unified queries (e.g., `useDashboardData` requesting `/dashboard`) which return composite mock objects. The backend lacks these gateway routes, exposing only granular endpoints (e.g., `/footprints/today`, `/streaks/current`).
* **Impact:** Running in production will trigger runtime API failures (`404 Not Found`) on page load.
* **Recommended Fix:** 
  * *Option A (Backend):* Implement dashboard, mission, and profile aggregator routers that query multiple repositories and return a unified payload.
  * *Option B (Frontend):* Refactor queries using concurrent TanStack `useQuery` hooks and merge the results client-side.

---

### Decimal String Parsing Crash
* **Severity:** Critical
* **Affected Screen:** Dashboard, Profile, Simulator
* **Affected Endpoint:** `/api/v1/activities`, `/api/v1/simulations`
* **Problem:** Backend returns precise numerical columns (emissions, quantity, carbon reduction) as string-serialized decimals (e.g., `"12.5000"`) in JSON. The frontend TypeScript interfaces expect JS `number` types.
* **Impact:** Executing numerical or string formatting functions (such as `.toFixed()`) on strings will cause immediate runtime crashes in React Native.
* **Recommended Fix:** Add type casting inside frontend API response adapters or interceptors (e.g., `parseFloat(val)`).

---

### Mismatched Category and Difficulty Casing
* **Severity:** Critical
* **Affected Screen:** Dashboard, Missions, Coach, Simulator
* **Affected Endpoint:** `/api/v1/activities`, `/api/v1/missions/today`, `/api/v1/simulations`
* **Problem:** Frontend components map UI icons, colors, and badge assets using capitalized categories and difficulty states (e.g., `'Transport'`, `'Food'`, `'Easy'`). The backend models and responses use lowercase values (e.g., `'transport'`, `'food'`, `'easy'`).
* **Impact:** Missing icons, broken layouts, or failure to render badges properly.
* **Recommended Fix:** Create a frontend mapping utility inside API client adapters to normalize casing before returning payloads to hooks.

---

## High-Risk Issues

### Missing Weekly Missions Database
* **Severity:** High
* **Affected Features:** Missions Screen (Weekly Missions tab)
* **Problem:** The database and backend service layer only support daily mission assignments via the `UserMission` model. No weekly milestones model or tracking logic exists.
* **Recommended Fix:** 
  * Create a `weekly_missions` schema and database table to track week-long targets.
  * Alternatively, disable weekly missions temporarily in the frontend UI during early integration.

---

### Missing Goals Database
* **Severity:** High
* **Affected Features:** Profile Screen (Goals section)
* **Problem:** The backend lacks a `user_goals` database table, Pydantic schemas, or CRUD routes to manage and persist goals.
* **Recommended Fix:** Design a `user_goals` table linked to user profiles and expose `GET/POST/DELETE /api/v1/users/goals` endpoints.

---

### Missing Chat History Persistence
* **Severity:** High
* **Affected Features:** AI Coach Screen (ChatMessage conversation history)
* **Problem:** No database table exists to persist chat history between the user and the Coach. Dialogue history resides only in transient React state and is lost on reload.
* **Recommended Fix:** Create a `coach_chat_messages` table and add `/api/v1/ai/chat/history` to load prior sessions.

---

### Missing Mission Schema Properties
* **Severity:** High
* **Affected Features:** Dashboard (DailyMissionCard), Missions Screen
* **Problem:** Backend `UserMissionResponseData` omits the mission `description` field, and the database has no score rewards (`rewardScore`/`points`) field.
* **Recommended Fix:** 
  * Update `UserMissionResponseData` schema to select and return template descriptions.
  * Add a `points` column to `mission_templates` and update the database seeding scripts.

---

## Field Naming Mismatches

| Frontend Field | Backend Field | Affected Component | Risk |
| :--- | :--- | :--- | :--- |
| `score` / `sustainabilityScore` | `overall_score` | `HeroScoreCard`, `ProfileHero` | Score ring rendering failure (`NaN`) |
| `avatarUrl` | `avatar_url` | `DashboardHeader`, `ProfileHero` | Image fails to render, broken link |
| `currentStreak` / `streak` | `current_streak` | `DashboardHeader`, `ProfileHero` | Streak display showing `0` or `undefined` |
| `longestStreak` | `longest_streak` | `StatisticsSection` | Longest streak displays as `0` |
| `streak_freezes` | `freeze_count` | `DashboardHeader`, `Simulator` | Freeze badge shows undefined |
| `timestamp` | `created_at` | `RecentActivityRow` | Timestamps display as `Invalid Date` |
| `rewardCarbon` / `carbonReward` | `estimated_co2_saving` | `DailyMissionCard`, `MissionCard` | Reward badge displays `NaN kg` |
| `fullText` | `full_text` | `AIExplanationCard` | AI explanation returns undefined |
| `'Energy'` category | `'electricity'` / `'electricity_co2'` | `CategoryCard` | Progress calculations failing |
| `'Transport'`, `'Food'`, `'Easy'` | `'transport'`, `'food'`, `'easy'` | `DailyMissionCard`, `Badge`, `Chip` | Styling/icon lookup breaks |

---

## Missing Backend Features

| Feature | Backend Status | Frontend Status | Priority |
| :--- | :--- | :--- | :--- |
| Weekly Missions | Unimplemented | Fully Mocked | Medium |
| Goals System | Unimplemented | Fully Mocked | Low |
| Chat Persistence | Unimplemented | Transient State | Low |
| Profile Statistics | Unimplemented (No stats API) | Mocked in `ProfileSummary` | Medium |
| Dashboard Summary Endpoint | Unimplemented | Calls mock `/dashboard` | High |

---

## Runtime Risk Checklist

### Null Avatar URL
* **Problem:** Backend returns `avatar_url: null` for users who haven't uploaded an avatar image.
* **Likely Error:** React Native image component fails to load, resulting in layout shift or empty boxes.
* **Recommended Guard Clause:**
  ```typescript
  const avatarSource = user.avatarUrl ? { uri: user.avatarUrl } : require('@/assets/images/default-avatar.png');
  ```

### Undefined Mission Description
* **Problem:** `UserMissionResponseData` does not return `description`.
* **Likely Error:** Displays `undefined` on card details.
* **Recommended Guard Clause:**
  ```typescript
  const descriptionText = mission.description || 'Complete this task to save carbon!';
  ```

### Missing Reward Score
* **Problem:** Mission templates do not contain score rewards in the database.
* **Likely Error:** Renders `+NaN Points` in reward badges.
* **Recommended Guard Clause:**
  ```typescript
  const displayScore = mission.rewardScore ?? (mission.difficulty === 'Easy' ? 3 : mission.difficulty === 'Medium' ? 5 : 8);
  ```

### Decimal String Parsing
* **Problem:** Numeric columns are returned as string decimals (e.g., `"1.25"`).
* **Likely Error:** Math operations or `.toFixed()` crash with type errors.
* **Recommended Guard Clause:**
  ```typescript
  const parseNumericValue = (val: any): number => typeof val === 'string' ? parseFloat(val) : val ?? 0;
  ```

### Empty AI Explanation
* **Problem:** Gemini API timeout or quota block returns `ai_explanation: null`.
* **Likely Error:** Destructuring properties like `aiExplanation.action` throws `TypeError`.
* **Recommended Guard Clause:**
  ```typescript
  const explanation = result.aiExplanation || { action: '', impact: '', recommendation: '', fullText: 'Simulation successful.' };
  ```

### Empty Unlocked Achievements List
* **Problem:** Brand new user retrieves an empty array of unlocked badges.
* **Likely Error:** Array index lookup `achievements[0]` crashes when trying to read properties of undefined.
* **Recommended Guard Clause:**
  ```typescript
  const latestBadge = achievements && achievements.length > 0 ? achievements[0].badge : '🌱';
  ```

---

## FE-19 Integration Order

The recommended implementation order follows a logical data-dependency pipeline:

1. **Authentication:** Setup token storage via `SecureStore` and inject headers in axios interceptors. *Why:* Essential to validate JWT token for all protected endpoints.
2. **User Profile & Preferences:** Fetch profile and preference context first. *Why:* Standardizes state across other screens.
3. **Activities Logging:** Hook up activity database logging modal. *Why:* Updates footprints and score tables immediately.
4. **Dashboard:** Fetch today's footprints, streaks, and category breakdowns. *Why:* Employs the data generated by activities logging.
5. **Missions:** Hook up daily mission assignments, completions, and streak updates. *Why:* Builds on top of streaks and activities database triggers.
6. **Achievements:** Map unlocked achievements progress and statistics on profile. *Why:* Fueled by logged activities and completed missions count.
7. **AI Coach:** Map daily AI insights, recommendations, and weekly summary. *Why:* References logged activities history.
8. **What-If Simulator:** Integrate scenario running and saving. *Why:* Utilizes calculated baseline emissions.
9. **Settings:** Integrate profile and preference updating. *Why:* Interacts directly with core onboarding values.

---

## FE-19 Definition of Done

### Authentication & Onboarding
- [ ] Supabase sign-in/up routes active and store tokens to SecureStore
- [ ] JWT interceptor automatically appends Bearer token on API requests
- [ ] Complete Onboarding POST endpoint successfully stores preferences and transitions to dashboard

### Dashboard Screen
- [ ] Daily score ring displays overall score from backend
- [ ] Today's footprints show category metrics derived from backend calculations
- [ ] Recent Activity List renders database activity logs with timestamps

### Missions Screen
- [ ] Daily Mission Card pulls and updates status from today's backend route
- [ ] Mission completion POST requests update streaks and user scores
- [ ] Completed missions list displays paginated history

### AI Coach Screen
- [ ] CoachHero displays latest daily coach insight body
- [ ] AI recommendation actions link directly to corresponding activity logging category modal
- [ ] Weekly summary card displays rolling progress explanation

### What-If Simulator Screen
- [ ] Baseline footprint loaded from backend today footprint summary
- [ ] Sliders submit payload to simulations engine and update metrics
- [ ] Saved scenarios successfully persist to backend database

### Profile & Settings
- [ ] User profile displays real names and member duration timestamps
- [ ] Settings form reads and successfully updates preferences on the database
- [ ] Achievements list renders database badges and progress meters

### Error Handling & Resiliency
- [ ] Guard clauses implemented for null properties, missing fields, and type conversions
- [ ] Offline caching via TanStack Query and MMKV enables layout rendering when offline
- [ ] User alerts appear when network mutations fail
