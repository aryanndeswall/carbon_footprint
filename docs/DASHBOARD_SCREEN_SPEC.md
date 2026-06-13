# DASHBOARD_SCREEN_SPEC.md

## Purpose

This document defines the complete behavior, layout, content structure, and interaction model for the Carbon Sense Dashboard screen.

The Dashboard is the primary home screen of the application and the first screen users should understand within 3 seconds of opening the app.

The dashboard must answer:

1. Did I keep my streak?
2. How am I doing today?
3. What should I do next?
4. Can I log something quickly?

---

## Screen Objective

The Dashboard is not a reporting screen.

It is a daily habit engine.

Its job is to guide the user toward action, reinforce progress, and make the app feel alive, motivating, and trustworthy.

---

## Primary User Goal

The user opens the app and immediately sees:

* current progress
* current streak
* today’s mission
* one obvious next action
* a quick way to log activity

---

## Screen Priority Order

The dashboard hierarchy must be:

1. Streak visibility
2. Progress visibility
3. Daily mission
4. Quick activity logging
5. AI insight
6. Category breakdown
7. Recent activity
8. Forecast and advanced analytics

Action must always come before analytics.

---

## Required Data Dependencies

The dashboard consumes:

* user profile
* current streak
* sustainability score
* today’s footprint
* daily mission
* recent activity
* latest AI insight
* forecast summary
* offline sync state

---

## Top-Level Layout

The dashboard is a vertically scrollable screen with these sections:

1. Header
2. First-Run Banner (new users only)
3. Hero Summary
4. Daily Mission Card
5. Quick Actions Row
6. Sustainability Score Card
7. Category Breakdown Grid
8. AI Insight Card
9. Forecast Card
10. Recent Activity List
11. Floating Action Button
12. Offline Banner

---

## 1. Header

### Purpose

Provide identity, streak visibility, and connection status.

### Required Elements

* profile avatar on the left
* streak badge in the center
* network indicator on the right

### Behavior

* tapping avatar opens profile
* streak badge opens streak details
* network indicator is informational only

### Copy

Streak badge example:

```text
🔥 12 Day Streak
```

### Design Notes

The header must feel premium and compact. It should not consume too much vertical space.

---

## 2. First-Run Banner

### Purpose

Bridge the gap between onboarding completion and first mission engagement.

Users who have just signed up have no activities and no score.

The dashboard must guide them immediately to their first action.

### Visibility Rule

Display ONLY when:

```text
user.activitiesLogged === 0
```

Dismiss automatically after the user logs their first activity.

Do not show again after dismissal.

### Required Elements

* Welcome headline
* One-line value statement
* Primary CTA button

### Example Copy

```text
🌱 Welcome to Carbon Sense!
Start your first mission to earn your first Sustainability Score.
[Start First Mission →]
```

### Behavior

* Tapping the CTA navigates to the Missions tab
* The Missions tab highlights the first available mission on arrival
* FAB pulses once (subtle scale animation) on first app open to draw attention
* Banner must not block the rest of the dashboard — it sits above the Hero Summary and can be dismissed with a close icon

### Design Notes

This banner must feel motivating and welcoming, not clinical.

Use Climate Green (`theme.colors.primary`) accent.

Do not use alarming or pressure-inducing language.

---

## 3. Hero Summary

### Purpose

Show the most important progress indicator at the top of the screen.

### Primary Display

* Sustainability Score as the hero metric
* optional carbon metric secondary beneath it
* progress ring or circular visualization

### Example Copy

```text
82
Sustainability Score
+3 this week
```

### Behavioral Rule

The Sustainability Score should be visually dominant.

Raw carbon metrics may appear, but should not dominate the hero section.

### Optional Secondary Value

```text
3.9 kg CO₂ today
```

This is secondary to the score.

### Zero State (New User)

When `sustainabilityScore === 0` or no data exists:

* Do NOT display a 0% filled ring — this is visually alarming.
* Display the ring in a neutral unfilled state with a dashed or dimmed stroke.
* Replace the score number with motivational copy.

#### Example Zero State Copy

```text
Let's get started!
Log your first activity to begin tracking.
```

* The ring fill animation only begins after the user has at least one logged activity.
* The secondary carbon value should be hidden in zero state.

---

## 4. Daily Mission Card

### Purpose

Show the user the next best action.

### Required Elements

* mission title
* mission category
* difficulty label
* estimated impact
* primary completion button

### Example Copy

```text
Today's Mission
Eat one vegetarian meal
Easy
+3 Score
1.2 kg CO₂ saved
```

### Actions

* Mark Completed
* Skip for Today

### Completion Behavior

* Completion triggers mission update
* Completion updates score, streak, and dashboard state
* Progress ring animates to reflect new score
* Streak badge pulses

### Skip Behavior (F-5 Fix)

When the user taps "Skip for Today":

1. Collapse the mission card to a minimal "Mission Skipped" state.
2. Do NOT remove the card entirely — it remains as a motivational nudge.
3. Display secondary link beneath the collapsed card:

```text
See More Missions →
```

4. Tapping "See More Missions" navigates to the Missions tab.
5. The collapsed card uses muted styling — no primary color emphasis.

#### Skipped Card Copy

```text
Mission skipped for today.
See More Missions →
```

### Design Notes

This should be one of the most prominent cards on the screen after the hero section.

---

## 5. Quick Actions Row

### Purpose

Reduce friction for logging common activities and accessing key features.

### Required Elements

Horizontal scrollable cards or chips.

### Default Activity Chips

* Metro Ride
* Bus Commute
* Vegetarian Meal
* Electricity Usage

### Simulate Chip (P1 Addition)

A final chip in the Quick Actions Row navigates directly to the What-If Simulator.

```text
🔮 Simulate
```

* This chip must always be present and visible.
* It is visually distinct from activity chips — use `theme.colors.simulation` (Freeze Blue) accent.
* Tapping navigates to `/simulator` directly.
* This makes the Simulator a first-class action accessible from the primary screen.

### Activity Chip Behavior

Tapping an activity chip opens the Activity Logging Modal with that category pre-selected.

### Design Notes

All chips should feel like one-tap actions, not a form.

Do not label activity chips with units or measurements — just the action name.

---

## 5. Sustainability Score Card

### Purpose

Break down the user’s behavioral progress.

### Required Elements

* overall score
* sub-scores
* small explanatory text

### Suggested Breakdown

* consistency score
* mission score
* streak score
* improvement score

### Example Copy

```text
Sustainability Score
82 / 100
Consistency 90
Missions 78
Streak 85
Improvement 72
```

### Behavior

Tap opens the full score screen.

---

## 6. Category Breakdown Grid

### Purpose

Show category-level footprint patterns at a glance.

### Required Categories

* Transport
* Food
* Electricity
* Shopping

### Required Elements for Each Card

* icon
* category title
* current value
* mini progress indicator

### Example Copy

```text
Transport
2.4 kg CO₂
```

### Design Notes

This should be a 2x2 grid on standard phones.

On larger screens, it may expand gracefully.

---

## 7. AI Insight Card

### Purpose

Show the latest coaching insight in a concise, trustworthy format.

### Required Elements

* insight label
* insight text
* suggested next step

### Example Copy

```text
💡 AI Coach
Your transport habits improved by 18% this week.
Try one more metro trip this week to reach 85.
```

### Behavior

Tap opens AI Coach screen.

### Design Notes

This should feel helpful and calm, not like a chat transcript.

---

## 8. Forecast Card

### Purpose

Show future progress in a compact, motivating format.

### Required Elements

* forecast period
* current value
* projected value
* confidence indicator

### Example Copy

```text
30 Day Forecast
82 → 88
Confidence: 81%
```

### Behavior

Tap opens forecast details.

### Design Notes

This card should be visually lighter than the hero section.

---

## 9. Recent Activity List

### Purpose

Show recent user logging history.

### Required Elements

* category icon
* activity title
* quantity
* timestamp

### Example Rows

* Metro Ride • 12 km
* Vegetarian Meal
* Bus Commute • 8 km

### Behavior

Tap opens activity details.

### Design Notes

This section should support fast scanning.

Keep rows compact and readable.

---

## 10. Floating Action Button

### Purpose

Provide the fastest path to activity logging.

### Placement

Bottom-right, fixed while scrolling.

### Behavior

Opens activity logging flow.

### Copy / Accessibility

Label:

```text
Log new activity
```

### Design Notes

This is the primary action button on the dashboard.

It must remain visible and highly tappable.

---

## 11. Offline Banner

### Purpose

Inform users when the app is offline.

### Required Copy

```text
You're offline. Activities will sync automatically.
```

### Behavior

* visible only when offline
* should not be alarming
* should not block usage

### Design Notes

Use calm informational styling.

---

## Loading States

### Required Approach

Use skeletons.

Do not use full-screen spinners.

### Required Skeletons

* header skeleton
* hero summary skeleton
* mission card skeleton
* quick action skeleton
* score card skeleton
* category grid skeleton
* insight skeleton
* forecast skeleton
* activity list skeleton

### Behavior

Skeletons should preserve layout structure and prevent content jump.

---

## Empty States

### New User Empty State

If no activity exists yet:

```text
Complete your first activity to begin tracking progress.
```

### No Recent Activity

If history is empty:

```text
No activities logged yet.
```

Include a clear CTA to log activity.

### Zero Progress State

Avoid highlighting zero values aggressively.

Prefer motivational language such as:

```text
Let's get started today.
```

---

## Error States

### Required Behavior

Errors must be shown inline.

Do not block the entire dashboard.

### Examples

* unable to load today’s progress
* unable to load AI insight
* unable to load recent activity

### Required Action

Every error state should include a retry action.

Dashboard must remain functional even if one section fails.

---

## Motion & Interaction

### Required Animations

* progress ring fills smoothly on load
* streak badge gently pulses
* FAB scales on press
* cards fade and lift on refresh
* offline banner slides in smoothly

### Motion Principles

* subtle
* premium
* non-distracting
* supportive of habit formation

---

## Accessibility Requirements

### Required Standards

* WCAG AA contrast minimum
* minimum 48x48 touch targets
* screen reader labels
* dynamic font scaling
* reduced motion compatibility

### Required Accessibility Labels

* FAB: “Log new activity”
* Streak badge: “Current streak 12 days”
* Progress ring: “Today’s sustainability score 82”
* Category cards: “Transport emissions 2.4 kilograms carbon dioxide”

---

## Responsive Behavior

The dashboard must adapt to:

* small phones
* standard phones
* large phones
* foldables
* tablets

### Rules

* keep hero section dominant
* preserve FAB visibility
* ensure category grid remains readable
* avoid crowding on smaller devices

---

## Component Hierarchy

The dashboard should be composed from reusable components:

* DashboardScreen
* DashboardHeader
* StreakBadge
* NetworkIndicator
* HeroSummary
* DailyMissionCard
* QuickActionRow
* QuickActionCard
* SustainabilityScoreCard
* CategoryBreakdownGrid
* CategoryCard
* AIInsightCard
* ForecastCard
* RecentActivityList
* RecentActivityRow
* FloatingActionButton
* OfflineBanner
* DashboardSkeleton

---

## Data Refresh Behavior

### On Screen Focus

Refresh:

* sustainability score
* mission
* recent activity
* AI insight
* streak
* offline state

### On Pull to Refresh

Refresh:

* all dashboard sections

### On Mission Completion

Update:

* mission card
* streak badge
* sustainability score
* recent activity
* AI insight if relevant

### Staleness Rule (F-4 Fix)

Maximum acceptable data age on tab re-focus:

```text
60 seconds
```

If cached data is older than 60 seconds when the Home tab regains focus, all dashboard sections must be automatically re-fetched.

This must be implemented via tab focus detection (Expo Router `useFocusEffect`) combined with query invalidation.

Do not rely solely on `refetchOnWindowFocus` — it is insufficient for tab-based navigation.

The user must never see data that is more than 60 seconds stale when returning to the Dashboard.

---

## Visual Tone

The dashboard should feel:

* premium
* calm
* motivating
* trustworthy
* highly usable
* habit-forming

It should not feel like:

* a corporate dashboard
* an analytics spreadsheet
* a raw data dump

---

## Final Design Intent

The dashboard should make the user feel:

* I am improving
* I know what to do next
* I am making progress
* this app is helping me build a better habit

The dashboard is the command center of Carbon Sense.

It is the screen that turns carbon awareness into daily action.
