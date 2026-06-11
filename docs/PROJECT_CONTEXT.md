# PROJECT_CONTEXT.md

# Carbon Footprint Awareness Platform

## Project Overview

The Carbon Footprint Awareness Platform is a mobile-first sustainability application designed to drive measurable behavior change rather than simply display carbon footprint metrics.

The primary goal is to help users make better environmental decisions through personalized missions, streaks, social accountability, and AI-powered coaching.

This product should be treated as a behavior-change platform, not a carbon calculator.

---

# Mission

Help users reduce their environmental impact through consistent, achievable daily actions.

The platform should answer one core question every day:

> "What is the highest-impact low-effort action I can take today?"

---

# Product Philosophy

The application exists to change behavior.

Every feature must support at least one of the following:

* Increase user awareness
* Encourage action
* Improve habit formation
* Strengthen accountability
* Increase retention through meaningful engagement

Features that only display information without encouraging action should be avoided.

---

# Core Principles

## Principle 1: Behavior Over Reporting

We are not building a reporting dashboard.

We are building a sustainability habit system.

The primary outputs are:

* Daily Missions
* Streaks
* Progress
* Challenges
* Coaching

The carbon footprint score exists to support these systems.

---

## Principle 2: Deterministic Carbon Calculations

Carbon calculations must always be deterministic.

The source of truth is:

* Emission Factors Database
* Carbon Calculation Engine

AI models must never calculate carbon values.

AI models must never generate emission factors.

AI models must never modify historical footprint records.

---

## Principle 3: Low Friction First

The platform should minimize manual user input.

Preferred data sources:

1. Manual activity logging
2. Receipt uploads
3. Utility bill uploads
4. Future integrations

Users should not be required to enter excessive information.

---

## Principle 4: AI As Coach

AI exists to interpret data, not create it.

AI responsibilities:

* Explain trends
* Generate insights
* Personalize missions
* Create summaries
* Provide coaching

AI must never become the source of truth for environmental calculations.

---

# Primary User Journey

1. User opens app
2. User sees today's mission
3. User logs activity or imports data
4. Carbon engine updates footprint
5. Progress and streaks update
6. AI generates personalized feedback
7. User returns tomorrow

---

# Core Features

## Daily Missions

Personalized sustainability actions generated from user behavior and footprint data.

Examples:

* Use public transport once today
* Skip one delivery order
* Choose a vegetarian meal
* Reduce unnecessary electricity usage

---

## Streak System

Tracks consistent participation.

Streaks are one of the primary retention mechanisms.

Streak logic must be deterministic.

---

## Social Accountability

Users can participate in:

* Friend groups
* Community groups
* Sustainability challenges

The system should prioritize cooperation and improvement over competition.

---

## AI Carbon Coach

Provides:

* Weekly summaries
* Trend explanations
* Personalized recommendations
* Future improvement opportunities

The AI coach should always reference real user data.

---

## Community Impact

The platform should display cumulative impact across all users.

Example:

"Users have collectively avoided 25,000 kg CO₂."

This creates social proof and shared purpose.

---

# Technical Source of Truth

## Carbon Data

Source of truth:

Emission Factors Table

Future calculations must be reproducible.

Historical calculations must remain traceable to the factor version used.

---

## User Data

Source of truth:

PostgreSQL Database

No duplicate sources of truth should exist.

---

## AI Memory

Source of truth:

pgvector + PostgreSQL

Embeddings are used only for retrieval and personalization.

Embeddings must never replace structured data.

---

# Technology Stack

## Frontend

* React Native
* Expo
* TypeScript
* Zustand
* TanStack Query

## Backend

* FastAPI
* Python
* SQLAlchemy
* Alembic

## Database

* PostgreSQL

## Vector Search

* pgvector

## Queue

* Redis
* Celery

## AI

* Gemini Flash

## Storage

* AWS S3

## Authentication

* Supabase Auth

## Analytics

* PostHog

## Monitoring

* Sentry

## Deployment

Frontend:

* Vercel

Backend:

* Railway

---

# Architecture Decisions

## Accepted

* Mobile-first architecture
* Modular monolith
* PostgreSQL as primary database
* pgvector for retrieval
* Gemini Flash as AI provider
* Redis + Celery for async jobs
* Emission-factor-based carbon calculations

## Rejected

* Microservices for MVP
* AI-generated carbon calculations
* MongoDB as primary database
* Multi-agent orchestration
* Complex RAG systems in MVP

---

# Non Goals

The platform is NOT intended to:

* Predict climate change
* Provide enterprise ESG reporting
* Manage carbon offset purchases
* Calculate industrial emissions
* Replace scientific carbon accounting systems
* Act as a financial or environmental advisory service

---

# Success Metrics

Primary:

* Daily Active Users
* Mission Completion Rate
* Streak Retention
* Weekly Return Rate

Secondary:

* Community CO₂ Reduction
* Challenge Participation
* Insight Engagement
* User Retention

---

# Instructions For AI Agents

Before generating code:

1. Read this document completely.
2. Respect all accepted architecture decisions.
3. Do not replace deterministic systems with AI systems.
4. Do not introduce new technologies without justification.
5. Prefer simplicity over complexity.
6. Optimize for maintainability and developer velocity.
7. Treat PostgreSQL as the source of truth.
8. Treat emission factors as the source of truth for carbon calculations.
9. Treat AI as a coaching layer only.
10. If a requested implementation conflicts with this document, raise the conflict explicitly before generating code.
