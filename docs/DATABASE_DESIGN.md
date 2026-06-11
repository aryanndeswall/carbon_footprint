# DATABASE_DESIGN.md

# Database Design Specification

## Purpose

This document defines the complete database architecture for the Carbon Footprint Awareness Platform.

This file is the source of truth for:

* Database schema
* Relationships
* Constraints
* Indexing strategy
* Retention policies
* Data ownership

All developers and AI coding agents must follow this document when generating migrations, models, repositories, and queries.

---

# Database Philosophy

The platform follows four principles:

## 1. PostgreSQL is the Source of Truth

All business-critical data must live in PostgreSQL.

Examples:

* Users
* Activities
* Footprints
* Missions
* Streaks
* Challenges
* Groups

---

## 2. Carbon Data Must Be Auditable

Every carbon calculation must be traceable.

Requirements:

* Emission factor versioning
* Historical calculation preservation
* Source tracking

The system must always be able to answer:

> "Why was this footprint value generated?"

---

## 3. Activities Are Immutable

Activity records are append-only.

Updates should create new events.

Activities should never be silently overwritten.

---

## 4. AI Memory Is Supplemental

Embeddings stored in pgvector are not business data.

Structured tables remain the source of truth.

---

# Database Overview

```text id="l5wnaw"
PostgreSQL
│
├── Core Domain Tables
│
├── Carbon Domain Tables
│
├── Mission Domain Tables
│
├── Community Domain Tables
│
├── Analytics Tables
│
└── AI Memory Tables
```

---

# Core Domain Tables

## users

Stores user account information.

### Columns

```sql id="z48j6u"
id UUID PRIMARY KEY

auth_user_id UUID UNIQUE NOT NULL

email VARCHAR(255) UNIQUE

full_name VARCHAR(255)

avatar_url TEXT

state_code VARCHAR(10)

timezone VARCHAR(100)

diet_type VARCHAR(50)

transport_mode VARCHAR(50)

housing_type VARCHAR(50)

created_at TIMESTAMP

updated_at TIMESTAMP
```

### auth_user_id

Links to Supabase Auth user UID.

This field is the bridge between Supabase Auth and the application database.

Must not be `clerk_user_id`.

### Purpose

Stores profile information used for:

* personalization
* onboarding
* AI context
* mission generation

---

## user_preferences

Stores configurable user settings.

### Columns

```sql id="h5wpgz"
id UUID PRIMARY KEY

user_id UUID

notifications_enabled BOOLEAN

mission_difficulty VARCHAR(20)

preferred_categories JSONB

privacy_mode BOOLEAN

created_at TIMESTAMP
```

---

# Carbon Domain

## activity_events

Most important operational table.

Stores all user actions.

### Columns

```sql id="fg8udw"
id UUID PRIMARY KEY

user_id UUID

event_type VARCHAR(50)

source VARCHAR(50)

payload JSONB

confidence_score NUMERIC(5,2)

occurred_at TIMESTAMP

created_at TIMESTAMP
```

### Examples

Transport

```json id="rrk4ta"
{
  "mode": "car",
  "distance_km": 15
}
```

Food

```json id="x5n5kt"
{
  "food_type": "chicken",
  "quantity": 1
}
```

### Rules

Append-only.

Never update historical records.

---

## emission_factors

Most important table in the entire system.

### Purpose

Stores all carbon conversion factors.

Every carbon value originates from this table.

### Columns

```sql id="t9vxgz"
id UUID PRIMARY KEY

category VARCHAR(50)

subcategory VARCHAR(100)

unit VARCHAR(50)

co2_per_unit NUMERIC(12,6)

region_code VARCHAR(20)

source_name TEXT

source_url TEXT

version VARCHAR(20)

valid_from DATE

valid_to DATE

created_at TIMESTAMP
```

### Example

```text id="cpby6q"
Transport
Car
Per KM
India
0.192
```

### Rules

Never delete records.

New scientific data creates a new version.

Historical records must retain references to the factor version used.

---

## daily_footprints

Stores calculated daily carbon totals.

### Columns

```sql id="5zv0jo"
id UUID PRIMARY KEY

user_id UUID

date DATE

total_co2 NUMERIC(12,4)

food_co2 NUMERIC(12,4)

transport_co2 NUMERIC(12,4)

electricity_co2 NUMERIC(12,4)

shopping_co2 NUMERIC(12,4)

emission_factor_version VARCHAR(20)

created_at TIMESTAMP
```

### Purpose

Dashboard queries.

Trend analysis.

Mission generation.

AI retrieval.

---

## daily_footprint_sources

Junction table.

Replaces source_event_ids arrays.

### Columns

```sql id="w7k2aj"
footprint_id UUID

event_id UUID
```

### Reason

Supports:

* auditing
* recomputation
* event tracing

---

# Mission Domain

## mission_templates

Master mission catalog.

### Columns

```sql id="dt7fwp"
id UUID PRIMARY KEY

title VARCHAR(255)

description TEXT

category VARCHAR(50)

difficulty VARCHAR(20)

estimated_co2_saved NUMERIC

active BOOLEAN

created_at TIMESTAMP
```

### Examples

```text id="4xlk4r"
Skip One Delivery Order

Use Public Transport

Vegetarian Lunch Challenge
```

---

## user_missions

Assigned missions.

### Columns

```sql id="dr6bcx"
id UUID PRIMARY KEY

user_id UUID

mission_template_id UUID

status VARCHAR(20)

assigned_date DATE

completed_date DATE

co2_saved NUMERIC

created_at TIMESTAMP
```

---

# Streak Domain

## streaks

Tracks user consistency.

### Columns

```sql id="o3yt3e"
user_id UUID PRIMARY KEY

current_streak INT

longest_streak INT

streak_freezes INT

last_activity_date DATE

updated_at TIMESTAMP
```

### Rules

One streak record per user.

Updated by background workers.

Never computed during page load.

---

# Community Domain

## groups

### Columns

```sql id="ypquww"
id UUID PRIMARY KEY

name VARCHAR(255)

description TEXT

owner_id UUID

visibility VARCHAR(20)

created_at TIMESTAMP
```

---

## group_members

### Columns

```sql id="i2z3ql"
group_id UUID

user_id UUID

role VARCHAR(20)

joined_at TIMESTAMP
```

---

## challenges

### Columns

```sql id="97vnk7"
id UUID PRIMARY KEY

title VARCHAR(255)

description TEXT

start_date DATE

end_date DATE

created_at TIMESTAMP
```

---

## challenge_participants

### Columns

```sql id="6f2slt"
challenge_id UUID

user_id UUID

progress NUMERIC

joined_at TIMESTAMP
```

---

# AI Domain

## ai_insights

Stores generated AI outputs.

### Columns

```sql id="ahv3r9"
id UUID PRIMARY KEY

user_id UUID

insight_type VARCHAR(50)

summary TEXT

recommendation TEXT

generated_by VARCHAR(50)

created_at TIMESTAMP
```

### Rules

AI outputs are cached.

Regenerate only when necessary.

---

## ai_memory_embeddings

pgvector table.

### Columns

```sql id="2j0p3c"
id UUID PRIMARY KEY

user_id UUID

content_type VARCHAR(50)

source_id UUID

content TEXT

embedding VECTOR

created_at TIMESTAMP
```

### Purpose

Semantic retrieval.

Coaching memory.

Mission personalization.

### Not Used For

Business logic.

Carbon calculations.

Permissions.

---

# Analytics Domain

## community_stats

Stores aggregate community metrics.

### Columns

```sql id="8kt1zj"
id UUID PRIMARY KEY

total_users INT

total_co2_saved NUMERIC

missions_completed INT

active_streaks INT

updated_at TIMESTAMP
```

### Purpose

Community impact screens.

Competition demos.

Growth tracking.

---

# Infrastructure Tables

## notification_jobs

### Columns

```sql id="d6x1ha"
id UUID PRIMARY KEY

user_id UUID

job_type VARCHAR(50)

payload JSONB

scheduled_at TIMESTAMP

status VARCHAR(20)

retry_count INT
```

---

## audit_logs

### Columns

```sql id="eiz0zj"
id UUID PRIMARY KEY

entity_type VARCHAR(50)

entity_id UUID

action VARCHAR(50)

performed_by UUID

created_at TIMESTAMP
```

### Purpose

Security.

Compliance.

Traceability.

---

# pgvector Design

## Embedding Model

Current Provider:

Gemini Embeddings

### Storage

```text id="rw91yj"
Weekly Summaries

Mission History

User Preferences

Behavior Patterns
```

### Not Stored

```text id="wxszv9"
Raw Receipts

Carbon Factors

Authentication Data
```

---

# Indexing Strategy

## High Priority Indexes

```sql id="krhnw9"
activity_events(user_id, occurred_at)

daily_footprints(user_id, date)

user_missions(user_id, status)

ai_insights(user_id, created_at)

group_members(group_id, user_id)
```

---

# Retention Policy

## Keep Long-Term

* footprints
* missions
* streaks
* insights

---

## Delete After Retention Window

* raw uploads
* temporary OCR output
* intermediate processing data

---

# Data Ownership Rules

Carbon Engine Owns:

* emission_factors
* daily_footprints

Mission Engine Owns:

* mission_templates
* user_missions

Community Service Owns:

* groups
* challenges

AI Service Owns:

* ai_insights
* ai_memory_embeddings

No service may directly modify another service's owned tables.

Changes must go through explicit service interfaces.

---

# Final Statement

This schema is designed to support:

* deterministic carbon accounting
* auditability
* AI personalization
* social accountability
* long-term scalability

PostgreSQL remains the source of truth.

pgvector exists solely to enhance retrieval and personalization.

No AI-generated output may override structured database records.
