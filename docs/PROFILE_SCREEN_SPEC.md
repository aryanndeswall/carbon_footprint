# PROFILE_SCREEN_SPEC.md

## Purpose

This document defines the complete behavior, layout, interaction model, and user experience for the Carbon Sense Profile Screen.

The Profile Screen is the user's sustainability identity hub.

It answers:

* Who am I?
* How am I progressing?
* What have I achieved?
* What are my goals?

---

# Screen Objective

The Profile Screen should provide:

* Personal Identity
* Sustainability Progress
* Achievement Overview
* Goal Tracking
* Account Management

---

# Product Philosophy

The Profile Screen is not a settings page.

It should feel like:

* Fitness Profile
* Progress Passport
* Personal Sustainability Journey

Not:

* Account Management Portal
* Configuration Dashboard

---

# User Goals

Users should immediately understand:

```text
My Progress

My Achievements

My Impact

My Goals
```

---

# Data Dependencies

Consumes:

* User Profile
* Sustainability Score
* Achievement Data
* Streak Data
* Goal Data
* Community Stats

---

# Layout Structure

Scrollable screen.

```text
Header

Profile Hero

Impact Summary

Achievements Preview

Goals Section

Statistics Section

Settings Section
```

---

# 1. Header

## Purpose

Identity and navigation.

### Elements

* Avatar
* User Name
* Edit Profile Button
* Settings Quick-Access Icon (F-10 Fix)

### Settings Quick-Access Icon

A settings gear icon (`⚙️`) appears in the top-right corner of the Profile header.

```text
[Avatar + Name]           [⚙️]
```

* Tapping the icon opens the Settings Bottom Sheet directly.
* This provides urgent settings access without requiring the user to scroll to the bottom of the screen.
* The Edit Profile button remains as a separate inline action next to the avatar.

---

# 2. Profile Hero

## Purpose

Personal sustainability identity.

### Required Elements

* Avatar
* Name
* Sustainability Score
* Current Streak
* Member Since

### Example

```text
Aryan

Sustainability Score
82

🔥 12 Day Streak

Member Since
June 2026
```

---

# 3. Impact Summary

## Purpose

Show total impact.

### Required Metrics

* Carbon Saved
* Missions Completed
* Activities Logged
* Community Contributions

### Example

```text
Carbon Saved

142 kg CO₂

Activities Logged

287

Missions Completed

64
```

---

# 4. Achievements Preview

## Purpose

Show latest accomplishments.

### Elements

* Achievement Badge
* Title
* Earned Date

### Example

```text
🏅 Week Warrior

Earned 2 Days Ago
```

### Action

Tap:

```text
View All Achievements
```

---

# 5. Goals Section

## Purpose

Display active goals and link them to relevant missions.

### Examples

```text
Reach Sustainability Score 90

82 / 90

91%
```

---

```text
Maintain 30-Day Streak

12 / 30 Days
```

---

### Goal → Mission Cross-Link (F-11 Fix)

Each Goal card must include a secondary contextual link:

```text
View Related Missions →
```

#### Behavior

* Tapping the link navigates to the Missions tab, filtered to missions relevant to the goal category.
* Goal category mapping:

| Goal Type | Mission Filter Applied |
|-----------|------------------------|
| Reach Score 90 | All active missions sorted by score impact |
| Maintain Streak | Daily missions sorted by ease |
| Reduce Transport Emissions | Transport category missions |
| Reduce Food Emissions | Food category missions |
| Reduce Energy Usage | Energy category missions |

* If no relevant missions exist, navigate to Missions tab without a filter.
* The link uses `theme.colors.primary` text color and is visually secondary to the goal progress bar.

---

# Goal States

Active

Completed

Expired

---

# 6. Statistics Section

## Purpose

Provide progress overview.

### Metrics

* Sustainability Score Trend
* Longest Streak
* Monthly Progress
* Mission Completion Rate

---

# Example

```text
Longest Streak

27 Days

Mission Completion

84%
```

---

# 7. Settings Section

## Purpose

Access application configuration.

### Behavior (Design Review Fix)

Settings links must NOT render as inline sub-pages on the Profile screen.

The Settings Section renders as a single collapsed row at the bottom of the Profile screen:

```text
Settings & Options   >
```

Tapping this row opens a **Settings Bottom Sheet** (slide-up modal).

This keeps the Profile screen focused on identity and progress, not administration.

### Bottom Sheet Contents

* Account
* Preferences
* Notifications
* Privacy
* Theme
* Support

### Bottom Sheet Behavior

* Dismiss by swiping down or tapping the backdrop.
* Each item in the bottom sheet navigates to the corresponding full settings screen via stack navigation.

---

# Edit Profile Flow

User taps:

```text
Edit Profile
```

↓

Profile Editor

↓

Save Changes

↓

Update Success

---

# Goal Management

Users can:

* Create Goal
* Edit Goal
* Delete Goal

---

# Achievement Flow

User taps:

```text
Achievement
```

↓

Achievement Details

↓

Progress Information

---

# Empty States

## No Achievements

```text
Complete missions to earn achievements.
```

---

## No Goals

```text
Create your first sustainability goal.
```

CTA:

```text
Create Goal
```

---

# Loading States

Required Skeletons:

* Profile Hero
* Impact Summary
* Achievement Cards
* Goal Cards

Never use full-screen spinners.

---

# Error States

Examples:

```text
Unable to load profile.

Retry
```

Must remain inline.

---

# Accessibility

Requirements:

* WCAG AA
* Dynamic Font Scaling
* Screen Reader Support
* Minimum 48x48 Touch Targets

---

# Motion System

## Profile Hero

Fade In

---

## Statistics

Animated Counters

---

## Achievements

Scale Reveal Animation

---

## Goals

Progress Animation

---

# Component Hierarchy

```text
ProfileScreen

ProfileHero

ImpactSummaryCard

AchievementPreviewCard

GoalCard

StatisticsCard

SettingsList

ProfileSkeleton
```

---

# Analytics Events

Track:

Profile Viewed

Goal Created

Goal Updated

Achievement Viewed

Settings Opened

Profile Edited

---

# Success Metrics

Profile Screen succeeds when:

* Goal creation increases
* Achievement engagement increases
* User retention improves
* Sustainability Score growth continues

---

# Visual Tone

The Profile Screen should feel:

* Personal
* Aspirational
* Rewarding
* Motivating

Never:

* Administrative
* Corporate
* Settings-heavy

---

# Final Design Intent

When users leave the Profile Screen they should think:

```text
I am making progress.

I have achieved something.

I know where I'm going next.
```

The Profile Screen is the personal sustainability identity of Carbon Sense.

