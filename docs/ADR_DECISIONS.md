# ADR_DECISIONS.md

# Architecture Decision Records (ADR)

## Purpose

This document records all major architectural decisions made for the Carbon Footprint Awareness Platform.

The purpose of ADRs is to:

* Prevent architecture drift
* Preserve engineering context
* Reduce AI hallucinations
* Explain why decisions were made
* Avoid re-evaluating solved problems

All future changes to architectural decisions must be documented through a new ADR.

---

# ADR-001

## Title

Primary AI Provider Selection

---

### Status

Accepted

---

### Date

2026

---

### Context

The platform requires an AI provider capable of:

* Personalized coaching
* Weekly summaries
* Mission personalization
* Activity categorization
* Multimodal processing
* Large context windows

Potential providers evaluated:

* Gemini
* OpenAI
* Claude

---

### Decision

Use:

```text id="adr001"
Gemini 2.5 Flash
```

as the primary AI provider.

---

### Rationale

Advantages:

* Lower operational cost
* Strong multimodal support
* Large context window
* Fast response times
* Good integration with future OCR workflows

---

### Consequences

Positive:

* Reduced AI costs
* Faster iteration
* Simpler architecture

Negative:

* Vendor dependency
* Need provider abstraction layer

---

### Implementation Rules

All AI access must occur through:

```text id="adr002"
services/ai/clients/gemini_client.py
```

Never call Gemini directly from business services.

---

# ADR-002

## Title

Primary Database Selection

---

### Status

Accepted

---

### Context

The platform requires:

* Strong relational integrity
* Historical auditability
* Challenge relationships
* Streak tracking
* Mission tracking
* Carbon calculation traceability

Alternatives:

* MongoDB
* PostgreSQL

---

### Decision

Use:

```text id="adr003"
PostgreSQL
```

as the primary database.

---

### Rationale

The platform is fundamentally relational.

Examples:

```text id="adr004"
Users

Activities

Footprints

Missions

Groups

Challenges
```

All require relational modeling.

---

### Consequences

Positive:

* Strong consistency
* Better auditability
* Simpler reporting
* Strong SQL ecosystem

Negative:

* Slightly less flexibility than document databases

---

### Constraints

PostgreSQL is the source of truth.

Business-critical data must not live outside PostgreSQL.

---

# ADR-003

## Title

Vector Search Architecture

---

### Status

Accepted

---

### Context

The AI system requires memory retrieval.

Possible options:

* Dedicated vector database
* PostgreSQL + pgvector

---

### Decision

Use:

```text id="adr005"
pgvector
```

alongside PostgreSQL.

---

### Rationale

Benefits:

* Single database architecture
* Lower operational complexity
* Simpler backups
* Easier AI integration

---

### Consequences

Positive:

* Reduced infrastructure
* Simpler maintenance

Negative:

* Less specialized than dedicated vector databases

---

### Constraints

pgvector is not a source of truth.

Structured PostgreSQL tables remain authoritative.

---

# ADR-004

## Title

Application Architecture Style

---

### Status

Accepted

---

### Context

Potential architectures:

* Monolith
* Modular Monolith
* Microservices

---

### Decision

Use:

```text id="adr006"
Modular Monolith
```

---

### Rationale

Benefits:

* Faster development
* Easier deployment
* Better AI-assisted development
* Lower infrastructure complexity

---

### Consequences

Positive:

* Reduced operational burden
* Easier debugging

Negative:

* Potential future scaling boundaries

---

### Future Review

Microservices should only be considered when:

* User growth requires it
* Operational bottlenecks appear
* Independent scaling becomes necessary

---

# ADR-005

## Title

Carbon Calculation Authority

---

### Status

Accepted

---

### Context

The platform requires carbon calculations.

Options:

* AI-generated calculations
* Deterministic calculations

---

### Decision

Use:

```text id="adr007"
Deterministic Carbon Engine
```

---

### Rationale

Benefits:

* Scientific credibility
* Auditability
* Reproducibility
* Predictability

---

### Consequences

Positive:

* Trusted calculations
* Easier validation

Negative:

* Requires emission factor maintenance

---

### Mandatory Rule

AI must never:

* calculate official emissions
* create emission factors
* modify footprint records

---

# ADR-006

## Title

Emission Factor Management

---

### Status

Accepted

---

### Context

Carbon accounting requires scientific conversion factors.

---

### Decision

Use:

```text id="adr008"
Versioned Emission Factors
```

stored in PostgreSQL.

---

### Rationale

Benefits:

* Auditability
* Historical accuracy
* Recalculation support

---

### Rules

Factors are:

* Versioned
* Immutable
* Never updated in-place

New scientific data creates:

```text id="adr009"
New Factor Version
```

---

# ADR-007

## Title

Mission Generation Strategy

---

### Status

Accepted

---

### Context

Daily missions are the primary engagement loop.

Options:

* AI-generated missions
* Template-driven missions
* Hybrid approach

---

### Decision

Use:

```text id="adr010"
Rules Engine
+
Mission Templates
+
AI Personalization
```

---

### Rationale

Benefits:

* Lower hallucination risk
* Lower AI cost
* Better consistency

---

### Flow

```text id="adr011"
User Data
     │
     ▼

Rules Engine

     │
     ▼

Mission Template

     │
     ▼

Gemini Personalization
```

---

# ADR-008

## Title

AI Execution Model

---

### Status

Accepted

---

### Context

AI generation may introduce latency.

Options:

* Synchronous generation
* Async generation

---

### Decision

Default:

```text id="adr012"
Async Queue Processing
```

---

### Technology

```text id="adr013"
Redis
+
Celery
```

---

### Exceptions

Allowed synchronous AI:

* Coach Chat
* Explicit user requests

Everything else should be asynchronous.

---
# ADR-009

## Title

Authentication Provider

---

### Status

Accepted

---

### Date

2026

---

### Context

The platform requires a managed authentication provider that integrates well with the PostgreSQL ecosystem and supports mobile authentication flows.

Previous provider: Clerk

Migrated to: Supabase Auth

---

### Decision

Use:

```text
Supabase Auth
```

---

### Rationale

Benefits:

* Single vendor for Authentication, PostgreSQL, Storage, and Row Level Security
* Excellent free tier for MVP and competition usage
* Native PostgreSQL integration with built-in RLS support
* Mobile-friendly authentication flows
* Reduced infrastructure complexity
* JWT support with standard Bearer token pattern
* OAuth support for social login
* Built-in security features

---

### Consequences

Positive:

* Unified Supabase stack (Auth + DB + Storage)
* Simplified secrets management
* Lower operational complexity

Negative:

* Vendor dependency on Supabase

---

### Constraints

Authentication must be handled through Supabase Auth.

Custom authentication systems are prohibited for MVP.

FastAPI must validate Supabase JWT tokens before granting access to protected resources.

The user identity field in all database tables must use `auth_user_id` (Supabase auth UID), not `clerk_user_id`.

---

### Environment Variables

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

# ADR-010

## Title

Storage Architecture

---

### Status

Accepted

---

### Decision

Use:

```text id="adr015"
AWS S3
```

for file storage.

---

### Files Supported

* Receipts
* Bills
* Mission Proofs
* Profile Images

---

### Constraints

Binary files must never be stored inside PostgreSQL.

---

# ADR-011

## Title

India-First Carbon Methodology

---

### Status

Accepted

---

### Context

The initial target audience is India.

---

### Decision

Emission factors prioritize:

```text id="adr016"
Indian Sources
```

before international fallbacks.

---

### Priority Order

```text id="adr017"
India Sources

↓

IPCC

↓

EPA

↓

Academic Sources
```

---

### Rationale

Provides:

* Higher relevance
* Better competition credibility
* More accurate regional calculations

---

# ADR-012

## Title

Community & Social Layer

---

### Status

Accepted

---

### Context

Behavior change improves through accountability.

---

### Decision

Support:

```text id="adr018"
Groups

Challenges

Leaderboards

Community Impact
```

---

### Rationale

Community mechanics are considered core retention features.

Not optional enhancements.

---

# ADR-013

## Title

Source of Truth Hierarchy

---

### Status

Accepted

---

### Decision

The platform follows the hierarchy:

```text id="adr019"
Emission Factors
        ↓
Carbon Engine
        ↓
Daily Footprints
        ↓
AI Layer
```

---

### Meaning

AI is downstream.

AI never overrides upstream systems.

---

# ADR-014

## Title

AI Safety Architecture

---

### Status

Accepted

---

### Decision

All AI outputs require validation.

---

### Required Validation

* Structure validation
* Safety validation
* Numerical validation
* Hallucination checks

---

### Rationale

Prevents:

* fabricated calculations
* unsupported claims
* unsafe outputs

---

# ADR-015

## Title

Repository Architecture

---

### Status

Accepted

---

### Decision

Use:

```text id="adr020"
Monorepo
```

with:

```text id="adr021"
apps/
services/
packages/
infrastructure/
docs/
```

---

### Rationale

Benefits:

* Shared contracts
* Easier AI generation
* Better consistency
* Faster onboarding

---

# Architecture Rules

The following decisions are locked:

✅ Gemini
✅ PostgreSQL
✅ pgvector
✅ Modular Monolith
✅ Deterministic Carbon Engine
✅ Versioned Emission Factors
✅ Async AI Processing
✅ Supabase Auth
✅ AWS S3 Storage
✅ India-First Methodology

These decisions should not be re-evaluated unless a new ADR is created.

---

# Final Statement

This ADR collection exists to preserve architectural intent.

Future contributors and AI systems must treat these decisions as authoritative.

Any proposal that conflicts with an accepted ADR must explicitly justify why the change is necessary and what benefits outweigh the existing decision.
