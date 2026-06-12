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
carbonsense://missions

carbonsense://score

carbonsense://coach

carbonsense://forecast

carbonsense://simulator

carbonsense://achievement/{id}
```

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
