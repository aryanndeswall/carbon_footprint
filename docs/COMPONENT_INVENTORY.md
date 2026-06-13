# COMPONENT_INVENTORY.md

## Purpose

This document defines all reusable UI components used throughout Carbon Sense.

It serves as the source of truth for:

* React Native Components
* React Bits Integration
* Stitch Design Generation
* Design Consistency
* Frontend Development

---

# Component Philosophy

Carbon Sense follows:

```text
Atomic Design
+
Feature-Based Architecture
```

Components should be:

* Reusable
* Typed
* Accessible
* Theme-Aware
* Animation-Ready

Avoid screen-specific components whenever possible.

---

# Component Layers

```text
Primitives

↓

Shared Components

↓

Feature Components

↓

Screen Assemblies
```

---

# 1. UI Primitives

Located:

```text
src/components/ui
```

---

## Button

Purpose:

Primary interactions.

Variants:

```text
Primary
Secondary
Ghost
Danger
```

---

## IconButton

Purpose:

Compact actions.

Examples:

```text
Back
Close
Settings
Refresh
```

---

## Input

Purpose:

User text input.

Support:

```text
Text
Email
Password
Search
```

---

## Card

Purpose:

Base surface component.

Variants:

```text
Default
Elevated
Outlined
Interactive
```

---

## Badge

Purpose:

Status indicators.

Examples:

```text
Easy
Medium
Hard

Online
Offline

Completed
```

---

## Chip

Purpose:

Quick selections.

Examples:

```text
Transport
Food
Energy
```

---

## Avatar

Purpose:

User identity.

Sizes:

```text
Small
Medium
Large
XL
```

---

## Divider

Purpose:

Visual separation.

---

## Skeleton

Purpose:

Loading state placeholder.

Variants:

```text
Text
Card
Avatar
Row
```

---

# 2. Layout Components

Located:

```text
src/components/layout
```

---

## ScreenContainer

Purpose:

Standard screen wrapper.

Responsibilities:

* Safe Area
* Background
* Padding

---

## Section

Purpose:

Group content.

---

## Header

Purpose:

Reusable screen header.

---

## BottomSheet

Purpose:

Modal interactions.

Examples:

```text
Filters
Activity Logging
Quick Actions
```

---

## EmptyState

Purpose:

No-data experiences.

---

## ErrorState

Purpose:

Inline error handling.

---

# 3. Progress Components

Located:

```text
src/components/progress
```

---

## ProgressRing

Purpose:

Visual score representation.

Used For:

```text
Sustainability Score
Mission Progress
```

---

## ProgressBar

Purpose:

Linear progress.

Used For:

```text
Goals
Weekly Missions
```

---

## StatCard

Purpose:

Display metrics.

Examples:

```text
Score
Carbon Saved
Streak
```

---

## TrendIndicator

Purpose:

Display trend direction.

States:

```text
Improving
Stable
Declining
```

---

# 4. Dashboard Components

Located:

```text
src/features/dashboard/components
```

---

## DashboardHeader

Contains:

```text
Avatar
Streak Badge
Network Status
```

---

## HeroScoreCard

Displays:

```text
Sustainability Score
Score Change
```

---

## DailyMissionCard

Displays:

```text
Mission
Reward
Progress
```

---

## QuickActionCard

Examples:

```text
Metro Ride
Vegetarian Meal
Electricity Usage
```

---

## CategoryCard

Displays:

```text
Transport
Food
Energy
Shopping
```

---

## AIInsightCard

Displays:

```text
Coach Insight
Recommendation
```

---

## ForecastCard

Displays:

```text
Forecast Summary
```

---

## RecentActivityRow

Displays:

```text
Activity
Timestamp
Impact
```

---

# 5. Mission Components

Located:

```text
src/features/missions/components
```

---

## MissionCard

States:

```text
Available
In Progress
Completed
Expired
```

---

## MissionProgressCard

Displays:

```text
Completion %
```

---

## WeeklyMissionCard

Displays:

```text
Progress
Reward
```

---

## AchievementPreviewCard

Displays:

```text
Upcoming Achievement
```

---

# 6. AI Coach Components

Located:

```text
src/features/coach/components
```

---

## InsightCard

Displays:

```text
Today's Insight
```

---

## RecommendationCard

Displays:

```text
Action Recommendation
```

---

## ForecastInsightCard

Displays:

```text
Forecast Summary
```

---

## BehaviorTrendCard

Displays:

```text
Behavior Trend
```

---

## PromptChip

Examples:

```text
How can I improve?

What should I do next?
```

---

## ChatMessage

Variants:

```text
User
Coach
```

---

# 7. Simulator Components

Located:

```text
src/features/simulator/components
```

---

## ScenarioBuilder

Purpose:

Create simulations.

---

## ScenarioInput

Variants:

```text
Slider
Select
Counter
```

---

## CurrentStateCard

Displays:

```text
Current Metrics
```

---

## ProjectedStateCard

Displays:

```text
Projected Metrics
```

---

## ImpactSummaryCard

Displays:

```text
Carbon Reduction
Score Change
```

---

## AIExplanationCard

Displays:

```text
Simulation Explanation
```

---

## ComparisonCard

Displays:

```text
Scenario Comparison
```

---

## SavedScenarioCard

Displays:

```text
Stored Simulations
```

---

# 8. Profile Components

Located:

```text
src/features/profile/components
```

---

## ProfileHero

Displays:

```text
Avatar
Name
Score
Streak
```

---

## ImpactSummaryCard

Displays:

```text
Carbon Saved
Activities
Missions
```

---

## GoalCard

Displays:

```text
Goal Progress
```

---

## AchievementCard

Displays:

```text
Achievement
```

---

## StatisticsCard

Displays:

```text
Personal Statistics
```

---

# 9. OCR Components

Located:

```text
src/features/ocr/components
```

---

## UploadCard

Actions:

```text
Camera
Gallery
PDF
```

---

## ExtractionResultCard

Displays:

```text
Extracted Data
```

---

## ReviewForm

Purpose:

User Verification

---

## OCRHistoryCard

Displays:

```text
Document History
```

---

# 10. Community Components

Located:

```text
src/features/community/components
```

---

## CommunityImpactCard

Displays:

```text
Community Metrics
```

---

## LeaderboardCard

Displays:

```text
Ranking
```

---

## GroupCard

Displays:

```text
Community Group
```

---

# 11. Navigation Components

Located:

```text
src/navigation/components
```

---

## BottomTabBar

Tabs:

```text
Home
Missions
Coach
Community
Profile
```

---

## FloatingActionButton

Purpose:

Quick Activity Logging

---

## NetworkIndicator

States:

```text
Online
Offline
Syncing
```

---

# Shared Animation Components

Located:

```text
src/components/animations
```

---

## AnimatedCounter

Used For:

```text
Scores
Statistics
```

---

## AnimatedProgressRing

Used For:

```text
Hero Score
```

---

## CelebrationOverlay

Used For:

```text
Mission Completion
Achievement Unlock
```

---

# MVP Components

Must Exist First

```text
Button
Card
Avatar
Badge

DashboardHeader
HeroScoreCard
DailyMissionCard
QuickActionCard

MissionCard

InsightCard

ScenarioBuilder

ProfileHero

FloatingActionButton
```

---

# Version 1 Component Count

Approximate:

```text
UI Primitives: 10

Layout: 6

Dashboard: 7

Missions: 4

Coach: 5

Simulator: 6

Profile: 5

OCR: 4

Community: 3

Navigation: 3

Animations: 3
```

Total:

```text
~56 Reusable Components
```

---

# Final Goal

Every Carbon Sense screen should be built from reusable components.

Benefits:

* Faster development
* Consistent UI
* Easier testing
* Easier maintenance
* Better Stitch → React Bits → Expo workflow
