# CODING_STANDARDS.md

# Coding Standards & Engineering Guidelines

## Purpose

This document defines the mandatory coding standards for the Carbon Footprint Awareness Platform.

The goals are:

* Maintainability
* Readability
* Consistency
* AI-Friendly Code Generation
* Scalability
* Testability

All developers and AI coding agents must follow these standards.

---

# Engineering Philosophy

## Rule 1

Code is read more often than it is written.

Optimize for readability.

---

## Rule 2

Explicit is better than clever.

Avoid unnecessary abstractions.

---

## Rule 3

Business logic belongs in services.

Never hide business logic in:

* Controllers
* React Components
* Database Models

---

## Rule 4

Carbon calculations are sacred.

Carbon Engine code must remain:

* deterministic
* testable
* isolated

---

# General Principles

Every code submission must satisfy:

### Correctness

Does it work?

---

### Clarity

Can another developer understand it?

---

### Simplicity

Is it the simplest acceptable solution?

---

### Testability

Can it be tested independently?

---

### Observability

Can failures be detected?

---

# Backend Standards (Python)

## Python Version

```text id="py01"
Python 3.12+
```

---

## Formatting

Use:

```text id="py02"
Ruff
Black
```

---

## Type Checking

Required:

```text id="py03"
mypy
```

---

## Example

Good:

```python id="py04"
def calculate_transport_emissions(
    distance_km: float,
    factor: float
) -> float:
    return distance_km * factor
```

Bad:

```python id="py05"
def calc(x, y):
    return x * y
```

---

# Function Rules

Functions should:

* do one thing
* be small
* be deterministic when possible

---

## Preferred Length

```text id="py06"
< 50 lines
```

---

## Maximum Length

```text id="py07"
100 lines
```

Requires justification.

---

# Class Rules

Classes should represent:

* services
* repositories
* domain entities

Avoid utility god classes.

---

Bad:

```text id="py08"
CarbonManagerEverythingService
```

---

Good:

```text id="py09"
CarbonEngine

MissionService

StreakService
```

---

# FastAPI Standards

## Routes

Routes contain:

* validation
* authentication
* response formatting

Only.

---

Bad:

```python id="py10"
@router.post("/activities")
def create_activity():
    calculate_carbon()
    update_streak()
    generate_ai()
```

---

Good:

```python id="py11"
@router.post("/activities")
async def create_activity():
    return activity_service.create()
```

---

# Service Layer Standards

All business logic belongs here.

Examples:

```text id="svc01"
CarbonEngine

MissionService

AIService

ChallengeService
```

---

Services may call:

* repositories
* external APIs
* queues

---

Services must not call:

* FastAPI routes
* UI code

---

# Repository Standards

Repositories own database access.

Examples:

```python id="repo01"
class ActivityRepository:
    pass
```

---

Repositories may:

* query
* insert
* update

---

Repositories must not:

* contain business rules
* call Gemini
* calculate carbon

---

# SQLAlchemy Standards

Models represent data only.

---

Bad:

```python id="sql01"
class Activity:
    def calculate_carbon(self):
        ...
```

---

Good:

```python id="sql02"
class Activity:
    id: UUID
    user_id: UUID
```

---

# Carbon Engine Rules

Most critical module.

Location:

```text id="carbon01"
packages/carbon-core
```

---

# Carbon Engine Must

* be deterministic
* be unit tested
* use emission factors only

---

# Carbon Engine Must Never

* call Gemini
* use vector search
* use AI-generated numbers

---

# AI Service Rules

Location:

```text id="ai01"
services/ai
```

---

AI Service Responsibilities:

* prompting
* retrieval
* generation
* validation

---

AI Service Must Never

* update footprints
* update emission factors
* calculate emissions

---

# Frontend Standards

## Language

```text id="fe01"
TypeScript
```

Only.

No JavaScript.

---

# React Native Standards

Framework:

```text id="fe02"
Expo
```

---

Routing:

```text id="fe03"
Expo Router
```

---

Data Fetching:

```text id="fe04"
TanStack Query
```

---

State Management:

```text id="fe05"
Zustand
```

---

# Component Rules

Components should be:

* reusable
* focused
* predictable

---

Good:

```text id="fe06"
MissionCard

FootprintChart

StatCard
```

---

Bad:

```text id="fe07"
EverythingDashboardComponent
```

---

# Screen Rules

Screens compose components.

Screens should not:

* contain API logic
* contain business rules

---

# API Client Standards

All API calls go through:

```text id="api01"
src/services/api
```

---

Bad:

```typescript id="api02"
fetch(...)
```

inside components.

---

Good:

```typescript id="api03"
apiClient.get(...)
```

---

# Error Handling Standards

Every operation must handle:

* network failures
* validation failures
* server failures

---

Never:

```typescript id="err01"
catch (e) {}
```

---

Always:

```typescript id="err02"
captureException(error)
showToast(...)
```

---

# Logging Standards

## Log

* request ids
* execution time
* retries
* failures

---

## Never Log

* passwords
* tokens
* secrets
* private documents

---

# Testing Standards

Minimum coverage:

```text id="test01"
80%
```

---

# Unit Tests Required

Carbon Engine

Mission Engine

Streak Engine

Factor Resolution

AI Validators

---

# Integration Tests Required

API Routes

Database

Redis

Queue Processing

---

# End-To-End Tests Required

Onboarding

Activity Logging

Mission Completion

Streak Updates

---

# Naming Conventions

## Python

Files:

```text id="name01"
snake_case.py
```

---

Classes:

```text id="name02"
PascalCase
```

---

Functions:

```text id="name03"
snake_case
```

---

Constants:

```text id="name04"
UPPER_CASE
```

---

## TypeScript

Components:

```text id="name05"
PascalCase.tsx
```

---

Hooks:

```text id="name06"
useSomething.ts
```

---

Stores:

```text id="name07"
somethingStore.ts
```

---

# API Response Standards

Always:

```json id="resp01"
{
  "success": true,
  "data": {}
}
```

---

Never:

```json id="resp02"
{
  "result": {}
}
```

---

# Database Standards

All schema changes require:

```text id="db01"
Alembic Migration
```

---

Never:

```text id="db02"
Manual Production Changes
```

---

# Git Standards

Branch Naming

```text id="git01"
feature/activity-logging

feature/mission-engine

fix/streak-bug
```

---

Commit Format

```text id="git02"
feat:

fix:

refactor:

test:

docs:
```

---

Examples

```text id="git03"
feat: add activity ingestion endpoint

fix: correct streak calculation bug

docs: update emission methodology
```

---

# Performance Standards

API Response

```text id="perf01"
< 300ms
```

excluding AI endpoints.

---

Daily Mission Load

```text id="perf02"
< 1 second
```

---

Footprint Dashboard

```text id="perf03"
< 2 seconds
```

---

# Security Standards

Mandatory:

* Supabase Auth JWT validation on every protected endpoint
* Input validation
* Output validation
* Parameterized SQL
* Rate limiting

Authentication Provider:

```text id="sec01"
Supabase Auth
```

Required Environment Variables:

```text id="sec02"
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

User Identity Field:

```text id="sec03"
auth_user_id
```

Not:

```text id="sec04"
clerk_user_id
```

---

Forbidden:

* hardcoded secrets
* direct SQL string concatenation
* storing tokens in code
* Clerk-specific authentication patterns

---

# Documentation Standards

Every service requires:

* purpose
* inputs
* outputs
* dependencies

---

Every complex function requires:

* docstring
* examples if needed

---

# AI Agent Instructions

Before generating code:

1. Read PROJECT_CONTEXT.md
2. Read SYSTEM_ARCHITECTURE.md
3. Read DATABASE_DESIGN.md
4. Read API_CONTRACTS.md
5. Follow folder structure exactly
6. Do not invent new technologies
7. Do not bypass service boundaries
8. Do not move business logic into routes
9. Do not use AI for carbon calculations
10. Generate tests with implementation

---

# Architecture Non-Negotiables

The following rules cannot be violated:

✅ PostgreSQL is source of truth

✅ Carbon Engine is deterministic

✅ Gemini is coaching only

✅ Business logic lives in services

✅ Repositories own persistence

✅ AI outputs require validation

✅ Activities are immutable

✅ Emission factors are versioned

---

# Definition of Done

A feature is complete only when:

* Code implemented
* Tests written
* Documentation updated
* Types validated
* Error handling added
* Logging added
* Security reviewed

---

# Final Statement

This project prioritizes maintainability, predictability, and correctness over cleverness.

Code should be easy for humans and AI systems to understand.

When faced with multiple valid solutions, choose the simplest solution that satisfies the architectural requirements.
