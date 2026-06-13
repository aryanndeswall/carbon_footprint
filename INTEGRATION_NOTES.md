# INTEGRATION_NOTES.md

## Executive Summary

- Overall integration readiness score: 65/100
- Number of critical issues: 3
- Number of high-risk issues: 4
- Number of medium-risk issues: 2

---

## Critical Issues

### Missing Consolidated Summary Endpoints

Severity:
Critical

Affected Screen:
Dashboard, Missions, Coach, Profile, Simulator

Affected Endpoint:
`GET /dashboard`, `GET /missions`, `GET /coach`, `GET /profile`, `GET /simulator/baseline`

Problem:
The mobile frontend features utilize consolidated data fetching hooks (e.g., `useDashboardData` and `useMissionsData`) that call single aggregated endpoints. The backend does not expose these routes; it only provides granular endpoints like `/footprints/today`, `/streaks/current`, `/missions/today`, and `/users/me`.

Impact:
Immediate API failures (`404 Not Found`) on loading major tabs. Fallback mocks will be bypassed in production, leading to broken screens.

Recommended Fix:
Either refactor the frontend hooks to perform concurrent queries to the granular endpoints and aggregate results client-side, or implement backend summary routers (e.g., `GET /api/v1/dashboard/summary`) that fetch and consolidate data from multiple service layers.

---

### Decimal String Parsing Crash

Severity:
Critical

Affected Screen:
Dashboard, Profile, Simulator

Affected Endpoint:
`/api/v1/activities`, `/api/v1/simulations`

Problem:
The database stores numerical fields (emissions, quantity, carbon savings) as Numeric/Decimal types. The backend API serializes these as string decimals (e.g., `"12.5000"`). The frontend TypeScript interfaces expect numbers.

Impact:
Performing mathematical calculations or executing string formatting operations (e.g. `.toFixed()`) on these string properties will cause immediate runtime crashes in React Native.

Recommended Fix:
Integrate type-casting helpers inside frontend API client response interceptors to parse string values into floating-point numbers.

---

### Mismatched Category and Difficulty Casing

Severity:
Critical

Affected Screen:
Dashboard, Missions, Coach, Simulator

Affected Endpoint:
`/api/v1/activities`, `/api/v1/missions/today`, `/api/v1/simulations`

Problem:
The frontend maps UI assets, icons, and colors using capitalized keys (e.g., `'Transport'`, `'Food'`, `'Easy'`). The backend models and API routes return lowercase values (e.g., `'transport'`, `'food'`, `'easy'`).

Impact:
Broken screen styling, missing category icons, and badging alignment failures.

Recommended Fix:
Add a casing normalization utility inside frontend API adapters to convert backend strings into matching capitalized formats.

---

## High-Risk Issues

### Missing Weekly Missions Database Table

Severity:
High

Affected Features:
Missions Screen (Weekly Missions tab)

Problem:
The backend database models, schemas, and seeding services only track daily personalized mission assignments via `UserMission`. No weekly mission models or tracking logic exist on the backend.

Recommended Fix:
Build a `weekly_missions` database schema and table on the backend, or temporarily disable weekly missions cards on the mobile frontend.

---

### Missing Goals Database Table

Severity:
High

Affected Features:
Profile Screen (Goal Progress Card)

Problem:
The backend has no database support or API routers for user goals. There are no tables for `user_goals` or associated CRUD endpoints.

Recommended Fix:
Design and build a `user_goals` table linked to user profiles and expose `GET/POST/DELETE /api/v1/users/goals` endpoints.

---

### Missing Chat History Persistence

Severity:
High

Affected Features:
AI Coach Screen (ConversationHistory)

Problem:
No database model or route exists to store chats with the AI Coach. Conversation logs reside only in transient React state and are lost when the user closes the app or reloads.

Recommended Fix:
Implement a `coach_chat_messages` table on postgres and expose a chat history route.

---

### Missing Mission Schema Properties

Severity:
High

Affected Features:
Dashboard (DailyMissionCard), Missions Screen

Problem:
The backend `UserMissionResponseData` schema omits the mission `description` field. Additionally, the `UserMission` and `MissionTemplate` models do not define points or score rewards.

Recommended Fix:
Update the Pydantic schema to include `description`. Add a `points` column to `mission_templates` and update the seeding script.

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

Problem:
Backend returns `avatar_url: null` for users who haven't uploaded an avatar image.

Likely Error:
React Native image component fails to load, resulting in layout shift or empty boxes.

Recommended Guard Clause:
```typescript
const avatarSource = user.avatarUrl ? { uri: user.avatarUrl } : require('@/assets/images/default-avatar.png');
```

---

### Undefined Mission Description

Problem:
`UserMissionResponseData` does not return `description`.

Likely Error:
Displays `undefined` or blank text in the mission card view.

Recommended Guard Clause:
```typescript
const descriptionText = mission.description || 'Complete this task to save carbon!';
```

---

### Missing Reward Score

Problem:
Mission templates do not contain score rewards in the database.

Likely Error:
Renders `+NaN Points` in reward badges.

Recommended Guard Clause:
```typescript
const displayScore = mission.rewardScore ?? (mission.difficulty === 'Easy' ? 3 : mission.difficulty === 'Medium' ? 5 : 8);
```

---

### Decimal String Parsing

Problem:
Numeric columns are returned as string decimals (e.g., `"1.25"`).

Likely Error:
Math operations or `.toFixed()` crash with type errors.

Recommended Guard Clause:
```typescript
const parseNumericValue = (val: any): number => typeof val === 'string' ? parseFloat(val) : val ?? 0;
```

---

### Empty AI Explanation

Problem:
Gemini API timeout or quota block returns `ai_explanation: null`.

Likely Error:
Destructuring properties like `aiExplanation.action` throws `TypeError`.

Recommended Guard Clause:
```typescript
const explanation = result.aiExplanation || { action: '', impact: '', recommendation: '', fullText: 'Simulation successful.' };
```

---

### Empty Unlocked Achievements List

Problem:
Brand new user retrieves an empty array of unlocked badges.

Likely Error:
Array index lookup `achievements[0]` crashes when trying to read properties of undefined.

Recommended Guard Clause:
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

### Authentication
- [ ] Supabase authentication functions successfully acquire and store user session JWTs.
- [ ] SecureStore token injection correctly appends Bearer token header on all request intercepts.
- [ ] Onboarding mutation correctly posts preferences payload to database and updates local store.

### Dashboard
- [ ] Sustainability Score progress ring displays overall score value from database.
- [ ] Daily Footprint loads category emissions values computed by backend carbon engine.
- [ ] Recent Activity List renders paginated activities history fetched from the API.

### Missions
- [ ] Daily Mission Card reads today's assigned mission title, category, and status.
- [ ] Clicking Complete updates the mission status, score, and streaks.
- [ ] Completed missions lists display historically logged activities.

### AI Coach
- [ ] CoachHero fetches and parses daily coaching insights JSON body safely.
- [ ] Prompt chip recommendations execute corresponding category mutations.
- [ ] Weekly summary panel renders rolling trends.

### Simulator
- [ ] Baseline metrics reflect today's footprint totals.
- [ ] Sliders send scenario parameters and output projected metrics.
- [ ] Save Scenario pushes simulation records to simulations database.

### Profile
- [ ] Profile page pulls user name, email, and memberSince details.
- [ ] Unlocked achievements map badge icons and description strings from unlocked achievements API.
- [ ] Settings tab allows preferences modification and successfully updates database records.

### Offline & Resiliency
- [ ] Fallback caches configured for all queries using TanStack Query.
- [ ] Safe type-casting guard clauses implemented for all numeric decimals.
- [ ] Error messages display on network failure.
