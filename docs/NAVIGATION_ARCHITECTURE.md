# NAVIGATION_ARCHITECTURE.md

## Purpose

This document defines the navigation architecture for Carbon Sense.

It serves as the source of truth for:

* Expo Router Structure
* Route Naming
* Deep Linking
* Navigation Guards
* Tab Navigation
* Stack Navigation

---

# Navigation Philosophy

Carbon Sense is a behavior-change application.

Navigation should prioritize:

1. Daily Actions
2. Mission Completion
3. Coaching
4. Progress
5. Community

Navigation must feel simple.

Users should never be more than 2 taps away from:

* Logging an activity
* Viewing missions
* Checking progress

---

# Navigation Structure

Application uses:

* Root Stack Navigator
* Authentication Stack
* Main Tab Navigator
* Feature Stacks

---

# Root Navigation

```text
Root
│
├── Splash
│
├── Auth Stack
│
└── Main Application
```

---

# Splash Flow

```text
Splash
│
├── Authenticated
│   └── Main Tabs
│
└── Not Authenticated
    └── Auth Stack
```

---

# Authentication Stack

```text
Auth Stack
│
├── Onboarding
├── Login
└── Sign Up
```

Authentication screens are isolated.

Users cannot access protected routes.

---

# Main Application

Uses Bottom Tab Navigation.

```text
Main Tabs
│
├── Home
├── Missions
├── Coach
├── Community
└── Profile
```

### Tab Notification Badges

| Tab | Badge Condition | Badge Style |
|-----|----------------|-------------|
| Home | Never | — |
| Missions | Uncompleted daily missions exist | Count badge (e.g., `3`) |
| Coach | New AI insight generated since last visit | Red dot (no count) |
| Community | — | Reserved for V2 |
| Profile | — | Reserved for V2 |

#### Coach Tab Badge Rules

* Badge appears when `hasUnreadInsight === true`.
* Badge clears immediately when the Coach tab is opened.
* Badge state is managed client-side in `useCoachData` hook.
* Badge is a red dot indicator with no count number.

---

# Home Tab

Primary destination.

```text
Home
│
├── Dashboard
│
├── Activity History
│
├── Activity Details
│
├── Sustainability Score
│
├── Forecast
│
└── Simulation Results
```

---

# Missions Tab

Mission-focused experience.

```text
Missions
│
├── Mission List
│
└── Mission Details
```

---

# Coach Tab

AI and sustainability intelligence.

```text
Coach
│
├── AI Coach
│
├── Forecast
│
└── What-If Simulator
```

---

# Community Tab

Social engagement.

```text
Community
│
├── Community Home
│
├── Group Details
│
├── Leaderboard
│
└── Community Impact
```

---

# Profile Tab

Personal account area.

```text
Profile
│
├── Profile
│
├── Achievements
│
├── Settings
│
├── Preferences
│
└── Account
```

---

# Global Modal Routes

Accessible from anywhere.

---

## Activity Logging Modal

```text
Activity Logging
```

Access:

Floating Action Button.

Purpose:

Fast activity creation.

---

## OCR Upload Modal

```text
OCR Upload
```

Access:

Dashboard
Activity Logging
Profile

---

## OCR Review Modal

```text
OCR Review
```

Opened after successful extraction.

---

# Floating Action Button

Present globally.

Location:

Bottom Right.

Action:

```text
Log Activity
```

Opens:

```text
Activity Logging Modal
```

### FAB Clearance Rule

The FAB must maintain minimum clearance from the bottom tab bar:

```text
marginBottom = tabBarHeight + 16px
```

This prevents visual collision with the Profile tab icon on small phones (≤375px).

### FAB Exceptions

The FAB is hidden on the following screens:

* What-If Simulator — hidden to prevent distraction and conflict with the Post-Simulation CTA bar.

On all other screens, the FAB must remain visible and tappable.

---

# Dashboard Navigation

Dashboard acts as command center.

Cards navigate to:

```text
Mission Card
    → Mission Details

AI Insight
    → AI Coach

Score Card
    → Sustainability Score

Forecast Card
    → Forecast

Recent Activity
    → Activity History
```

---

# Coach Navigation

AI Coach can navigate to:

```text
AI Coach
│
├── Recommendation
│
├── Forecast
│
└── Simulator
```

---

# Simulator Navigation

```text
What-If Simulator
│
└── Simulation Results
```

Results are generated after simulation execution.

---

# Achievement Navigation

```text
Achievements
│
└── Achievement Details
```

Future expansion supported.

---

# Community Navigation

```text
Community
│
├── Group
│
├── Leaderboard
│
└── Impact
```

No public social feed in Version 1.

---

# Deep Link Architecture

Supported:

```text
carbonsense://dashboard

carbonsense://missions

carbonsense://score

carbonsense://coach

carbonsense://forecast

carbonsense://simulator

carbonsense://achievement/{id}

carbonsense://activity/log
```

### Deep Link Definitions

| Deep Link | Destination | Use Case |
|-----------|-------------|----------|
| `carbonsense://dashboard` | Home Tab (Dashboard) | Push notification — return to app |
| `carbonsense://missions` | Missions Tab | Push notification — daily mission reminder |
| `carbonsense://score` | Sustainability Score Screen | Score milestone notification |
| `carbonsense://coach` | Coach Tab | New insight notification |
| `carbonsense://forecast` | Forecast Screen | Weekly forecast ready |
| `carbonsense://simulator` | Simulator Screen | Direct feature access |
| `carbonsense://achievement/{id}` | Achievement Details | Achievement unlocked notification |
| `carbonsense://activity/log` | Activity Logging Modal | Push notification — log activity CTA |

---

# Route Protection

Protected Routes:

```text
Dashboard
Missions
Coach
Community
Profile
```

Require authentication.

---

# Back Navigation Behavior

Navigation type per screen:

| Screen | Route Group | Back Behavior |
|--------|-------------|---------------|
| Dashboard | `(tabs)/home` | Tab — no back |
| Missions | `(tabs)/missions` | Tab — no back |
| Coach | `(tabs)/coach` | Tab — no back |
| Community | `(tabs)/community` | Tab — no back |
| Profile | `(tabs)/profile` | Tab — no back |
| Mission Details | Stack under Missions | Stack back to Mission List |
| Achievement Details | Stack under Profile | Stack back to Achievements |
| Activity Log Modal | Global modal | Dismiss (swipe down or X) |
| OCR Upload | Global modal | Dismiss |
| OCR Review | Stack under OCR Upload | Stack back to OCR Upload |
| Forecast | Root stack (`/forecast`) | Stack back to calling screen |
| Simulator | Root stack (`/simulator`) | Stack back to calling screen |
| Score | Root stack (`/score`) | Stack back to calling screen |
| Settings | Root stack (`/settings`) | Stack back to Profile |

### Implementation Note

`forecast/` and `simulator/` are root-level routes outside the `(tabs)/` group.

They must be configured as stack screens in the root `_layout.tsx`.

Back navigation will pop to the screen that navigated to them — this is correct and expected behavior.

---

# Offline Navigation

Accessible Offline:

* Dashboard Cache
* Missions Cache
* Activity History Cache
* Achievements Cache

Unavailable Offline:

* AI Coach Generation
* OCR Processing
* Forecast Refresh

---

# Expo Router Structure

```text
app/
│
├── (auth)/
│   ├── onboarding
│   ├── login
│   └── signup
│
├── (tabs)/
│   ├── home
│   ├── missions
│   ├── coach
│   ├── community
│   └── profile
│
├── score/
│
├── forecast/
│
├── simulator/
│
├── achievements/
│
├── activity/
│
├── ocr/
│
└── settings/
```

---

# Version 1 Navigation Principles

Navigation should optimize for:

* Daily Engagement
* Mission Completion
* Sustainability Score Growth
* AI Coaching Adoption

Avoid:

* Complex menu hierarchies
* Hidden actions
* Excessive nesting

Maximum navigation depth:

3 levels.

---

# Final Navigation Hierarchy

```text
Splash
│
Auth
│
Main Tabs
│
├── Home
├── Missions
├── Coach
├── Community
└── Profile
│
Global FAB
│
└── Activity Logging
```

This architecture becomes the source of truth for all frontend implementation and Expo Router setup.
