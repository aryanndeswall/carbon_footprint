# AI_COACH_SCREEN_SPEC.md

## Purpose

This document defines the complete behavior, layout, interaction model, and user experience for the Carbon Sense AI Coach.

The AI Coach is the intelligence layer of Carbon Sense.

Its role is not to answer random questions.

Its role is to help users improve sustainability habits.

---

# Screen Objective

The AI Coach should answer:

1. How am I doing?
2. What should I improve?
3. What should I do next?
4. What action will have the biggest impact?

---

# Product Philosophy

The AI Coach is:

* A sustainability mentor
* A behavior-change assistant
* A progress guide

The AI Coach is NOT:

* ChatGPT clone
* Generic chatbot
* Customer support tool

---

# Core Principle

Action > Conversation

The screen should prioritize recommendations.

Chat comes second.

---

# User Goals

Users should leave the screen knowing:

```text id="u0n0yk"
What happened

Why it happened

What to do next
```

---

# Data Dependencies

Consumes:

* Sustainability Score
* Streak Data
* Mission Data
* Activity History
* Forecast Data
* Simulator Results
* OCR Activity Data

---

# Layout Structure

Scrollable screen.

```text id="1l5ml0"
Header

Today's Insight

Recommended Actions

Forecast Insight

Behavior Trends

Ask Coach

Conversation History
```

---

# 1. Header

## Purpose

Establish coaching context.

### Required Elements

* Title
* AI Status
* Refresh Action

### Example

```text id="sy8pdl"
AI Coach

Personal Sustainability Mentor
```

---

# 2. Today's Insight Card

## Purpose

Most important section.

First thing user sees.

### Required Elements

* Insight Headline
* Insight Summary
* Action Recommendation

### Example

```text id="tvh85l"
💡 Today's Insight

Your transport emissions decreased by 18% this week.

One more metro trip could increase your Sustainability Score by 3 points.
```

### Behavior

Tap:

```text id="p8c25u"
View Details
```

---

# 3. Recommended Actions Section

## Purpose

Show highest-impact actions.

### Rules

Maximum:

```text id="8uv18t"
3 Recommendations
```

Avoid overwhelming users.

---

# Recommendation Card Structure

Contains:

* Action Title
* Expected Impact
* Estimated Difficulty
* Expected Score Increase
* Primary CTA Button

---

# Recommendation Card CTA Behavior (F-6 Fix)

Every Recommendation Card must have a primary CTA button.

The CTA label and navigation target are determined by the recommendation `category`:

| Category | CTA Label | Navigation Target |
|----------|-----------|-------------------|
| Transport | Log This Activity | Activity Log Modal, Transport pre-selected |
| Food | Log This Activity | Activity Log Modal, Food pre-selected |
| Energy | Log This Activity | Activity Log Modal, Electricity pre-selected |
| Mission Related | View Mission | Mission Details screen (`/missions/{id}`) |
| Score Goal | Simulate This | Simulator screen (`/simulator`) with goal preset applied |
| General | Explore Options | Simulator screen with category pre-selected |

### Rules

* CTA must always be visible — never hidden below a scroll.
* CTA tap must never open a chat dialog as the primary response.
* CTA must resolve in one tap — no intermediate confirmation screens.
* The Action > Conversation principle requires direct navigation, not further coaching copy.

---

# Example

```text id="b0n7s5"
Use Metro Instead of Car

Impact:
High

Difficulty:
Easy

Expected Score:
+3
```

---

# Recommendation Categories

Transport

Food

Energy

Shopping

Community

Mission Related

---

# Action Ranking

Recommendations must be ordered by:

```text id="j5j2hz"
Highest Impact

Lowest Effort

Most Relevant
```

---

# 4. Forecast Insight Card

## Purpose

Translate forecasting data into plain language.

### Example

```text
📈 Forecast

Current Score:
82

Projected:
88

Confidence:
81%
```

---

# AI Explanation

```text
Your consistency has improved for four consecutive weeks.
```

---

# Forecast Insight Card — Simulator Handoff CTA (F-7 Fix)

The Forecast Insight Card must include a secondary CTA:

```text
🔮 What if I changed my habits? →
```

### Behavior

* Tapping this CTA navigates to the Simulator screen (`/simulator`).
* The Simulator opens with no pre-selected preset — the user chooses their scenario.
* This CTA is secondary and should be visually lighter than the card body (text link or ghost button style).
* This resolves the Coach → Simulator discovery gap (F-7).

---

# 5. Behavior Trends Section

## Purpose

Explain behavioral patterns.

### Categories

Transport

Food

Energy

Shopping

---

# Example

```text id="i4e68d"
Transport

Improved

+12%

Last 30 Days
```

---

# Trend States

Improving

Stable

Declining

---

# Trend Colors

Improving

Green

---

Stable

Blue

---

Declining

Orange

---

# 6. Ask Coach Section

## Purpose

Allow focused interaction.

### Design Rule

Do not create an endless chatbot.

Keep interactions goal-oriented.

---

# Suggested Prompts

Display chips:

```text id="b0gzji"
How can I improve my score?

What should I do this week?

How can I reduce transport emissions?

Show my biggest opportunity.
```

---

# Input Area

Single message input.

Minimal.

Clean.

---

# 7. Conversation History

## Purpose

Show previous coaching interactions.

### Display Rule

Conversation history is **collapsed by default**.

Only the most recent coaching exchange is visible on screen load.

Previous exchanges are hidden behind a:

```text
Show Earlier Conversations ↑
```

toggle at the top of the conversation section.

This prevents the AI Coach from looking like a generic chatbot or customer support portal.

### Structure

User Message

↓

Coach Response

---

# Example

```text id="3lfjlwm"
User:
How can I improve my score?

Coach:
Completing your weekly transport mission could increase your score by 4 points.
```

---

# AI Response Structure

Every response should contain:

### Observation

What happened.

---

### Reason

Why it happened.

---

### Recommendation

What to do next.

---

# Example

```text id="vt0gbh"
Observation

Food emissions increased this week.

Reason

Restaurant visits increased.

Recommendation

Try two vegetarian meals this week.
```

---

# Loading State

Use skeletons.

Never use:

```text id="65e3wq"
Full Screen Spinner
```

---

# Required Skeletons

Insight Card

Recommendation Cards

Trend Cards

Chat Messages

---

# Empty State

## New User

Display:

```text id="2mgc3w"
Complete a few activities to unlock personalized coaching.
```

---

# Error States

Examples:

```text id="hlyxzk"
Unable to load recommendations.

Retry
```

Must be inline.

---

# Accessibility

Requirements:

* WCAG AA
* Dynamic Type
* Screen Reader Support
* Large Touch Targets

---

# Motion System

## Insight Cards

Fade + Lift

---

## Recommendation Cards

Staggered Entry

---

## Forecast Card

Animated Number Transitions

---

## Chat Responses

Progressive Reveal

---

# Component Hierarchy

```text id="twx0oq"
AICoachScreen

CoachHeader

InsightCard

RecommendationCard

ForecastInsightCard

BehaviorTrendCard

PromptChip

CoachInput

ChatMessage

CoachSkeleton
```

---

# Analytics Events

Track:

Coach Viewed

Recommendation Viewed

Recommendation Accepted

Prompt Selected

Question Asked

Response Generated

Forecast Viewed

---

# Success Metrics

The AI Coach succeeds when:

* Users complete recommendations
* Sustainability Scores increase
* Mission completion improves
* User retention increases

---

# Visual Tone

The screen should feel:

* Intelligent
* Helpful
* Calm
* Trustworthy

Never:

* Robotic
* Corporate
* Overwhelming

---

# Final Design Intent

When users leave the AI Coach screen they should think:

```text id="95cbzi"
I understand my progress.

I know what to do next.

I can improve.
```

The AI Coach should feel like a knowledgeable mentor guiding users toward better sustainability habits.
