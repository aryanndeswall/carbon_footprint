# MISSION_SCREEN_SPEC.md

## Purpose

This document defines the complete behavior, layout, content structure, and interaction model for the Carbon Sense Mission Screen.

The Mission Screen is the habit-building engine of Carbon Sense.

Its purpose is to convert sustainability awareness into daily action.

---

# Screen Objective

The Mission Screen should answer:

1. What should I do today?
2. What reward will I receive?
3. How much progress have I made?
4. What should I complete next?

---

# Product Philosophy

Missions are not tasks.

Missions are behavior-change interventions.

The screen should feel closer to:

* Duolingo
* Apple Fitness Goals
* Habitica

Than:

* Todo List
* Project Management Software
* Checklist App

---

# Primary User Goal

The user should immediately understand:

```text id="0k5xdo"
Today's Mission

Current Progress

Potential Reward
```

within seconds of opening the screen.

---

# Data Dependencies

The screen consumes:

* Daily Missions
* Weekly Missions
* Mission Progress
* Sustainability Score
* Achievement Data
* Streak Data

---

# Layout Structure

Scrollable screen.

Structure:

```text id="7j06pb"
Header

Mission Summary

Daily Missions

Weekly Missions

Completed Missions

Achievements Preview
```

---

## 1. Header

## Purpose

Establish mission context.

### Required Elements

* Screen Title
* Mission Count
* Current Completion Rate

### Example

```text
Missions

3 of 5 Completed Today
```

### First-Run Arrival State (F-3 Fix)

When the user arrives from the Dashboard First-Run Banner (via "Start First Mission" CTA):

* The first available mission card must be visually highlighted on arrival.
* Highlight style: a subtle pulsing border using `theme.colors.primary` (Climate Green).
* A one-time coach tip appears above the first mission card:

```text
👋 Here's your first mission.
Complete it to earn your first Sustainability Score!
```

* The tip dismisses automatically after 4 seconds or on user tap.
* The highlight persists until the user taps the mission card.
* This state is triggered ONLY ONCE — never on subsequent visits.

---

# 2. Mission Summary Card

## Purpose

Show overall mission progress.

### Required Elements

* Completion Percentage
* Mission Progress Ring
* Current Reward Progress

### Example

```text id="m8u09t"
Today's Progress

60%

3 / 5 Missions Completed

+9 Score Earned
```

### Design Notes

This should be the hero section.

Large.

Motivating.

Highly visual.

---

# 3. Daily Missions Section

## Purpose

Display today's active missions.

### Mission Card Structure

Each card contains:

* Icon
* Mission Title
* Description
* Difficulty
* Reward
* Progress
* CTA

---

# Example Mission

```text id="kr8vjq"
Eat One Vegetarian Meal

Easy

Reward:
+3 Sustainability Score

Impact:
1.2kg CO₂ Saved
```

---

# Difficulty Levels

Easy

Medium

Hard

---

# Difficulty Colors

Easy

Green

---

Medium

Orange

---

# Hard

Red

---

# Mission Categories

Transport

Food

Energy

Shopping

Community

Special

---

# Progress Indicators

Mission cards must support:

```text id="l9tbm3"
0%

25%

50%

75%

100%
```

Visual progress required.

---

# Mission States

## Available

Not started.

Primary CTA:

```text id="q76l2d"
Start
```

---

## In Progress

Display progress.

Primary CTA:

```text id="9jslwl"
Continue
```

---

## Completed

Display:

```text id="eh5c6k"
Completed
```

Card becomes celebratory.

---

## Expired

Display:

```text id="x3jhmj"
Expired
```

Muted styling.

---

# 4. Weekly Missions

## Purpose

Provide larger goals.

### Examples

```text id="9hymsz"
Use Public Transport 3 Times

Complete 5 Missions

Reduce Energy Usage
```

---

# Weekly Mission Card

Required:

* Progress Bar
* Remaining Tasks
* Reward

---

# Example

```text id="lqik1n"
Public Transport Champion

2 / 3 Trips Completed

Reward:
+15 Score
```

---

# 5. Completed Missions

## Purpose

Show accomplishments.

### Display

Recent completed missions.

### Example

```text id="3wz88n"
Vegetarian Meal

Completed Today

+3 Score
```

---

# 6. Achievement Preview

## Purpose

Connect missions to long-term rewards.

### Example

```text id="wcrr0n"
Next Achievement

Week Warrior

2 Missions Remaining
```

---

# Mission Completion Flow

User taps:

```text id="a4r8n8"
Complete Mission
```

↓

Validation

↓

Mission Success

↓

Reward Calculation

↓

Score Update

↓

Streak Update

↓

Achievement Check

↓

Celebration Animation

---

# Completion Celebration

Must feel rewarding.

Display:

```text id="nuk4xg"
🎉 Mission Complete

+3 Sustainability Score

+1 Streak Progress
```

---

# Animation Requirements

## Mission Completion

Confetti Burst

Score Increment Animation

Card Success State

---

## Progress Ring

Animated fill

---

## Progress Bars

Smooth transition

---

# Empty States

## No Missions Available

Display:

```text id="xowv9q"
No missions available today.
```

CTA:

```text id="2r6p1d"
Check Back Tomorrow
```

---

## New User (No Activities Logged)

Display:

```text
Complete your first mission to begin building sustainable habits.
```

The first mission card is always pre-populated for new users.

Do not show an empty state if a mission exists — always show the mission even if no activities have been logged.

If no missions have been generated yet for a new account:

* Display a skeleton in the mission card position.
* Generate the first mission server-side upon account creation.
* Maximum acceptable delay before first mission appears: 3 seconds.

---

# Error States

Examples:

```text id="d0dqfh"
Unable to load missions.

Retry
```

Must be inline.

Never block screen access.

---

# Accessibility

Requirements:

* WCAG AA
* Screen Reader Support
* Dynamic Font Scaling
* Large Touch Targets

---

# Responsive Behavior

Support:

* Small Phones
* Standard Phones
* Large Phones
* Tablets

---

# Component Hierarchy

```text id="7k3p1v"
MissionScreen

MissionHeader

MissionSummaryCard

MissionCard

WeeklyMissionCard

MissionProgressRing

MissionProgressBar

CompletedMissionCard

AchievementPreviewCard

MissionSkeleton
```

---

# Analytics Events

Track:

Mission Viewed

Mission Started

Mission Completed

Mission Skipped

Weekly Mission Completed

Achievement Triggered

---

# Success Metrics

Mission Screen succeeds when:

* Daily mission completion increases
* Streak retention increases
* Sustainability Score growth increases
* Weekly engagement improves

---

# Visual Tone

The Mission Screen should feel:

* Motivating
* Rewarding
* Energetic
* Positive

It should never feel:

* Corporate
* Administrative
* Task-heavy

---

# Final Design Intent

When users open the Mission Screen they should think:

```text id="i5cfpc"
I know exactly what to do.

I want to complete this.

I am making progress.
```

The Mission Screen is the primary habit-formation engine of Carbon Sense.
