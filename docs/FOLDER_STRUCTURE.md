# FOLDER_STRUCTURE.md

# Repository Structure & Code Organization

## Purpose

This document defines the official repository structure for the Carbon Footprint Awareness Platform.

The primary goal is to ensure:

* Consistent architecture
* Predictable file locations
* AI-agent-friendly development
* Easy onboarding
* Long-term maintainability

All developers and AI coding agents must follow this structure.

---

# Repository Philosophy

## Principle 1

Feature ownership must be clear.

Every file should have an obvious home.

---

## Principle 2

Business logic must be isolated.

Logic should never be buried inside controllers or UI components.

---

## Principle 3

Shared code belongs in packages.

Avoid duplication.

---

## Principle 4

AI agents must be able to navigate the repository easily.

Folder names should be explicit.

---

# Monorepo Structure

```text
carbon-platform/

├── apps/
│
├── services/
│
├── packages/
│
├── infrastructure/
│
├── docs/
│
├── scripts/
│
├── tests/
│
├── .github/
│
├── .env.example
│
├── README.md
│
└── package.json
```

---

# apps/

Contains user-facing applications.

```text
apps/

├── mobile/
│
├── web/
│
└── admin/
```

---

# Mobile Application

Location:

```text
apps/mobile
```

Stack:

* React Native
* Expo
* TypeScript

---

## Mobile Structure

```text
mobile/

├── app/
│
├── src/
│
├── assets/
│
├── tests/
│
└── app.json
```

---

### app/

Expo Router routes.

```text
app/

├── (auth)/
│
├── (tabs)/
│
├── onboarding/
│
├── profile/
│
└── settings/
```

---

### src/

Application code.

```text
src/

├── components/
│
├── features/
│
├── services/
│
├── store/
│
├── hooks/
│
├── constants/
│
├── utils/
│
├── types/
│
└── lib/
```

---

### components/

Reusable UI.

Examples:

```text
Button

Card

MissionCard

StatCard
```

No business logic.

---

### features/

Feature-based architecture.

```text
features/

├── activities/
│
├── missions/
│
├── footprints/
│
├── streaks/
│
├── ai/
│
├── groups/
│
└── profile/
```

Each feature contains:

```text
feature/

├── screens/
├── components/
├── hooks/
├── api/
└── types/
```

---

### store/

State management.

Uses:

```text
Zustand
```

Stores:

```text
authStore

userStore

missionStore

streakStore
```

---

### services/

Client-side integrations.

Examples:

```text
apiClient

notificationService

storageService
```

---

# Web Application

Location:

```text
apps/web
```

Purpose:

Landing pages.

Marketing.

Documentation.

Future dashboards.

---

# Admin Application

Location:

```text
apps/admin
```

Purpose:

Moderation.

Analytics.

Support.

Community management.

Challenge management.

---

# services/

Contains backend services.

```text
services/

├── api/
│
├── worker/
│
└── ai/
```

---

# API Service

Location:

```text
services/api
```

Stack:

FastAPI

---

## API Structure

```text
api/

├── app/
│
├── tests/
│
├── alembic/
│
├── requirements/
│
└── pyproject.toml
```

---

## app/

```text
app/

├── api/
│
├── core/
│
├── database/
│
├── models/
│
├── schemas/
│
├── services/
│
├── repositories/
│
├── middleware/
│
├── tasks/
│
└── main.py
```

---

### api/

Route definitions.

```text
api/

├── users.py
├── activities.py
├── footprints.py
├── missions.py
├── ai.py
├── groups.py
└── uploads.py
```

Routes only.

No business logic.

---

### core/

Core application configuration.

```text
core/

config.py

security.py

logging.py
```

---

### database/

Database setup.

```text
database/

session.py

base.py
```

---

### models/

SQLAlchemy models.

```text
models/

user.py

activity.py

mission.py

footprint.py
```

---

### schemas/

Pydantic schemas.

```text
schemas/

user.py

activity.py

mission.py
```

---

### repositories/

Database access layer.

Responsibilities:

* CRUD
* Queries
* Persistence

No business logic.

---

### services/

Business logic layer.

Examples:

```text
carbon_engine.py

mission_engine.py

streak_engine.py

notification_service.py
```

All business rules belong here.

---

### middleware/

Examples:

```text
jwt_auth.py

rate_limit.py

request_id.py
```

---

### tasks/

Celery task definitions.

Examples:

```text
generate_insight.py

compute_footprint.py

send_notifications.py
```

---

# Worker Service

Location:

```text
services/worker
```

Purpose:

Background processing.

---

## Worker Responsibilities

* AI generation
* Footprint recomputation
* Notifications
* Scheduled jobs

---

# AI Service

Location:

```text
services/ai
```

Purpose:

AI-specific orchestration.

---

## AI Structure

```text
ai/

├── prompts/
│
├── retrieval/
│
├── generators/
│
├── validators/
│
└── clients/
```

---

### prompts/

Prompt templates.

```text
weekly_summary.md

daily_coach.md

mission_personalization.md
```

---

### retrieval/

Memory retrieval logic.

Examples:

```text
vector_search.py

memory_service.py
```

---

### generators/

Gemini integrations.

Examples:

```text
coach_generator.py

summary_generator.py
```

---

### validators/

Output validation.

Examples:

```text
insight_validator.py

summary_validator.py
```

---

### clients/

Provider abstraction.

Examples:

```text
gemini_client.py
```

Future:

```text
openai_client.py
```

---

# packages/

Shared code.

```text
packages/

├── ui/
│
├── schemas/
│
├── carbon-core/
│
└── types/
```

---

# packages/ui

Shared UI components.

Used by:

* mobile
* web
* admin

---

# packages/schemas

Shared API contracts.

Examples:

```text
UserResponse

MissionResponse

FootprintResponse
```

---

# packages/carbon-core

Most important package.

Contains:

```text
Emission Calculations

Factor Resolution

Carbon Utilities
```

AI must never modify this package.

---

# infrastructure/

Infrastructure definitions.

```text
infrastructure/

├── docker/
│
├── railway/
│
├── vercel/
│
└── postgres/
```

---

# docs/

Project documentation.

Contains:

```text
PROJECT_CONTEXT.md

SYSTEM_ARCHITECTURE.md

DATABASE_DESIGN.md

EMISSION_METHODOLOGY.md

AI_ARCHITECTURE.md

API_CONTRACTS.md

SECURITY_REQUIREMENTS.md
```

---

# tests/

Repository-wide testing.

```text
tests/

├── integration/
│
├── e2e/
│
└── performance/
```

---

# Testing Strategy

## Unit Tests

Location:

Feature-specific folders.

---

## Integration Tests

Location:

```text
tests/integration
```

Tests:

* database
* API
* queue
* AI workflows

---

## E2E Tests

Location:

```text
tests/e2e
```

Tests:

* onboarding
* activity logging
* mission completion
* streak updates

---

# Naming Conventions

## Python

Files:

```text
snake_case.py
```

Classes:

```text
PascalCase
```

Functions:

```text
snake_case
```

---

## TypeScript

Components:

```text
PascalCase.tsx
```

Hooks:

```text
useSomething.ts
```

Stores:

```text
somethingStore.ts
```

---

# Architecture Rules

Mandatory:

1. Routes contain no business logic.
2. Services contain business logic.
3. Repositories contain persistence logic.
4. Carbon calculations live only in carbon-core.
5. AI prompts live only in AI service.
6. Shared schemas belong in packages/schemas.
7. State management uses Zustand.
8. API calls use TanStack Query.
9. New domains require documentation.
10. Folder structure changes require ADR approval.

---

# Final Statement

The repository structure is designed to support:

* Fast development
* AI-assisted code generation
* Clear ownership
* Scalability
* Long-term maintainability

All code generation must follow this structure exactly unless an Architecture Decision Record explicitly states otherwise.
