# SYSTEM_ARCHITECTURE.md

# System Architecture

## Purpose

This document defines the official system architecture for the Carbon Footprint Awareness Platform.

All engineers, AI coding agents, and automation systems must follow this architecture.

This document acts as the source of truth for:

* Service boundaries
* Data flow
* System responsibilities
* Integration patterns
* Infrastructure decisions

No implementation should violate the architecture defined here without an approved Architecture Decision Record (ADR).

---

# Architecture Philosophy

The platform follows a:

## Modular Monolith Architecture

The application is deployed as a single backend system while maintaining strict separation between business domains.

Advantages:

* Faster development
* Easier debugging
* Lower operational complexity
* Better AI-assisted code generation
* Easier deployment

The system is intentionally NOT a microservice architecture.

Microservices should only be considered when scaling requirements justify the additional complexity.

---

# High-Level System Diagram

```text
┌─────────────────────────┐
│     Mobile Client       │
│ React Native + Expo     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│      API Gateway        │
│        FastAPI          │
└────────────┬────────────┘
             │
      ┌──────┼──────┐
      ▼      ▼      ▼

 Activity  Carbon   AI
 Service   Engine   Layer

      │      │      │
      └──┬───┴──┬───┘
         ▼      ▼

      PostgreSQL
          +
       pgvector

         │
         ▼

        Redis

         │
         ▼

    Celery Workers

         │
         ▼

     Gemini Flash
```

---

# Core Service Boundaries

The backend consists of several logical modules.

Each module owns its own domain.

Modules may communicate through service interfaces but should not directly manipulate another module's internals.

---

# Module: User Service

## Responsibilities

* User profile management
* Preferences
* Authentication integration
* Account lifecycle
* Privacy settings

## Owns

* users table
* user settings
* profile metadata

## Does NOT Own

* footprint calculations
* missions
* AI insights

---

# Module: Activity Service

## Responsibilities

Ingest user actions into the system.

Examples:

* meal logs
* transport logs
* receipt uploads
* utility bill uploads

## Owns

* activity_events table

## Rules

Activities are immutable.

Activities are appended.

Activities are never modified directly after ingestion.

Corrections should create new events.

---

# Module: Carbon Engine

## Responsibilities

Convert activities into carbon values.

This is the most important business module.

## Owns

* emission factor lookups
* carbon calculations
* aggregate generation

## Inputs

* activity events
* emission factors

## Outputs

* daily footprints
* category breakdowns

## Rules

Carbon calculations must always be deterministic.

The Carbon Engine must never call an AI model.

---

# Module: Mission Engine

## Responsibilities

Generate daily missions.

## Inputs

* user profile
* footprint history
* challenge history

## Outputs

* mission assignments

## Logic

Mission generation should be:

80% Rules Engine

20% AI Personalization

Mission selection comes from templates.

AI only personalizes wording and presentation.

---

# Module: AI Layer

## Responsibilities

Interpret data.

Generate:

* coaching
* summaries
* explanations
* mission personalization

## Inputs

* footprint history
* mission history
* user behavior
* retrieved memory

## Outputs

* AI insights
* coaching messages
* weekly summaries

## Rules

AI never:

* calculates carbon
* modifies footprints
* updates emission factors

---

# Module: Community Service

## Responsibilities

Social features.

Supports:

* groups
* leaderboards
* challenges
* community impact

## Owns

* groups
* group_members
* challenge participation

---

# Module: Notification Service

## Responsibilities

User engagement.

Generates:

* streak reminders
* mission reminders
* challenge notifications
* weekly summaries

## Delivery Channels

* Push Notifications
* In-App Notifications

---

# Data Flow Architecture

## Activity Logging Flow

```text
User Action
     │
     ▼
Activity Service
     │
     ▼
activity_events
     │
     ▼
Queue Event
     │
     ▼
Carbon Engine
     │
     ▼
daily_footprints
     │
     ▼
AI Layer
     │
     ▼
ai_insights
```

---

## Mission Generation Flow

```text
Daily Scheduler
      │
      ▼
Mission Engine
      │
      ▼
Mission Templates
      │
      ▼
Personalization Layer
      │
      ▼
Assigned Mission
```

---

## AI Insight Flow

```text
User Opens App
       │
       ▼

Fetch Recent Data

       │
       ▼

Retrieve Memory

       │
       ▼

Construct Prompt

       │
       ▼

Gemini Flash

       │
       ▼

Validate Output

       │
       ▼

Store Insight
```

---

# Database Architecture

## Primary Database

PostgreSQL

Purpose:

* transactional data
* business logic state
* reporting data

---

## Vector Database

pgvector

Purpose:

* user memory retrieval
* coaching personalization
* semantic search

pgvector is not a source of truth.

Structured data remains the source of truth.

---

# Queue Architecture

## Redis

Responsibilities:

* task queue
* caching
* rate limiting
* worker coordination

---

## Celery

Responsibilities:

* async processing
* AI jobs
* notifications
* aggregate recomputation

---

# Background Jobs

Supported jobs:

## Compute Footprint

```text
Activity Added
      │
      ▼
Calculate Carbon
      │
      ▼
Update Aggregate
```

---

## Generate Weekly Summary

```text
Scheduler
      │
      ▼
Fetch History
      │
      ▼
Generate Insight
      │
      ▼
Store Result
```

---

## Generate Daily Missions

```text
Scheduler
      │
      ▼
Analyze User
      │
      ▼
Select Templates
      │
      ▼
Personalize
      │
      ▼
Assign Mission
```

---

# Storage Architecture

## AWS S3

Stores:

* receipts
* bills
* profile photos
* challenge proof uploads

Database stores metadata only.

Binary files are never stored inside PostgreSQL.

---

# Security Architecture

## Authentication

Provider:

Supabase Auth

Authentication handled through Supabase JWT verification.

FastAPI validates Supabase JWT tokens on every protected request.

Environment Variables Required:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## Authorization

Every resource must be scoped by:

```text
user_id
```

No user may access another user's data.

---

## Rate Limiting

Required for:

* AI endpoints
* mission generation
* upload endpoints

---

## Data Protection

Sensitive data:

* receipts
* bills
* location signals

Must be:

* encrypted at rest
* encrypted in transit
* minimally retained

---

# Scalability Strategy

## Phase 1

Single FastAPI application.

Single PostgreSQL instance.

Single Redis instance.

---

## Phase 2

Read replicas.

Dedicated worker pool.

Caching layer expansion.

---

## Phase 3

Potential extraction of:

* AI Service
* Notification Service

Only if scaling requires it.

---

# Failure Recovery

## AI Failure

If Gemini is unavailable:

Fallback:

* cached insights
* template-based missions

System must continue functioning.

---

## Queue Failure

If workers fail:

* retry jobs
* move failed jobs to dead letter queue
* alert operators

---

## Database Failure

Use:

* automated backups
* point-in-time recovery
* daily snapshots

---

# Architecture Constraints

The following rules are mandatory:

1. Carbon calculations are deterministic.
2. Emission factors are the source of truth.
3. AI is a coaching layer only.
4. PostgreSQL is the primary source of truth.
5. Activities are immutable.
6. Mission generation is template-first.
7. Async jobs must be idempotent.
8. Sensitive data retention must be minimized.
9. New services require an ADR.
10. Simplicity is preferred over complexity.

---

# Final Architectural Statement

The Carbon Footprint Awareness Platform is a mobile-first sustainability behavior-change system built on a modular monolith architecture.

The platform combines deterministic carbon accounting, gamified habit formation, social accountability, and AI-powered coaching while maintaining strict separation between calculation systems and generative AI systems.

All future engineering decisions must align with this architecture.
