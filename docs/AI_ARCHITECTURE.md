# AI_ARCHITECTURE.md

# AI Architecture Specification

## Purpose

This document defines the official Artificial Intelligence architecture for the Carbon Footprint Awareness Platform.

The AI system exists to:

* increase engagement
* improve personalization
* explain user behavior
* generate actionable insights
* encourage sustainable habits

The AI system does NOT exist to:

* calculate carbon emissions
* replace the Carbon Engine
* become the source of truth
* make financial or environmental guarantees

This document is the source of truth for all AI-related implementation decisions.

---

# AI Philosophy

## Core Principle

The AI is a Coach, Not a Calculator.

The Carbon Engine calculates.

The AI interprets.

This distinction must never be violated.

---

## Responsibilities of AI

AI MAY:

* Generate daily coaching
* Explain footprint changes
* Personalize missions
* Generate weekly summaries
* Create challenge descriptions
* Answer sustainability-related questions
* Retrieve relevant user memories

---

## AI Must Never

AI MUST NOT:

* Calculate official carbon emissions
* Generate emission factors
* Override carbon calculations
* Modify footprint records
* Modify emission factor tables
* Change user history
* Perform database writes directly

All official calculations come from the Carbon Engine.

---

# AI System Goals

The AI system has four objectives:

### Goal 1

Increase daily engagement.

---

### Goal 2

Increase mission completion.

---

### Goal 3

Improve retention.

---

### Goal 4

Make sustainability understandable.

---

# Selected AI Provider

## Official Provider

Gemini

### Primary Model

Gemini 2.5 Flash

Used for:

* Daily coaching
* Mission personalization
* Activity categorization
* Weekly summaries
* Challenge generation

---

### Future Upgrade Path

Gemini 2.5 Pro

Used only for:

* Advanced coaching
* Deep reflections
* Long-term forecasting
* Complex sustainability discussions

---

# AI Architecture Overview

```text id="g6m4uo"
User Data
     │
     ▼

Carbon Engine
     │
     ▼

Daily Aggregates
     │
     ▼

Retrieval Layer
     │
     ▼

Prompt Builder
     │
     ▼

Gemini
     │
     ▼

Output Validator
     │
     ▼

AI Insight Store
```

---

# AI System Components

## Component 1

Carbon Engine

Purpose:

Generate deterministic footprint data.

Produces:

* Daily totals
* Category breakdowns
* Trends

This component is not AI.

---

## Component 2

Retrieval Layer

Purpose:

Provide context.

Retrieves:

* User profile
* User preferences
* Recent activities
* Mission history
* Streak data
* Prior insights

---

## Component 3

Prompt Builder

Purpose:

Convert structured data into model-ready context.

The Prompt Builder is responsible for:

* Context assembly
* Prompt formatting
* Safety instructions
* Token optimization

---

## Component 4

Gemini Layer

Purpose:

Generate natural language outputs.

Produces:

* Coaching
* Recommendations
* Summaries
* Challenges

---

## Component 5

Output Validator

Purpose:

Prevent invalid AI responses.

Checks:

* Response structure
* Length limits
* Safety compliance
* Hallucinated calculations

Invalid outputs are rejected.

---

## Component 6

Insight Store

Purpose:

Persist generated outputs.

Stores:

* Weekly summaries
* Coaching history
* Mission explanations

Stored outputs improve personalization.

---

# AI Memory Architecture

## Memory Goal

The system should remember user behavior.

Not conversations.

The platform remembers:

* habits
* preferences
* progress
* challenge history

---

# Memory Storage

Storage Location:

PostgreSQL + pgvector

---

## Memory Sources

### Source 1

Mission History

Example:

```text id="jlwmw5"
User completed 9 food missions.

User ignored transport missions.
```

---

### Source 2

Behavior Patterns

Example:

```text id="4tmv4z"
Food emissions decreasing.

Transport emissions increasing.
```

---

### Source 3

Preferences

Example:

```text id="8v1fjj"
Prefers easy challenges.

Vegetarian diet.
```

---

### Source 4

Previous Insights

Example:

```text id="h77r2u"
User responds positively to progress-focused feedback.
```

---

# Memory Retrieval Process

```text id="psw25g"
User Opens App
      │
      ▼

Query Current State

      │
      ▼

Query Relevant Memories

      │
      ▼

Top-K Retrieval

      │
      ▼

Prompt Construction

      │
      ▼

Gemini Generation
```

---

# Retrieval Strategy

## Initial Version

Top-K Similarity Search

Recommended:

```text id="0jtp0k"
K = 5
```

---

Retrieve:

* Most relevant memories
* Most recent summaries
* Most recent behavior patterns

---

## Future Version

Hybrid Retrieval

Combines:

* Semantic similarity
* Recency
* Importance score

Not required for MVP.

---

# AI Workflows

## Workflow 1

Daily Coaching

### Trigger

User opens app.

### Inputs

* Today's footprint
* Mission status
* Streak state

### Output

Short coaching message.

Example:

```text id="jqm6d7"
You are on a 5-day streak.

Completing today's transport mission would reduce your weekly footprint further.
```

---

## Workflow 2

Weekly Reflection

### Trigger

Scheduled job.

### Frequency

Weekly.

### Inputs

* 7-day footprint history
* Completed missions
* Streak progress

### Output

Weekly summary.

Example:

```text id="h3g1z5"
Your footprint decreased by 11% this week.

Food-related improvements drove most of the reduction.
```

---

## Workflow 3

Mission Personalization

### Trigger

Mission assignment.

### Process

Rules Engine selects mission.

Gemini personalizes delivery.

---

Example:

Rules Engine:

```text id="d4p0ph"
Mission:
Vegetarian Lunch
```

Gemini:

```text id="a8xrtw"
Choosing a vegetarian lunch today could become one of the easiest ways to reduce your food footprint this week.
```

---

## Workflow 4

Challenge Generation

### Trigger

Community challenge creation.

### Inputs

* Group behavior
* Average emissions
* Previous challenge performance

### Outputs

Challenge description.

Challenge title.

Motivational copy.

---

# Prompt Engineering Rules

## Prompt Structure

Every prompt contains:

### Section 1

System Instructions

---

### Section 2

Retrieved Context

---

### Section 3

Current User State

---

### Section 4

Desired Output Format

---

### Section 5

Safety Rules

---

# Example Prompt Structure

```text id="udbgki"
SYSTEM

You are a sustainability coach.

Do not calculate emissions.

Do not invent carbon values.

Use only provided data.

CONTEXT

User completed 7 food missions.

Current streak: 5

Current food emissions: 2.4 kg

TASK

Generate a short motivational insight.
```

---

# AI Safety Constraints

Gemini must never:

* Invent emission factors
* Invent carbon calculations
* Create unsupported claims
* Access database internals
* Expose sensitive information

---

# Hallucination Prevention Strategy

## Rule 1

All numerical values must come from system data.

---

## Rule 2

Prompts must provide metrics.

Never ask Gemini to estimate.

---

## Rule 3

AI outputs must reference available facts only.

---

## Rule 4

Structured outputs preferred.

---

# Output Validation

Every AI response should be validated.

Validation checks:

### Check 1

Required fields present.

---

### Check 2

Length constraints met.

---

### Check 3

No unsupported numerical claims.

---

### Check 4

No policy violations.

---

### Check 5

No hallucinated carbon calculations.

---

# AI Job Architecture

AI generation never runs during critical requests.

Use async processing.

---

## Queue Flow

```text id="gr9hgh"
User Event
      │
      ▼

Redis Queue

      │
      ▼

Celery Worker

      │
      ▼

Gemini API

      │
      ▼

Validation

      │
      ▼

Store Result
```

---

# AI Endpoint Definitions

## Generate Insight

```text id="lrx8we"
POST /ai/insights/generate
```

---

## Get Latest Insight

```text id="zlcjtw"
GET /ai/insights/latest
```

---

## Generate Weekly Reflection

```text id="0ah8iv"
POST /ai/reflection/generate
```

---

## Coach Chat

```text id="5pqf9x"
POST /ai/chat
```

---

# Coach Chat Rules

The coach can:

* Explain trends
* Explain missions
* Explain footprint changes
* Suggest actions

The coach cannot:

* Rewrite data
* Change scores
* Generate official carbon calculations

---

# Rate Limiting

AI endpoints require protection.

Suggested limits:

```text id="7t1pqz"
Insights:
10/hour

Coach Chat:
30/hour

Challenge Generation:
5/hour
```

---

# Fallback Strategy

If Gemini becomes unavailable:

Fallback:

* Cached insights
* Template coaching
* Rules-based missions

The application must continue functioning.

AI failure should never break the core product.

---

# Performance Targets

Daily Coaching:

```text id="0rwg4f"
< 2 seconds
```

---

Weekly Reflection:

```text id="zslzq8"
< 30 seconds
```

---

Mission Personalization:

```text id="y61i78"
< 5 seconds
```

---

# Architecture Constraints

Mandatory Rules:

1. AI is not the source of truth.
2. Carbon Engine is authoritative.
3. AI outputs are validated.
4. AI memory uses pgvector.
5. Retrieval occurs before generation.
6. Numerical values come from system data.
7. AI jobs run asynchronously.
8. Gemini Flash is the default model.
9. AI must remain replaceable.
10. Safety validation is required.

---

# Final Statement

The AI system exists to improve engagement, personalization, and habit formation.

The Carbon Engine remains the authoritative source for all environmental calculations.

Artificial intelligence enhances understanding and motivation but never replaces deterministic carbon accounting.

This separation is a foundational architectural requirement and must be preserved throughout the lifetime of the platform.
