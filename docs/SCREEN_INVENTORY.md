# SCREEN_INVENTORY.md

## Purpose

This document defines every user-facing screen in Carbon Sense.

The screen inventory acts as the source of truth for:

* Navigation Architecture
* Screen Specifications
* Stitch Prompt Generation
* Frontend Development
* QA Testing

---

# Application Structure

Carbon Sense is organized into six primary domains:

1. Authentication
2. Core Experience
3. Sustainability Intelligence
4. Community
5. Utility & Automation
6. Profile & Settings

---

# Authentication

## Splash Screen

### Purpose

Initialize application.

Check:

* Authentication state
* App version
* User session
* Cached data

### Entry Point

App launch.

---

## Onboarding Screen

### Purpose

Introduce product value proposition.

### Goals

Explain:

* Sustainability Score
* Missions
* AI Coach
* Habit Building

### Audience

First-time users only.

---

## Login Screen

### Purpose

Authenticate existing users.

### Methods

* Email + Password
* Google Sign-In

---

## Sign Up Screen

### Purpose

Create new account.

### Required Fields

* Name
* Email
* Password

---

# Core Experience

## Dashboard Screen

### Purpose

Primary home screen.

### Responsibilities

Display:

* Sustainability Score
* Daily Mission
* AI Insight
* Forecast
* Streak
* Recent Activity

### Priority

Highest priority screen.

---

## Activity Logging Screen

### Purpose

Create new sustainability activity.

### Categories

* Transport
* Food
* Electricity
* Shopping

### Access

Floating Action Button.

---

## Activity History Screen

### Purpose

Review historical activity logs.

### Features

* Search
* Filter
* Date Range

---

## Activity Details Screen

### Purpose

Display activity information.

### Features

* Carbon Impact
* Metadata
* Edit
* Delete

---

# Sustainability Intelligence

## Mission Screen

### Purpose

Display daily and weekly missions.

### Features

* Mission List
* Progress Tracking
* Rewards
* Completion States

---

## Mission Details Screen

### Purpose

Display mission information.

### Features

* Description
* Difficulty
* Reward
* Completion Progress

---

## Sustainability Score Screen

### Purpose

Display Sustainability Score breakdown.

### Components

* Overall Score
* Consistency Score
* Mission Score
* Streak Score
* Improvement Score

---

## Achievements Screen

### Purpose

Display earned achievements.

### Features

* Badge Collection
* Progress Tracking
* Achievement Categories

---

## AI Coach Screen

### Purpose

Provide personalized sustainability coaching.

### Features

* Daily Insights
* Recommendations
* Behavioral Guidance

---

## Forecast Screen

### Purpose

Display predictive sustainability trends.

### Features

* 7 Day Forecast
* 30 Day Forecast
* 90 Day Forecast

---

## What-If Simulator Screen

### Purpose

Allow users to test sustainability scenarios.

### Features

* Scenario Builder
* Score Projection
* Carbon Projection
* AI Explanation

---

## Simulation Results Screen

### Purpose

Display simulation outcomes.

### Features

* Current State
* Projected State
* Savings
* Recommendations

---

# Community

## Community Home Screen

### Purpose

Community hub.

### Features

* Community Impact
* Active Groups
* Challenges

---

## Group Details Screen

### Purpose

Display group information.

### Features

* Members
* Rankings
* Impact

---

## Leaderboard Screen

### Purpose

Display rankings.

### Features

* Personal Rank
* Group Rank
* Community Rank

---

## Community Impact Screen

### Purpose

Display collective sustainability impact.

### Features

* Carbon Saved
* Community Metrics
* Trends

---

# Utility & Automation

## OCR Upload Screen

### Purpose

Upload receipts and bills.

### Inputs

* Camera
* Gallery
* PDF

---

## OCR Review Screen

### Purpose

Review extracted data.

### Features

* Edit Values
* Approve
* Reject

---

## OCR History Screen

### Purpose

Display previously processed documents.

### Features

* Search
* Filter
* Status Tracking

---

# Profile & Settings

## Profile Screen

### Purpose

Display user information.

### Features

* Avatar
* Sustainability Stats
* Achievements

---

## Settings Screen

### Purpose

Application configuration.

### Features

* Theme
* Notifications
* Privacy
* Account

---

## Preferences Screen

### Purpose

Manage sustainability preferences.

### Features

* Transport Preferences
* Diet Preferences
* Goal Preferences

---

## Account Screen

### Purpose

Manage account details.

### Features

* Email
* Password
* Connected Accounts

---

# Future Screens (Post Sprint 12)

Reserved for:

* Sustainability Leagues
* Carbon Twin
* Utility Intelligence
* Carbon Copilot
* Campus Mode

These screens are outside the Version 1 roadmap.

---

# Screen Count Summary

Authentication:
4

Core Experience:
4

Sustainability Intelligence:
8

Community:
4

Utility & Automation:
3

Profile & Settings:
4

Total:
27 Screens

---

# MVP Priority

## P0

Must Exist

* Splash
* Login
* Dashboard
* Activity Logging
* Mission
* Sustainability Score
* AI Coach

---

## P1

Should Exist

* Forecast
* Simulator
* Achievements
* Profile

---

## P2

Nice To Have

* OCR
* Community
* Leaderboards
