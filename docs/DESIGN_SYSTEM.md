# DESIGN_SYSTEM.md

# Carbon Sense Design System

Version: 1.0

Status: Source of Truth

---

# Design Philosophy

Carbon Sense is not a carbon calculator.

Carbon Sense is a sustainability behavior-change platform.

The UI should encourage:

* Daily engagement
* Habit formation
* Progress visibility
* Positive reinforcement
* Trust

The experience should feel like:

* Duolingo (motivation)
* Apple Fitness (progress)
* Modern fintech (trust)

The experience should NOT feel like:

* Excel dashboard
* Corporate ESG software
* Scientific calculator
* Government reporting tool

---

# Core Design Principles

## Action Before Analytics

Always show:

"What should I do next?"

before:

"What happened?"

---

## Progress Before Data

Always prioritize:

* Sustainability Score
* Missions
* Streaks

before:

* Carbon metrics
* Historical reports

---

## Positive Reinforcement

Reward:

* Consistency
* Improvement
* Participation

Avoid:

* Shame
* Guilt
* Fear

---

## Calm Intelligence

The app should feel:

* Helpful
* Confident
* Intelligent

Never overwhelming.

---

# Brand Personality

## Traits

* Sustainable
* Optimistic
* Modern
* Intelligent
* Friendly
* Trustworthy

---

## Emotional Goals

Users should feel:

* Motivated
* Capable
* In Control
* Improving

---

# Color System

## Primary

Climate Green

```css
#22C55E
```

Purpose:

* Primary Actions
* Progress
* Positive States

---

## Secondary

Deep Emerald

```css
#15803D
```

Purpose:

* Dark mode accents
* Elevated actions

---

# Neutral Palette

## Light Mode

Background

```css
#F8FAFC
```

Surface

```css
#FFFFFF
```

Border

```css
#E2E8F0
```

Primary Text

```css
#0F172A
```

Secondary Text

```css
#64748B
```

---

## Dark Mode

Background

```css
#0F172A
```

Surface

```css
#111827
```

Border

```css
#334155
```

Primary Text

```css
#F8FAFC
```

Secondary Text

```css
#CBD5E1
```

---

# Semantic Colors

## Success

```css
#22C55E
```

---

## Warning

```css
#F59E0B
```

---

## Error

```css
#EF4444
```

---

## Info

```css
#3B82F6
```

---

# Special Colors

## Streak Flame

```css
#F97316
```

Used for:

* Streaks
* Achievement moments

---

## Freeze Blue

```css
#38BDF8
```

Used for:

* Streak Freeze
* Forecasting
* Simulations

---

# Typography

## Font Family

Headings

```text
Outfit
```

Body

```text
Inter
```

---

# Type Scale

## H1

Purpose:

Hero Metrics

Example:

```text
82
```

Size:

```text
36-40
```

Weight:

```text
700
```

---

## H2

Section Titles

Size:

```text
28
```

Weight:

```text
600
```

---

## H3

Card Titles

Size:

```text
20
```

Weight:

```text
600
```

---

## Body

Size:

```text
16
```

Weight:

```text
400
```

---

## Caption

Size:

```text
12-14
```

Weight:

```text
400
```

---

# Spacing System

Base Unit:

```text
4px
```

Scale:

```text
4
8
12
16
24
32
48
64
```

Never use arbitrary spacing.

---

# Border Radius

Small

```text
8
```

Medium

```text
16
```

Large

```text
24
```

Hero Cards

```text
32
```

---

# Elevation

## Level 1

Subtle cards

---

## Level 2

Interactive cards

---

## Level 3

Floating elements

Example:

* FAB
* Bottom sheets

---

# Icons

Library:

```text
Lucide
```

Preferred Style:

```text
Outlined
```

Avoid:

```text
Filled icon sets
```

unless necessary.

---

# Component Standards

## Cards

Characteristics:

* Rounded
* Spacious
* Elevated
* Touch Friendly

Minimum Height:

```text
72px
```

---

## Buttons

Minimum Height:

```text
48px
```

Primary:

Climate Green

Secondary:

Outlined

---

## Inputs

Style:

* Clean
* Rounded
* Minimal

No heavy borders.

---

# Motion System

Motion should feel:

* Smooth
* Intentional
* Fast

---

## Duration

Fast

```text
150ms
```

---

Normal

```text
250ms
```

---

Slow

```text
400ms
```

---

# Animation Patterns

## Card Entry

Fade + Lift

---

## Mission Completion

Celebration Animation

---

## Sustainability Score

Counter Animation

---

## Progress Ring

Smooth Fill

---

## FAB

Scale on Press

---

# Sustainability Score Visual Rules

Always prioritize:

```text
Sustainability Score
```

over:

```text
Carbon Footprint
```

Dashboard hierarchy:

1. Sustainability Score
2. Mission
3. AI Insight
4. Forecast
5. Carbon Metrics

---

# Accessibility

Target:

WCAG AA

Requirements:

* Dynamic Font Scaling
* Screen Reader Support
* High Contrast
* 48x48 Touch Targets

---

# Dark Mode

Required.

Must not be an afterthought.

Every component must support:

* Light Mode
* Dark Mode

---

# Responsive Targets

Support:

* Small Phones
* Standard Phones
* Large Phones
* Foldables
* Tablets

Primary optimization:

Mobile First.

---

# React Native Standards

Target:

Expo SDK

Component Philosophy:

* Reusable
* Atomic
* Typed
* Testable

Avoid:

* Screen-specific components

Prefer:

* Shared UI primitives

---

# Stitch Rules

Every Stitch prompt must follow:

* Climate-tech aesthetic
* Mobile-first
* Premium visual quality
* Spacious layout
* Sustainability Score first
* Minimal clutter
* Action-oriented UX

Never generate:

* Dense dashboards
* Corporate analytics layouts
* Spreadsheet-like screens

---

# Final Experience Goal

When a user opens Carbon Sense, they should immediately understand:

🔥 I am improving.

🎯 I know what to do next.

📈 My sustainability habits are growing.

💡 The app is helping me make better decisions.

The product should feel like a coach, not a calculator.
