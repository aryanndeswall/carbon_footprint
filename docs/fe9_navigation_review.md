# FE-9 Navigation & User Flow Review
**Carbon Sense — Lead Product Designer / Mobile UX Architect**
**Review Date:** 2026-06-13

---

## Executive Summary

The Carbon Sense navigation architecture is structurally sound and philosophically aligned with the "behavior-change, not analytics" mandate. The five-tab layout is correct, the FAB is globally accessible, and the 2-tap depth rule is broadly respected. However, **four critical gaps and seven UX friction points** exist that must be resolved before implementation begins.

**Final Approval Status: ⚠️ PASS WITH FIXES**

---

## 1. User Journey Maps

### 1.1 New User Flow

```
App Install → Splash Screen
    └── Auth Check → Not Authenticated
        └── Onboarding (3-4 screens)
            └── Sign Up → Email/Password or Google
                └── Main Tabs [Home]
                    └── Dashboard (EMPTY STATE)
                        ├── Quick Actions Row → Activity Log Modal     [TAP 1]
                        │       └── Log First Activity → Score Update
                        └── Daily Mission Card → Mission Details        [TAP 2]
                                └── Mark Complete → Celebration Modal
                                    └── Score Increase → Dashboard Refresh
```

#### Friction Points Identified

| # | Location | Problem | Severity |
|---|----------|---------|----------|
| F-1 | Onboarding → Dashboard | **No explicit hand-off moment.** After sign-up, users land on a completely empty dashboard with no first-run guide. The empty state copy ("Complete your first activity to begin tracking progress") exists but there is no **visual onboarding hook** — no coach tip, no highlighted FAB, no first mission pre-assigned. | 🔴 Critical |
| F-2 | Dashboard Empty State | Score ring at 0 is visually alarming. The spec says "avoid highlighting zero values aggressively" but no alternative visual for score = 0 is defined. What does the ring look like on day 1? | 🟡 Medium |
| F-3 | First Mission Discovery | There is no defined mechanic to surface the user's **first mission** after onboarding. The Mission tab requires the user to self-navigate — this breaks the New User Flow's habit loop. | 🔴 Critical |

---

### 1.2 Returning User Flow

```
App Open → Splash Screen
    └── Auth Check → Authenticated
        └── Dashboard (POPULATED)
            ├── Streak Badge visible ← correct
            ├── Daily Mission Card ← correct
            └── Mission Card CTA → "Mark Complete" or "Continue"
                    └── Completion → Score Update → Dashboard Refresh
                            └── Animated progress ring + streak badge pulse
```

#### Friction Points Identified

| # | Location | Problem | Severity |
|---|----------|---------|----------|
| F-4 | Dashboard Refresh | On return to Dashboard tab from another tab, stale data may display. The spec defines refresh "on screen focus" — but **Expo Router's tab focus behavior** must explicitly call `refetchOnWindowFocus` via TanStack Query. This is a silent implementation risk. | 🟡 Medium |
| F-5 | Mission Card "Skip" | The spec says "Skip for Today" should be supported but **not overemphasized**. There is no spec for what happens AFTER a skip: Is a new mission shown? Is the card collapsed? This creates a dead-end. | 🟡 Medium |

---

### 1.3 AI Coach Flow

```
Dashboard
    └── AI Insight Card (tap) → AI Coach Tab (Coach screen)   [1 TAP]
            └── Today's Insight (auto-populated)
                └── Recommended Actions (max 3)
                    └── Tap Action → ???
```

#### Friction Points Identified

| # | Location | Problem | Severity |
|---|----------|---------|----------|
| F-6 | AI Coach Recommendations → Action | **This is the most critical missing link in the entire app.** The spec says Recommendation Cards have an "Expected Score Increase" and "Difficulty" — but there is NO defined CTA behavior. Does tapping a recommendation: open Activity Logging? Navigate to Mission Details? Open the Simulator? This is **undefined in both the spec and navigation architecture**. | 🔴 Critical |
| F-7 | Coach → Simulator handoff | The nav spec says Coach can navigate to Simulator. The Coach spec implies this through the Forecast Insight Card. But no explicit CTA is defined ("Run simulation for this action"). Users may not realize they can simulate a recommendation. | 🟡 Medium |

---

### 1.4 Simulator Flow

```
Coach Tab → What-If Simulator                     [Coach tab sub-route]
    OR
Dashboard → (no direct entry point defined)       ← GAP
    └── Simulator Screen
            ├── Preset Chips (Transport/Food/Energy)     [0 taps to start]
            └── Scenario Builder (Sliders/Selectors)
                    └── Results Auto-Generated (real-time deterministic calc)
                            ├── Impact Summary Card
                            ├── AI Explanation Card
                            ├── Comparison Card
                            └── CTA → ???
```

#### Friction Points Identified

| # | Location | Problem | Severity |
|---|----------|---------|----------|
| F-8 | Simulator Entry Point | The Simulator lives under the **Coach Tab** sub-route (`coach/simulator`). However, the Dashboard "Forecast Card" navigates to `/forecast` — a separate route — not the Simulator. Users who see a forecast and want to "what-if" it have no single-tap path to the Simulator from the Dashboard. | 🟡 Medium |
| F-9 | Simulator → Action CTA | After results are generated, what does the user DO? The spec defines "Optional Save" and "Scenario Comparison" but no **post-simulation CTA** (e.g., "Turn this into a Mission", "Log this activity", "Share results"). Without this, the Simulator is a dead-end loop with no behavioral output. | 🔴 Critical |

---

### 1.5 Profile Flow

```
Dashboard Header → Avatar (tap) → Profile Tab     [1 TAP]
    OR
Bottom Tab → Profile                              [1 TAP]
    └── Profile Hero (Score, Streak, Name)
        └── Impact Summary
            └── Achievements Preview → View All → Achievements Screen  [2 TAPS]
                └── Goals Section
                    └── Goal Card → Edit/Progress
                        └── Settings Section (collapsed at bottom)
```

#### Friction Points Identified

| # | Location | Problem | Severity |
|---|----------|---------|----------|
| F-10 | Settings Visibility | Settings Section appears **at the bottom of a scrollable screen** below Identity, Impact, Achievements, Goals, and Statistics. For users who urgently need Settings (e.g., to change notifications or sign out), discoverability is poor. No quick-access Settings icon is defined in the Profile header. | 🟡 Medium |
| F-11 | Goals → Mission Link | Goals are defined (e.g., "Reach Score 90") but there is no navigation link from a Goal card to related Missions that would help achieve that goal. Goals and Missions are siloed. | 🟡 Medium |

---

## 2. Navigation Audit

### 2.1 Bottom Tab Navigation

| Tab | Label | Icon Defined | Active State Defined | Badge Support | Verdict |
|-----|-------|-------------|---------------------|---------------|---------|
| Home | Home | ✅ Assumed | ✅ | ✅ (mission badge) | ✅ PASS |
| Missions | Missions | ✅ Assumed | ✅ | ✅ (completion count) | ✅ PASS |
| Coach | Coach | ✅ Assumed | ✅ | ❌ Not defined | ⚠️ MINOR |
| Community | Community | ✅ Assumed | ✅ | ❌ Not defined | ⚠️ MINOR |
| Profile | Profile | ✅ Assumed | ✅ | ❌ Not defined | ⚠️ MINOR |

**Issue**: Coach tab badge state is undefined. When a new AI insight is generated, users should see a notification indicator on the Coach tab. This is a standard behavior-change mechanic (used by Duolingo, Apple Fitness) that is missing from the spec.

---

### 2.2 Header Actions

| Screen | Left | Center | Right | Verdict |
|--------|------|--------|-------|---------|
| Dashboard | Avatar → Profile | Streak Badge | Network Indicator | ✅ PASS |
| Missions | Back / Title | "3 of 5 Completed" | — | ✅ PASS |
| AI Coach | Title | — | Refresh | ✅ PASS |
| Simulator | Title | — | Help | ✅ PASS |
| Profile | Avatar / Name | — | Edit Profile | ✅ PASS |

**Issue**: The Simulator "Help" action is specified but **not defined**. What does it open? A tooltip? A bottom sheet tutorial? A deep-link? This must be defined before implementation.

---

### 2.3 Floating Action Button (FAB)

| Attribute | Spec Says | Assessment |
|-----------|-----------|------------|
| Presence | Global (all tabs) | ✅ Correct |
| Position | Bottom-right fixed | ✅ Correct |
| Action | Opens Activity Logging Modal | ✅ Correct |
| Visibility on scroll | Fixed (persists) | ✅ Correct |
| Conflict with Tab Bar | ❌ **Not addressed** | ⚠️ Risk |

**Issue**: The FAB sits at bottom-right, directly adjacent to the bottom tab bar. On small phones (≤375px width), the FAB will visually collide with the Profile tab icon. A minimum clearance from the tab bar (`marginBottom: tabBarHeight + 16px`) must be enforced in implementation.

**Issue**: The FAB is specified as "global" but **hides on the Simulator screen** per FE-8 recommendations (to prevent distraction). This exception must be documented in the navigation spec.

---

### 2.4 Back Navigation

| Flow | Back Behavior | Spec Defined? | Verdict |
|------|---------------|---------------|---------|
| Mission Details → Mission List | Stack back | ✅ | ✅ PASS |
| Achievement Details → Achievements | Stack back | ✅ | ✅ PASS |
| Activity Log Modal → Dashboard | Dismiss modal | ✅ | ✅ PASS |
| OCR Review → OCR Upload | Stack back | ✅ | ✅ PASS |
| Simulator → Coach Tab | ❓ Stack back or tab? | ❌ NOT DEFINED | ⚠️ Risk |
| Forecast → Dashboard | ❓ Stack back or tab? | ❌ NOT DEFINED | ⚠️ Risk |

**Issue**: Both `forecast/` and `simulator/` are defined as root-level routes in the Expo Router structure, outside the `(tabs)/` group. This means they are **stack screens**, not tab screens. Back navigation from these screens will pop to the screen that opened them. This is correct but must be implemented deliberately — the Expo Router `_layout.tsx` must configure these as modal or stack appropriately.

---

### 2.5 Deep Links

| Deep Link | Destination | Status | Note |
|-----------|-------------|--------|------|
| `carbonsense://missions` | Missions Tab | ✅ Defined | Direct tab |
| `carbonsense://score` | Score Screen | ✅ Defined | Stack screen |
| `carbonsense://coach` | Coach Tab | ✅ Defined | Direct tab |
| `carbonsense://forecast` | Forecast Screen | ✅ Defined | Stack screen |
| `carbonsense://simulator` | Simulator Screen | ✅ Defined | Stack screen |
| `carbonsense://achievement/{id}` | Achievement Details | ✅ Defined | Dynamic route |
| `carbonsense://dashboard` | Dashboard (Home Tab) | ❌ **Missing** | Common pattern |
| `carbonsense://activity/log` | Activity Log Modal | ❌ **Missing** | Push notification CTA |

**Issue**: Two essential deep links are missing. Push notifications that say "Time to log today's activity!" need `carbonsense://activity/log`. A "Return to Dashboard" notification needs `carbonsense://dashboard`.

---

## 3. Consolidated UX Friction Points

| Priority | ID | Flow | Problem | Impact |
|----------|-----|------|---------|--------|
| 🔴 P0 | F-1 | New User | No first-run onboarding hook on Dashboard | Drops retention on Day 1 |
| 🔴 P0 | F-3 | New User | No mechanic to surface first mission post-onboarding | Breaks habit loop |
| 🔴 P0 | F-6 | AI Coach | Recommendation tap behavior undefined | Dead CTA — core feature unusable |
| 🔴 P0 | F-9 | Simulator | No post-simulation CTA | Simulator has no behavioral output |
| 🟡 P1 | F-2 | New User | Score ring at 0 is visually alarming | Poor first impression |
| 🟡 P1 | F-4 | Returning User | Stale data risk on tab re-focus | Core data reliability issue |
| 🟡 P1 | F-5 | Returning User | Skip mission → undefined next state | Dead-end UX after skip |
| 🟡 P1 | F-7 | AI Coach | Coach → Simulator handoff CTA missing | Feature discovery gap |
| 🟡 P1 | F-8 | Simulator | No Dashboard entry point to Simulator | Reduces flagship feature usage |
| 🟡 P1 | F-10 | Profile | Settings buried below 5 scroll sections | Frustrating for settings-seeking users |
| 🟡 P1 | F-11 | Profile | Goals ↔ Missions are siloed | Misses habit reinforcement opportunity |

---

## 4. Suggested Improvements

### 4.1 Fix F-1 & F-3: First-Run Experience System

**Problem**: No bridge between Onboarding completion and first Mission engagement.

**Solution**: Implement a `firstRunBanner` component on Dashboard (new users only).

```
┌─────────────────────────────────────────┐
│  🌱 Welcome to Carbon Sense!            │
│  Start your first mission to earn       │
│  your first Sustainability Score.       │
│  [Start First Mission →]                │
└─────────────────────────────────────────┘
```

- Shown only when `user.activitiesLogged === 0`
- Tapping navigates directly to Missions tab with the first mission card highlighted
- Dismissed after first activity logged
- FAB pulses once on first app open to draw attention

---

### 4.2 Fix F-6: Recommendation CTA Behavior

**Problem**: AI Coach Recommendation Cards have no defined tap behavior.

**Solution**: Each Recommendation Card gets a contextual CTA based on its `category`:

| Category | CTA Label | Navigation |
|----------|-----------|------------|
| Transport / Food / Energy | "Log This Activity" | Opens Activity Log Modal, pre-seeded with category |
| Mission Related | "View Mission" | Opens Mission Details (`/missions/{id}`) |
| Score Goal | "Simulate This" | Opens Simulator (`/simulator`) with preset applied |
| General | "Explore Options" | Opens Simulator with category pre-selected |

This makes every recommendation directly actionable — a core requirement for the "Action > Conversation" principle.

---

### 4.3 Fix F-9: Post-Simulation CTAs

**Problem**: Simulator results are a dead-end.

**Solution**: Add a sticky bottom CTA row after simulation completes:

```
┌────────────────────────────────────────────┐
│  [💾 Save Scenario]  [✅ Turn into Mission] │
└────────────────────────────────────────────┘
```

- **Save Scenario** → persists to Saved Scenarios section
- **Turn into Mission** → creates a custom mission from the simulated behavior (requires backend support — flag as V1.5 if not available)
- **Or** fallback: "Log This as Today's Activity" → opens Activity Log Modal pre-seeded

---

### 4.4 Fix F-4: Stale Data Prevention

**Problem**: Tab re-focus may show stale dashboard data.

**Solution (implementation note)**:
- `useDashboardData` hook must set `refetchOnWindowFocus: true` in TanStack Query config
- Expo Router's `useFocusEffect` hook must trigger `queryClient.invalidateQueries(['dashboard'])` on every tab focus
- Maximum acceptable staleness: 60 seconds

---

### 4.5 Fix F-5: Post-Skip State

**Problem**: Skipping a mission leaves the Daily Mission card in an undefined state.

**Solution**:
- On skip: collapse the mission card to a minimal "Mission Skipped" state
- Show a secondary "See More Missions" link beneath the collapsed state
- Navigate to Missions tab on tap
- Do NOT remove the card entirely — it must remain as a motivational nudge

---

### 4.6 Fix F-8: Dashboard → Simulator Shortcut

**Problem**: No direct path from Dashboard to Simulator.

**Solution**: Add a "Simulate" chip to the Quick Actions Row on Dashboard:

```
[Metro Ride]  [Veg Meal]  [Electricity]  [🔮 Simulate]
```

- Tapping "Simulate" navigates to `/simulator` directly
- This makes the Simulator a first-class action on the primary screen
- Requires updating DASHBOARD_SCREEN_SPEC.md Quick Actions Row

---

### 4.7 Fix Deep Links: Add Missing Routes

Add to `NAVIGATION_ARCHITECTURE.md`:

```
carbonsense://dashboard
carbonsense://activity/log
```

Both are required for push notification CTAs and should be handled in the Expo Router entry config.

---

### 4.8 Coach Tab Badge State

**Spec Update Required**: Add notification badge definition to Coach tab.

- Badge appears when a **new AI insight** has been generated since last Coach visit
- Red dot badge (no count), consistent with iOS convention
- Cleared on Coach tab open
- Managed via local state in `useCoachData` hook (`hasUnreadInsight: boolean`)

---

## 5. Navigation Architecture Gaps Summary

> [!IMPORTANT]
> The following items require documentation updates in **NAVIGATION_ARCHITECTURE.md** and/or **screen specs** before frontend implementation begins.

| Gap | Document to Update | Priority |
|-----|--------------------|----------|
| Recommendation Card tap behavior | AI_COACH_SCREEN_SPEC.md | 🔴 P0 |
| Post-simulation CTAs | SIMULATOR_SCREEN_SPEC.md | 🔴 P0 |
| First-run onboarding hook | DASHBOARD_SCREEN_SPEC.md | 🔴 P0 |
| First mission surfacing mechanic | MISSION_SCREEN_SPEC.md | 🔴 P0 |
| Simulator entry from Dashboard | DASHBOARD_SCREEN_SPEC.md | 🟡 P1 |
| Coach tab notification badge | NAVIGATION_ARCHITECTURE.md | 🟡 P1 |
| FAB hidden on Simulator | NAVIGATION_ARCHITECTURE.md | 🟡 P1 |
| FAB clearance from tab bar | COMPONENT_INVENTORY.md | 🟡 P1 |
| Simulator/Forecast back nav type | NAVIGATION_ARCHITECTURE.md | 🟡 P1 |
| Deep links for dashboard + activity/log | NAVIGATION_ARCHITECTURE.md | 🟡 P1 |
| Mission Skip → next state | DASHBOARD_SCREEN_SPEC.md | 🟡 P1 |
| Goal → Mission cross-link | PROFILE_SCREEN_SPEC.md | 🟡 P1 |
| Score ring at 0 visual | DASHBOARD_SCREEN_SPEC.md | 🟡 P1 |
| Settings quick access in Profile | PROFILE_SCREEN_SPEC.md | 🟡 P1 |
| Simulator Help action definition | SIMULATOR_SCREEN_SPEC.md | 🟢 P2 |

---

## 6. What Works Well

These flows are clean, correctly specified, and ready for implementation as-is:

| Flow | Status | Reason |
|------|--------|--------|
| Returning User → Dashboard → Daily Mission → Complete | ✅ Ready | Well-specified, clear states |
| Dashboard → AI Insight Card → AI Coach | ✅ Ready | 1-tap, correctly wired |
| Profile → Achievements → View All | ✅ Ready | Standard stack navigation |
| FAB → Activity Log Modal | ✅ Ready | Global, accessible, well-defined |
| Deep Link: missions, score, coach, forecast, simulator, achievement/{id} | ✅ Ready | 6 of 8 deep links defined |
| Offline degradation (cached screens) | ✅ Ready | Correctly specified per tab |
| Auth guard (protected routes) | ✅ Ready | Standard, all routes protected |
| Mission Completion Flow | ✅ Ready | Full flow defined with celebration |

---

## 7. Final Approval

| Category | Status |
|----------|--------|
| Navigation Architecture | ✅ PASS |
| Bottom Tab Structure | ✅ PASS |
| FAB Behavior | ⚠️ PASS WITH FIXES (clearance, Simulator exception) |
| Back Navigation | ⚠️ PASS WITH FIXES (stack vs modal clarity) |
| Deep Links | ⚠️ PASS WITH FIXES (2 missing) |
| New User Flow | ❌ FAIL (no onboarding hook, no first mission surface) |
| Returning User Flow | ✅ PASS |
| AI Coach Flow | ❌ FAIL (recommendation CTA undefined) |
| Simulator Flow | ❌ FAIL (no post-simulation CTA) |
| Profile Flow | ⚠️ PASS WITH FIXES (settings discovery, goal-mission link) |

### **Overall Verdict: ⚠️ PASS WITH FIXES**

> [!CAUTION]
> **4 P0 critical gaps must be resolved in documentation before any frontend implementation begins.**
> Proceeding without fixing F-1, F-3, F-6, and F-9 will result in core user flows being non-functional at launch.

The architecture is sound. The UX philosophy is correct. The navigation depth is appropriate. The gaps are specific and actionable — not structural. All four P0 fixes are small documentation additions, not architectural changes.

**Recommended next step**: Update the 4 affected spec files with the defined fixes, then proceed to FE-10 Implementation.
