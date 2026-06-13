# Frontend-Backend Data Mapping Specification

This document maps the frontend TypeScript models and UI components to their corresponding backend FastAPI schemas, database models, and endpoints. It identifies naming mismatches, missing fields, and potential runtime errors to guide full-stack integration.

---

## Table of Contents
1. [Dashboard Feature Mapping](#1-dashboard-feature-mapping)
2. [Missions Feature Mapping](#2-missions-feature-mapping)
3. [AI Coach Feature Mapping](#3-ai-coach-feature-mapping)
4. [What-If Simulator Feature Mapping](#4-what-if-simulator-feature-mapping)
5. [Profile Feature Mapping](#5-profile-feature-mapping)
6. [Architectural Gap Analysis](#6-architectural-gap-analysis)

---

## 1. Dashboard Feature Mapping

### Component: DashboardHeader
* **Purpose:** Displays user profile avatar, current streak count, and network connection status in the dashboard toolbar.
* **Uses Data:**
  - `avatarUrl`
  - `currentStreak`
  - `networkStatus`
* **Backend Endpoint:** 
  - `GET /api/v1/users/me` (for profile avatar)
  - `GET /api/v1/streaks/current` (for streak details)
* **Backend Response Model:** `UserResponse` and `StreakResponse`
* **Field Mapping:**
  - `avatarUrl` (UserProfile) → `data.avatar_url` (UserResponseData)
  - `currentStreak` (UserProfile) → `data.current_streak` (StreakResponseData)
  - `networkStatus` → *Local on-device connectivity state (No backend mapping)*
* **Mismatches & Gaps:**
  - **Naming Mismatches:** CamelCase to snake_case mismatches: `avatarUrl` → `avatar_url`, and `currentStreak` → `current_streak`.
  - **Potential Runtime Errors:** If the user hasn't uploaded an avatar, `avatar_url` will return `null`. The frontend must handle `null` safely by falling back to a default placeholder avatar.

---

### Component: HeroScoreCard / HeroProgressRing
* **Purpose:** Displays the user's overall Sustainability Score and the change/trend (e.g., "+3 this week") inside a visual progress ring.
* **Uses Data:**
  - `score`
  - `scoreTrend`
* **Backend Endpoint:** `GET /api/v1/score`
* **Backend Response Model:** `SustainabilityScoreResponse`
* **Field Mapping:**
  - `score` → `data.overall_score` (SustainabilityScoreResponseData)
  - `scoreTrend` → *Calculated from historical trends (Requires `/score/history` or is hardcoded)*
* **Mismatches & Gaps:**
  - **Naming Mismatches:** Dashboard frontend refers to this property as `score`, whereas the backend responses and database schema call it `overall_score`.
  - **Missing Fields:** `scoreTrend` (e.g., "+3 this week") does not exist as a pre-calculated field on the backend. The frontend must fetch `GET /api/v1/score/history` and compute the difference locally, or use a hardcoded value.
  - **Potential Runtime Errors:** Passing an uninitialized or `NaN` score value during first-time loading to the `HeroProgressRing` SVG circle stroke properties can crash the rendering engine or draw broken SVG paths.

---

### Component: DailyMissionCard
* **Purpose:** Displays details about today's active mission, rewards, progress, and status.
* **Uses Data:**
  - `id`
  - `title`
  - `description`
  - `category`
  - `difficulty`
  - `scoreReward` / `rewardScore`
  - `carbonReward` / `rewardCarbon`
  - `status`
* **Backend Endpoint:** `GET /api/v1/missions/today`
* **Backend Response Model:** `MissionResponse`
* **Field Mapping:**
  - `id` → `data.id` (UserMission UUID)
  - `title` → `data.title`
  - `description` → *Missing from response* (stored in `mission_templates.description` but not returned in `UserMissionResponseData`)
  - `category` → `data.category` (case mapping: `'food'` → `'Food'`)
  - `difficulty` → `data.difficulty` (case mapping: `'easy'` → `'Easy'`)
  - `rewardScore` → *Missing from database* (unimplemented in backend models)
  - `rewardCarbon` → `data.estimated_co2_saving`
  - `status` → `data.status`
* **Mismatches & Gaps:**
  - **Missing Fields:** 
    - The backend `UserMissionResponseData` schema **omits** the `description` field, which is required by the frontend card detail view.
    - No reward points or score points field exists on `UserMission` or `MissionTemplate` models on the backend.
  - **Naming Mismatches:** `rewardCarbon` / `carbonReward` maps to `estimated_co2_saving`. Category and difficulty are lowercase on the backend (`'transport'`, `'easy'`) but capitalized on the frontend (`'Transport'`, `'Easy'`).
  - **Potential Runtime Errors:** 
    - Accessing `mission.description` will return `undefined`, resulting in empty text sections.
    - Mismatched category casing will fail to map to UI category icons, defaulting to a fallback icon.
    - Accessing `mission.rewardScore` will return `undefined`, displaying `+NaN Points`.

---

### Component: CategoryCard / CategoryBreakdownGrid
* **Purpose:** Displays carbon emissions breakdowns and budget progress bars for key lifestyle categories.
* **Uses Data:**
  - `name` ('Transport' | 'Food' | 'Energy' | 'Shopping')
  - `value`
  - `limit`
  - `progress`
* **Backend Endpoint:** `GET /api/v1/footprints/today`
* **Backend Response Model:** `FootprintResponse`
* **Field Mapping:**
  - `name` → Matches response keys: `'Transport'` → `'transport_co2'`, `'Food'` → `'food_co2'`, `'Energy'` → `'electricity_co2'`, `'Shopping'` → `'shopping_co2'`
  - `value` → Associated category emission float value (e.g., `data.transport_co2`)
  - `limit` → *Missing from backend (Mocked on frontend)*
  - `progress` → *Computed on frontend as `value / limit`*
* **Mismatches & Gaps:**
  - **Naming Mismatches:** The frontend category `'Energy'` maps to `'electricity_co2'` (or `'electricity'`) in the backend footprints payload.
  - **Missing Fields:** Carbon target category limits (budgets) do not exist in the backend database.
  - **Potential Runtime Errors:** If a category key is mismatched, `progress` calculates as `NaN` or crashes the progress bar component.

---

### Component: RecentActivityRow / RecentActivityList
* **Purpose:** Renders a list of recently logged activities with timestamps and carbon impacts.
* **Uses Data:**
  - `id`
  - `category`
  - `activity_type`
  - `quantity`
  - `unit`
  - `timestamp`
* **Backend Endpoint:** `GET /api/v1/activities`
* **Backend Response Model:** `ActivityListResponse`
* **Field Mapping:**
  - `id` → `id` (UUID)
  - `category` → `category` (case mapping: `'transport'` → `'Transport'`)
  - `activity_type` → `activity_type` (case mapping: `'metro'` → `'Metro Ride'`)
  - `quantity` → `quantity` (Decimal/String on backend → float on frontend)
  - `unit` → `unit`
  - `timestamp` → `created_at` (ISO timestamp)
* **Mismatches & Gaps:**
  - **Naming Mismatches:** `timestamp` maps to `created_at`.
  - **Potential Runtime Errors:** Backend returns `quantity` as a string-serialized decimal or a precise decimal. Frontend expects a numeric type. Directly executing math operations on string values can throw runtime casting errors in React Native.

---

## 2. Missions Feature Mapping

### Component: MissionCard
* **Purpose:** Represents individual daily missions in the Missions list view, rendering status badges.
* **Uses Data:**
  - Same fields as `DailyMissionCard` (id, title, description, category, difficulty, rewardScore, rewardCarbon, status, progress)
* **Backend Endpoint:** `GET /api/v1/missions/today` or `GET /api/v1/missions/history`
* **Backend Response Model:** `MissionResponse` / `MissionListResponse`
* **Field Mapping:** Matches `DailyMissionCard` mappings.
* **Mismatches & Gaps:** Mapped description and reward score properties are missing from the backend response model and database schema.

---

### Component: WeeklyMissionCard
* **Purpose:** Displays long-term weekly targets (e.g., "Take public transport 3 times").
* **Uses Data:**
  - `id`
  - `title`
  - `currentProgress`
  - `totalTarget`
  - `rewardScore`
  - `isCompleted`
* **Backend Endpoint:** **None** (Unimplemented on backend)
* **Backend Response Model:** **N/A**
* **Field Mapping:** No mapping exists.
* **Mismatches & Gaps:**
  - **Missing Feature:** Weekly missions do not exist on the backend database or service layer. There are no tables for weekly mission assignments, and no endpoints to fetch or check them.
  - **Potential Runtime Errors:** The frontend hook `useMissionsData` falls back to static hardcoded mock data. If the app tries to parse weekly missions from the API `/missions` endpoint, it will fail with a parsing error.

---

### Component: AchievementPreview / AchievementPreviewCard
* **Purpose:** Previews the user's progress toward unlocking their next milestone badge.
* **Uses Data:**
  - `id`
  - `title`
  - `progressText`
  - `remainingCount`
* **Backend Endpoint:** `GET /api/v1/achievements/progress`
* **Backend Response Model:** `AchievementProgressResponse`
* **Field Mapping:**
  - `id` → `data[0].id`
  - `title` → `data[0].title`
  - `progressText` → Mapped to `title` or derived from `current_progress` / `target`
  - `remainingCount` → Calculated on frontend: `target - current_progress`
* **Mismatches & Gaps:**
  - **Missing Fields:** Frontend expects a single summary object, while the backend returns a full list of all available achievements and their progress states.
  - **Potential Runtime Errors:** If the user has unlocked all achievements, `progress_list` might return empty filters, leading to `undefined` array lookups on the frontend.

---

## 3. AI Coach Feature Mapping

### Component: InsightCard
* **Purpose:** Displays today's personalized AI-generated coaching message.
* **Uses Data:**
  - `headline`
  - `summary`
  - `recommendation`
* **Backend Endpoint:** `GET /api/v1/ai/insights/latest?type=daily_coach`
* **Backend Response Model:** `AIInsightResponse`
* **Field Mapping:**
  - `headline` → *Static UI title (No backend field)*
  - `summary` → `data.content.body` (parsed JSON string)
  - `recommendation` → `data.content.recommendation` (parsed JSON string)
* **Mismatches & Gaps:**
  - **Missing Fields:** `headline` is not a property on the backend.
  - **Nested Structure Mismatch:** The backend returns insight details inside a JSON `content` column rather than flat properties.
  - **Potential Runtime Errors:** If the JSON body in the database fails to parse (e.g., malformed JSON string saved in postgres), `content.body` evaluates as undefined or crashes during `JSON.parse()`.

---

### Component: RecommendationCard
* **Purpose:** Displays actionable carbon-saving suggestions generated by the AI Coach.
* **Uses Data:**
  - `id`
  - `category`
  - `title`
  - `description`
  - `impact` ('Low' | 'Medium' | 'High')
  - `difficulty` ('Easy' | 'Medium' | 'Hard')
  - `rewardScore`
  - `rewardCarbon`
  - `ctaLabel`
  - `ctaNavigation`
* **Backend Endpoint:** `GET /api/v1/ai/insights/latest?type=recommendation` or `GET /api/v1/simulations/recommendations`
* **Backend Response Model:** `AIInsightResponse` / `DashboardWhatIfResponse`
* **Field Mapping:**
  - `id` → `id` (UUID)
  - `category` → `category`
  - `title` → `title`
  - `description` → `description`
  - `impact` → `impact_level` (on backend)
  - `difficulty` → `difficulty`
  - `rewardScore` → *Missing from database*
  - `rewardCarbon` → `carbon_saving` / `estimated_co2_saving`
  - `ctaLabel` / `ctaNavigation` → *Inferred on frontend based on category*
* **Mismatches & Gaps:**
  - **Naming Mismatches:** `impact` maps to `impact_level`. `rewardCarbon` maps to `carbon_saving` or `estimated_co2_saving`.
  - **Missing Fields:** `rewardScore` has no database field.
  - **Potential Runtime Errors:** If the backend provides unstructured recommendations in the AI payload, the frontend will fail to map the values, rendering empty cards.

---

### Component: BehaviorTrendCard / TrendCard
* **Purpose:** Visualizes carbon emission percentage changes over time across categories.
* **Uses Data:**
  - `category`
  - `state` ('Improving' | 'Stable' | 'Declining')
  - `percentage`
  - `period`
* **Backend Endpoint:** `GET /api/v1/ai/weekly-summary` (or calculated from `/footprints/weekly` history)
* **Backend Response Model:** `AIInsightResponse`
* **Field Mapping:**
  - Mapped from parsed JSON contents in AI Insights weekly summary.
* **Mismatches & Gaps:**
  - **Missing Feature:** There is no dedicated API route or database table representing category-wise percentage trends. The frontend either gets them from unstructured AI summary text or has to compute them by fetching daily footprint tables over 30 days.

---

### Component: ChatMessage
* **Purpose:** Renders conversation bubbles between the user and the AI Coach.
* **Uses Data:**
  - `id`
  - `sender` ('user' | 'coach')
  - `text`
  - `timestamp`
* **Backend Endpoint:** `POST /api/v1/ai/chat` (Unimplemented in FastAPI routers; currently stubbed on frontend)
* **Backend Response Model:** `success: True, data: { response: "text" }`
* **Field Mapping:**
  - `id` → (Generated locally)
  - `sender` → `'user'` / `'coach'`
  - `text` → `data.response` (FastAPI response)
  - `timestamp` → (Current client date/time)
* **Mismatches & Gaps:**
  - **Missing Backend Routing:** The backend router lacks an active `/ai/chat` endpoint. The frontend service falls back to mock responses.
  - **Missing Database Model:** No `chat_messages` or `chat_conversations` table exists in postgres to persist chat histories.

---

## 4. What-If Simulator Feature Mapping

### Component: ScenarioBuilder / ScenarioSlider
* **Purpose:** Sliders to configure user parameters for simulating behavioral lifestyle adjustments.
* **Uses Data:**
  - `id`
  - `label`
  - `unit`
  - `currentValue`
  - `min`
  - `max`
  - `step`
* **Backend Endpoint:** `POST /api/v1/simulations`
* **Backend Response Model:** `SimulationResponse`
* **Field Mapping:**
  - `id` → Key inside the request `parameters` payload dict (e.g. `car_trips`)
  - `currentValue` → Value for the corresponding parameter key
  - `min`, `max`, `step` → *Hardcoded on frontend*
* **Mismatches & Gaps:**
  - **Database Structure:** Parameters are stored as key-value pairs in a JSONB column on the backend (`simulations.parameters`). 

---

### Component: CurrentStateCard & ProjectedStateCard
* **Purpose:** Side-by-side comparison of baseline metrics versus projected scores.
* **Uses Data:**
  - `footprintKg`
  - `sustainabilityScore`
  - `forecastScore`
* **Backend Endpoint:** `POST /api/v1/simulations`
* **Backend Response Model:** `SimulationResponse`
* **Field Mapping:**
  - `footprintKg` → `data.baseline_emissions` (current) and `data.projected_emissions` (projected)
  - `sustainabilityScore` → `data.baseline_score` (current) and `data.projected_score` (projected)
  - `forecastScore` → `data.projected_score`
* **Mismatches & Gaps:**
  - **Naming Mismatches:**
    - `footprintKg` maps to `baseline_emissions` / `projected_emissions`.
    - `sustainabilityScore` / `forecastScore` maps to `baseline_score` / `projected_score`.
  - **Potential Runtime Errors:** Decimal numerical types returned from the API must be parsed into JS floating-point numbers before rendering to prevent UI crashes.

---

### Component: AIExplanationCard
* **Purpose:** Renders the natural language explanation of simulation results generated by the Gemini model.
* **Uses Data:**
  - `action`
  - `impact`
  - `recommendation`
  - `fullText`
* **Backend Endpoint:** `POST /api/v1/simulations`
* **Backend Response Model:** `SimulationResponse`
* **Field Mapping:**
  - `action` → `data.ai_explanation.action`
  - `impact` → `data.ai_explanation.impact`
  - `recommendation` → `data.ai_explanation.recommendation`
  - `fullText` → `data.ai_explanation.full_text`
* **Mismatches & Gaps:**
  - **Naming Mismatches:** `fullText` maps to `full_text`.
  - **Potential Runtime Errors:** If the AI model fails or returns empty explanations, accessing nested fields of `ai_explanation` will raise `TypeError: Cannot read properties of null`. The frontend must check for null values.

---

### Component: SavedScenarioCard
* **Purpose:** Displays previously saved simulation runs under the Simulator History section.
* **Uses Data:**
  - `id`
  - `name`
  - `category`
  - `savedAt`
  - `scoreImpact`
  - `carbonReductionKg`
* **Backend Endpoint:** `GET /api/v1/simulations` (or `GET /api/v1/simulations/history`)
* **Backend Response Model:** `SimulationListResponse`
* **Field Mapping:**
  - `id` → `id` (UUID)
  - `name` → `scenario_name` (backend)
  - `category` → `scenario_type` (backend: e.g. `'Transport'`)
  - `savedAt` → `created_at` (backend timestamp)
  - `scoreImpact` → Mapped from difference: `projected_score - baseline_score`
  - `carbonReductionKg` → Mapped from difference: `baseline_emissions - projected_emissions`
* **Mismatches & Gaps:**
  - **Naming Mismatches:** `name` → `scenario_name`, `category` → `scenario_type`, `savedAt` → `created_at`.
  - **Derived Mappings:** `scoreImpact` and `carbonReductionKg` are pre-calculated on the frontend but must be derived on the fly from baseline and projected emissions/scores when parsing the backend payload.

---

## 5. Profile Feature Mapping

### Component: ProfileHero
* **Purpose:** Displays name, membership date, sustainability score, and current streak.
* **Uses Data:**
  - `name`
  - `email`
  - `avatarUrl`
  - `memberSince`
  - `sustainabilityScore`
  - `currentStreak`
* **Backend Endpoint:** 
  - `GET /api/v1/users/me` (profile)
  - `GET /api/v1/streaks/current` (streak)
  - `GET /api/v1/score` (score)
* **Backend Response Model:** Consolidated from `UserResponse`, `StreakResponse`, and `SustainabilityScoreResponse`
* **Field Mapping:**
  - `name` → `data.full_name`
  - `email` → `data.email`
  - `avatarUrl` → `data.avatar_url`
  - `memberSince` → `data.created_at` (requires formatting, e.g., "June 2026")
  - `sustainabilityScore` → `data.overall_score`
  - `currentStreak` → `data.current_streak`
* **Mismatches & Gaps:**
  - **Naming Mismatches:** `name` → `full_name`, `avatarUrl` → `avatar_url`, `memberSince` → `created_at`, `sustainabilityScore` → `overall_score`, `currentStreak` → `current_streak`.
  - **Potential Runtime Errors:** Because the data is spread across three distinct endpoints, a slow connection or a single query failure could lead to partial loading states where some fields display `NaN` or stay blank.

---

### Component: ImpactSummaryCard / ImpactCard
* **Purpose:** Renders lifetime environmental stats (carbon saved, activities logged, missions completed).
* **Uses Data:**
  - `carbonSaved`
  - `activitiesLogged`
  - `missionsCompleted`
  - `communityContributions`
* **Backend Endpoint:** **None** (Requires aggregating lists locally or implementing a custom profile stats API)
* **Backend Response Model:** **N/A**
* **Field Mapping:**
  - `carbonSaved` → *Calculated from historical footprint decreases*
  - `activitiesLogged` → `total_items` (pagination count from `GET /api/v1/activities`)
  - `missionsCompleted` → `total_items` (pagination count from `GET /api/v1/missions/history` where status = "completed")
  - `communityContributions` → *Derived from Community group member lists*
* **Mismatches & Gaps:**
  - **Missing Backend Endpoint:** No single, consolidated `/profile/stats` endpoint exists. Fetching full paginated history counts on the client is inefficient.

---

### Component: GoalCard / GoalProgressCard
* **Purpose:** Displays list of target goals, progress bars, and completion statuses.
* **Uses Data:**
  - `id`
  - `title`
  - `description`
  - `currentValue`
  - `targetValue`
  - `unit`
  - `type`
  - `filterQuery`
  - `status`
* **Backend Endpoint:** **None** (Unimplemented on backend)
* **Backend Response Model:** **N/A**
* **Field Mapping:** No mapping exists.
* **Mismatches & Gaps:**
  - **Missing Feature:** User-defined sustainability goals do not exist in the database. There are no tables for `user_goals` or API endpoints for creating, reading, updating, or deleting goals.
  - **Potential Runtime Errors:** The frontend uses static mocks (`MOCK_PROFILE_DATA.goals`). Moving to production without building a goals database model will result in blank views.

---

### Component: AchievementCard
* **Purpose:** Renders earned badges with titles, descriptions, and unlock times.
* **Uses Data:**
  - `id`
  - `badge`
  - `title`
  - `description`
  - `earnedAt`
* **Backend Endpoint:** `GET /api/v1/achievements/unlocked`
* **Backend Response Model:** `UnlockedAchievementResponse`
* **Field Mapping:**
  - `id` → `data[i].achievement.id`
  - `badge` → `data[i].achievement.badge_icon`
  - `title` → `data[i].achievement.title`
  - `description` → `data[i].achievement.description`
  - `earnedAt` → `data[i].earned_at`
* **Mismatches & Gaps:**
  - **Naming Mismatches:** `badge` (emoji character) → `badge_icon`. `earnedAt` → `earned_at`.
  - **Nested Object Structure:** Unlocked achievements response wraps details in a nested `achievement` object. The frontend expects a flat object array.
  - **Potential Runtime Errors:** Direct rendering of nested variables (e.g., `item.achievement.title`) without safe optional chaining (`item.achievement?.title`) will crash the list view if an achievement reference is deleted from the master database.

---

## 6. Architectural Gap Analysis

### 1. Missing Backend Databases & Features
* **Goals Feature:** Complete absence of a `goals` table on postgres and corresponding `/profile/goals` endpoints.
* **Weekly Missions:** No database model, service, or API endpoint for weekly missions.
* **AI Coach Chat History:** Missing database tables to persist conversational exchanges between the user and the Coach. The current chat is transient.

### 2. Consolidated Summary Endpoints
* The frontend relies heavily on consolidated mocks (`getDashboardData`, `getMissionsData`, `getProfileData`, `getCoachData`, `getSimulatorBaseline`).
* **The Gap:** The backend exposes granular endpoints (`/footprints/today`, `/streaks/current`, `/missions/today`, `/users/me`).
* **The Fix:** The frontend must either:
  1. Perform multiple concurrent `useQuery` calls and assemble them on the client.
  2. Implement consolidated gateway endpoints on the backend router (e.g., `GET /api/v1/dashboard/summary`) that aggregate these services.

### 3. Naming Convention Discrepancies
* **Emissions Category Naming:** Frontend refers to household electricity emissions as `'Energy'`. Backend routers, carbon engines, and footprint databases name it `'electricity'`.
* **Points & Scores:** Frontend assumes missions and achievements have rewards named `rewardScore` or `scoreReward`. The backend database only records `points` inside achievements; missions have no points fields.
* **Case Mismatches:** Categories and difficulty ratings are capitalized in typescript components (`'Transport'`, `'Easy'`) but lowercase strings in the python backend (`'transport'`, `'easy'`).
