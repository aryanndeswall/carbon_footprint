# IMPLEMENTATION_ROADMAP.md

# Implementation Roadmap

## Purpose

This document defines the official implementation sequence for the Carbon Footprint Awareness Platform.

The objective is to:

* Maximize developer velocity
* Reduce architectural risk
* Prevent scope creep
* Enable AI-assisted development
* Deliver a usable MVP as quickly as possible

All engineering work should follow this roadmap.

---

# Development Philosophy

## Rule 1

Build foundations first.

Do not build AI before the Carbon Engine exists.

---

## Rule 2

Build deterministic systems before intelligent systems.

---

## Rule 3

Deliver user value every sprint.

---

## Rule 4

Avoid premature optimization.

---

# Success Criteria

The MVP is successful if:

Users can:

* Create accounts
* Log activities
* View footprints
* Receive missions
* Maintain streaks
* Receive AI coaching

---

# Development Timeline

## Phase 0

Architecture & Foundation

Duration:

```text
3-5 Days
```

Goal:

Prepare repository and infrastructure.

---

# Sprint 0 Tasks

## Repository Setup

Create:

```text
apps/mobile
services/api
services/worker
services/ai
packages/carbon-core
packages/schemas
docs
```

---

## Infrastructure Setup

Configure:

```text
PostgreSQL

Redis

Railway

Vercel

S3

Supabase Auth

Sentry

PostHog
```

---

## CI/CD Setup

Configure:

```text
GitHub Actions

Linting

Testing

Formatting
```

---

## Deliverables

✅ Repository Structure

✅ Infrastructure

✅ CI/CD

✅ Local Development Environment

---

# Phase 1

Core Platform Foundation

Duration:

```text
1 Week
```

Goal:

Build platform fundamentals.

---

# Sprint 1

User Management

---

## Features

### Authentication

Implement:

```text
Supabase Auth
```

---

### User Profiles

Create:

```text
users

user_preferences
```

---

### Onboarding Flow

Collect:

```text
State

Diet

Transport Preference

Housing Type
```

---

## Backend Deliverables

Endpoints:

```text
GET /users/me

PATCH /users/me
```

---

## Mobile Deliverables

Screens:

```text
Login

Signup

Onboarding

Profile
```

---

## Success Criteria

User can:

* Sign up
* Log in
* Complete onboarding

---

# Phase 2

Activity Logging System

Duration:

```text
1 Week
```

Goal:

Collect meaningful environmental data.

---

# Sprint 2

Activity Ingestion

---

## Features

### Activity Logging

Support:

```text
Transport

Food

Electricity

Shopping
```

---

## Database

Create:

```text
activity_events
```

---

## Endpoints

```text
POST /activities

GET /activities

GET /activities/{id}
```

---

## Mobile Screens

```text
Add Activity

Activity History
```

---

## Success Criteria

Users can record activities.

---

# Phase 3

Carbon Engine

Duration:

```text
1 Week
```

Goal:

Generate reliable footprint calculations.

---

# Sprint 3

Carbon Accounting

---

## Database

Create:

```text
emission_factors

daily_footprints

daily_footprint_sources
```

---

## Build

```text
Factor Resolver

Carbon Engine

Aggregation Pipeline
```

---

## Features

Calculate:

```text
Transport CO₂

Food CO₂

Electricity CO₂

Shopping CO₂
```

---

## Endpoints

```text
GET /footprints/today

GET /footprints/weekly

GET /footprints/monthly
```

---

## Success Criteria

Every activity updates footprint totals.

---

# Phase 4

Mission Engine

Duration:

```text
1 Week
```

Goal:

Create the engagement loop.

---

# Sprint 4

Daily Missions

---

## Database

Create:

```text
mission_templates

user_missions
```

---

## Build

```text
Mission Rules Engine

Mission Assignment Service
```

---

## Features

Generate:

```text
Easy Missions

Medium Missions

Hard Missions
```

---

## Endpoints

```text
GET /missions/today

POST /missions/{id}/complete

GET /missions/history
```

---

## Success Criteria

Every user receives a daily mission.

---

# Phase 5

Streak System

Duration:

```text
3 Days
```

Goal:

Increase retention.

---

# Sprint 5

Streak Tracking

---

## Database

Create:

```text
streaks
```

---

## Features

Track:

```text
Current Streak

Longest Streak

Streak Freeze
```

---

## Endpoints

```text
GET /streaks/current
```

---

## Success Criteria

Daily engagement updates streaks.

---

# Phase 6

AI Foundation

Duration:

```text
1 Week
```

Goal:

Add personalized coaching.

---

# Sprint 6

Gemini Integration

---

## Build

```text
Gemini Client

Prompt Builder

Output Validator

AI Service
```

---

## Database

Create:

```text
ai_insights
```

---

## Features

Generate:

```text
Daily Coaching

Weekly Summaries
```

---

## Endpoints

```text
GET /ai/insights/latest

POST /ai/insights/generate
```

---

## Success Criteria

Users receive personalized coaching.

---

# Phase 7

Vector Memory Layer

Duration:

```text
3 Days
```

Goal:

Improve AI personalization.

---

# Sprint 7

pgvector Integration

---

## Build

```text
Embedding Pipeline

Memory Retrieval Service

Semantic Search
```

---

## Database

Create:

```text
ai_memory_embeddings
```

---

## Features

Store:

```text
Mission History

Behavior Patterns

Preferences

Insights
```

---

## Success Criteria

AI uses retrieved memories.

---

# Phase 8

Community Features

Duration:

```text
1 Week
```

Goal:

Create accountability loops.

---

# Sprint 8

Groups & Challenges

---

## Database

Create:

```text
groups

group_members

challenges

challenge_participants
```

---

## Features

Support:

```text
Create Group

Join Group

Challenge Participation

Leaderboards
```

---

## Endpoints

```text
POST /groups

POST /groups/{id}/join

GET /groups/{id}
```

---

## Success Criteria

Users can participate socially.

---

# Phase 9

Uploads & Automation

Duration:

```text
1 Week
```

Goal:

Reduce manual input.

---

# Sprint 9

Receipt & Bill Processing

---

## Infrastructure

Configure:

```text
AWS S3
```

---

## Features

Upload:

```text
Receipts

Electricity Bills

Mission Proofs
```

---

## Endpoints

```text
POST /uploads/receipt

POST /uploads/electricity-bill
```

---

## Future AI Flow

```text
Receipt
    ↓
OCR
    ↓
Categorization
    ↓
Activity Creation
```

---

## Success Criteria

Users can upload documents.

---

# Phase 10

Notifications

Duration:

```text
3 Days
```

Goal:

Improve retention.

---

# Sprint 10

Engagement Layer

---

## Build

```text
Push Notifications

Mission Reminders

Streak Alerts

Weekly Reports
```

---

## Endpoints

```text
GET /notifications

PATCH /notifications/{id}/read
```

---

## Success Criteria

Users receive reminders.

---

# Phase 11

Production Hardening

Duration:

```text
1 Week
```

Goal:

Prepare for public release.

---

# Sprint 11

Security & Reliability

---

## Implement

```text
RLS

Rate Limiting

Audit Logs

Monitoring

Backups

DLQ
```

---

## Testing

```text
Unit Tests

Integration Tests

E2E Tests
```

---

## Performance

Validate:

```text
API Latency

Worker Throughput

AI Response Times
```

---

## Success Criteria

Platform is production-ready.

---

# MVP Definition

The MVP includes:

✅ Authentication

✅ Onboarding

✅ Activity Logging

✅ Carbon Engine

✅ Daily Footprints

✅ Missions

✅ Streaks

✅ Gemini Coaching

✅ PostgreSQL

✅ pgvector

---

# Post-MVP Features

Not required initially:

```text
Carbon Offsets

Enterprise Reporting

IoT Integrations

Advanced Forecasting

Multi-Agent Systems

Marketplace Features

NFT/Blockchain Features
```

---

# Technical Debt Rules

Allowed:

* Simple implementations
* Manual admin workflows

Not Allowed:

* Hardcoded emission factors
* Business logic in routes
* AI-generated calculations
* Direct database access from AI

---

# Sprint Acceptance Checklist

Every sprint must include:

* [ ] Feature Complete
* [ ] Tests Written
* [ ] Documentation Updated
* [ ] Error Handling Added
* [ ] Logging Added
* [ ] Security Reviewed

---

# Final Delivery Sequence

```text
1. Auth
2. Onboarding
3. Activity Logging
4. Carbon Engine
5. Missions
6. Streaks
7. Gemini
8. pgvector
9. Groups
10. Uploads
11. Notifications
12. Production Hardening
```

---

# Final Statement

The roadmap prioritizes delivering a functional, scientifically credible, and engaging sustainability platform as early as possible.

The Carbon Engine is built first.

The AI layer is built second.

Community and automation layers are added only after the core behavior-change loop is proven.

This order is mandatory and should be followed by all contributors and AI coding agents.
