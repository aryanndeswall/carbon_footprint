# SIMULATOR_SCREEN_SPEC.md

## Purpose

This document defines the complete behavior, layout, interaction model, and user experience for the Carbon Sense What-If Simulator.

The Simulator is the decision-making engine of Carbon Sense.

It helps users understand:

```text id="r4m1ek"
What happens if I change my behavior?
```

before they actually make the change.

---

# Screen Objective

The Simulator should answer:

1. What action should I take?
2. How much impact will it have?
3. How will my Sustainability Score change?
4. Which option is best?

---

# Product Philosophy

The Simulator transforms sustainability from:

```text id="x4l0ne"
Tracking
```

into

```text id="q0k6cv"
Decision Making
```

The user should feel empowered.

Not judged.

---

# Core Principle

Calculations are deterministic.

AI only explains outcomes.

AI never calculates outcomes.

---

# User Goals

Users should leave knowing:

```text id="9gktci"
What change matters most

What improvement is realistic

What action to take next
```

---

# Data Dependencies

Consumes:

* Activity History
* Sustainability Score
* Forecast Data
* Mission Data
* Carbon Engine
* Recommendation Engine

---

# Layout Structure

Scrollable screen.

```text id="8wdrlz"
Header

Scenario Builder

Current State

Projected State

Impact Summary

AI Explanation

Scenario Comparison

Saved Scenarios
```

---

# 1. Header

## Purpose

Establish simulation context.

### Required Elements

* Screen Title
* Scenario Counter
* Help Action

### Example

```text
What-If Simulator

Explore Future Outcomes
```

### Help Action Definition (P2)

Tapping the Help action in the header opens a bottom sheet tutorial.

The tutorial contains:

```text
How to use the Simulator

1. Choose a scenario category (Transport, Food, Energy).
2. Adjust the sliders or select a preset.
3. See your projected score and carbon impact update in real time.
4. Save your scenario or log the activity directly.
```

* Bottom sheet title: "How It Works"
* Close button: standard X dismiss icon
* This tutorial is shown automatically on the user's first Simulator visit, then only on Help tap.

---

# 2. Scenario Builder

## Purpose

Allow users to create sustainability scenarios.

### Input Methods

* Sliders
* Selectors
* Chips
* Increment Controls

Avoid long forms.

---

# Scenario Categories

Transport

Food

Energy

Shopping

Mixed Lifestyle

Goal Based

---

# Example Inputs

Transport:

```text id="dzpv0r"
Car Trips Per Week

5
```

↓

```text id="vij8d2"
2
```

---

Food:

```text id="z6ik4m"
Vegetarian Meals Per Week

1
```

↓

```text id="m7pwgh"
4
```

---

Energy:

```text id="9vkhg9"
Electricity Usage

250 kWh
```

↓

```text id="cyc2b0"
200 kWh
```

---

# 3. Current State Card

## Purpose

Show current baseline.

### Required Elements

* Current Footprint
* Current Sustainability Score
* Current Forecast

### Example

```text id="7rks4v"
Current Footprint

92 kg CO₂

Current Score

82
```

---

# 4. Projected State Card

## Purpose

Show future outcome.

### Required Elements

* Projected Footprint
* Projected Score
* Forecast Change

### Example

```text id="mbf7xk"
Projected Footprint

78 kg CO₂

Projected Score

88
```

---

# Animation

Values should animate from:

```text id="5xv6zx"
Current
```

to

```text id="y8q5ut"
Projected
```

---

# 5. Impact Summary Card

## Purpose

Show outcome at a glance.

### Required Metrics

Carbon Reduction

Score Increase

Mission Impact

Forecast Impact

---

# Example

```text id="8n4ozm"
Carbon Reduction

-14 kg CO₂

Score Increase

+6

Goal Progress

+12%
```

---

# Impact Colors

Positive

Green

---

Neutral

Blue

---

Negative

Orange

---

# 6. AI Explanation Card

## Purpose

Translate calculations into plain English.

### Example

```text id="r9izrb"
Switching three weekly car trips to metro could reduce your monthly footprint by approximately 14 kg CO₂ and increase your Sustainability Score by 6 points.
```

---

# Structure

Every explanation should contain:

### Action

What changed.

---

### Impact

Expected outcome.

---

### Recommendation

Suggested next step.

---

# 7. Scenario Comparison

## Purpose

Compare multiple choices.

---

# Example

```text id="p9i2eo"
Metro

vs

Carpool

vs

Cycling
```

---

# Comparison Table

Display:

* Carbon Impact
* Score Impact
* Difficulty
* Recommendation Rank

---

# Example

```text id="wyf24w"
Cycling

Impact:
Highest

Difficulty:
Medium

Score:
+8
```

---

# 8. Saved Scenarios

## Purpose

Store previous simulations.

### Display

* Scenario Name
* Date
* Impact Summary

---

# Example

```text id="3s8jzg"
Metro Lifestyle

Saved Yesterday

+6 Score
```

---

# Simulator Flow

User Creates Scenario

↓

Validation

↓

Carbon Engine

↓

Score Engine

↓

Forecast Engine

↓

Results Generated

↓

AI Explanation

↓

Post-Simulation CTAs (F-9 Fix)

↓

Optional Save

---

# Post-Simulation CTAs (F-9 Fix)

## Purpose

After simulation results are generated, users must have a clear behavioral output.

The Simulator must not be a dead-end.

## Required Behavior

Once results are displayed, a sticky CTA bar appears at the bottom of the screen:

```text
[💾 Save Scenario]   [✅ Log This Activity]
```

### Save Scenario

* Persists the current scenario to the Saved Scenarios section.
* Confirmation toast: `Scenario saved.`

### Log This Activity

* Opens the Activity Logging Modal pre-seeded with the primary simulated behavior.
* Example: if the scenario was "Switch 3 car trips to metro", the modal opens with Transport pre-selected and metro mode pre-filled.
* This is the primary behavioral output of the Simulator.

### Turn into Mission (V1.5)

* Creates a custom mission based on the simulated behavior.
* Display as a secondary option below the sticky bar:

```text
✨ Turn this into a Mission
```

* Requires backend support for custom mission creation.
* If backend does not support this in V1, hide this option — do not show a disabled state.

## Design Notes

* The sticky CTA bar sits above the tab bar and FAB.
* The FAB is hidden on the Simulator screen to avoid visual conflict with the sticky CTA bar.
* Both CTAs must always be visible after results load — do not require additional scrolling to find them.

---

# Preset Scenarios

Provide quick-start examples.

---

# Transport Presets

```text id="hyomfo"
Use Metro

Carpool

Cycle to Work
```

---

# Food Presets

```text id="8rj6wk"
Vegetarian Lifestyle

Reduce Meat Consumption
```

---

# Energy Presets

```text id="8xcz17"
Reduce Usage by 10%

Reduce Usage by 20%
```

---

# Goal-Based Presets

```text id="4t5y79"
Reach Score 90

Reduce Footprint by 15%
```

---

# Loading States

Required:

* Scenario Skeleton
* Results Skeleton
* Comparison Skeleton

Never use full-screen spinners.

---

# Empty State

Display:

```text id="9y6hnl"
Create your first scenario to explore future outcomes.
```

---

# Error States

Examples:

```text id="5rby1z"
Unable to generate simulation.

Retry
```

Must be inline.

---

# Accessibility

Requirements:

* WCAG AA
* Screen Reader Support
* Dynamic Type
* Reduced Motion Compatibility

---

# Motion System

## Slider Changes

Real-time updates

---

## Score Changes

Animated Counter

---

## Carbon Changes

Animated Number Transition

---

## Result Cards

Fade + Lift

---

# Component Hierarchy

```text
SimulatorScreen

SimulatorHeader

ScenarioBuilder

ScenarioInput

CurrentStateCard

ProjectedStateCard

ImpactSummaryCard

AIExplanationCard

ComparisonCard

PostSimulationCTABar

SavedScenarioCard

SimulatorSkeleton

HelpBottomSheet
```

---

# Analytics Events

Track:

Scenario Created

Scenario Generated

Scenario Saved

Scenario Compared

Preset Selected

Simulation Viewed

---

# Success Metrics

The Simulator succeeds when:

* Users create scenarios
* Users adopt recommendations
* Sustainability Scores improve
* Forecast engagement increases

---

# Visual Tone

The Simulator should feel:

* Intelligent
* Predictive
* Interactive
* Empowering

Never:

* Complex
* Scientific
* Overwhelming

---

# Competition Demo Moment

Judge asks:

```text id="8d0ix5"
How does your app change behavior?
```

Demo:

```text id="yw5eyh"
Current Score: 82

↓

Use Metro 3 Times Weekly

↓

Projected Score: 88

↓

14kg CO₂ Saved

↓

AI Explanation
```

The value proposition becomes immediately obvious.

---

# Final Design Intent

When users leave the Simulator they should think:

```text id="yj9f5e"
I understand my options.

I understand the impact.

I know what action to take.
```

The Simulator transforms Carbon Sense from a tracking tool into a decision-making platform.
