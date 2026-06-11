# SECURITY_REQUIREMENTS.md

# Security, Privacy & Compliance Specification

## Purpose

This document defines the official security architecture for the Carbon Footprint Awareness Platform.

This document is the source of truth for:

* Authentication
* Authorization
* Data Protection
* Privacy Controls
* Compliance Requirements
* AI Security
* Infrastructure Security
* Secrets Management

All engineers, AI agents, and infrastructure components must follow these requirements.

---

# Security Philosophy

## Principle 1

Least Privilege Access

Every system, service, and user should have the minimum permissions required to perform its responsibilities.

---

## Principle 2

Privacy By Design

Privacy must be built into the architecture.

Not added later.

---

## Principle 3

Zero Trust

Every request must be verified.

No request should be trusted automatically.

---

## Principle 4

Defense In Depth

Security controls should exist at multiple layers.

Examples:

* Authentication
* Authorization
* Validation
* Encryption
* Monitoring

---

# Data Classification

All platform data must be classified.

---

## Public Data

Examples:

* Marketing content
* Public statistics
* Documentation

Security Level:

Low

---

## Internal Data

Examples:

* Community aggregates
* Anonymous analytics

Security Level:

Medium

---

## Sensitive User Data

Examples:

* Email address
* User profile
* Activity history
* Mission history
* Group membership

Security Level:

High

---

## Restricted Data

Examples:

* JWT claims
* Authentication tokens
* API secrets
* Database credentials
* Encryption keys

Security Level:

Critical

---

# Authentication

## Provider

Official Authentication Provider:

Supabase Auth

---

## Authentication Method

```text id="auth01"
JWT Authentication
```

All API requests must contain:

```http id="auth02"
Authorization: Bearer <token>
```

---

## Token Validation

Every request must validate:

* Signature
* Expiration
* Issuer
* Audience
* User ID

Failure results in:

```http id="auth03"
401 Unauthorized
```

---

# Authorization

## Ownership Rule

Users may only access resources they own.

Example:

```text id="auth04"
user_id == authenticated_user_id
```

Required for:

* activities
* footprints
* missions
* insights
* uploads

---

## Admin Access

Admin permissions must be role-based.

Supported roles:

```text id="auth05"
user

moderator

admin

super_admin
```

---

## Authorization Middleware

Every protected endpoint must execute:

1. Authentication
2. Role Validation
3. Ownership Validation

Before business logic.

---

# PostgreSQL Security

## Row Level Security

RLS must be enabled.

Required tables:

```text id="db01"
users

activity_events

daily_footprints

user_missions

ai_insights

uploads
```

---

## Example RLS Policy

```sql id="db02"
user_id = auth.uid()
```

Users should never access another user's records.

---

## Database Access Rules

Application code must access PostgreSQL through:

* SQLAlchemy
* Repository Layer

Direct database access from AI systems is prohibited.

---

# Encryption Standards

## Encryption In Transit

Required:

```text id="enc01"
TLS 1.3
```

For:

* Mobile App
* API
* Database
* Storage

---

## Encryption At Rest

Required for:

* PostgreSQL
* S3
* Redis backups

---

## Sensitive Fields

Must be encrypted when appropriate:

* API tokens
* OAuth credentials
* Integration secrets

---

# Secrets Management

## Prohibited

Never store:

```text id="sec01"
API Keys

JWT Secrets

Database Passwords

Access Tokens
```

In:

* Git
* Source Code
* Frontend Bundle

---

## Allowed Storage

Secrets stored only in:

```text id="sec02"
Railway Secrets

Vercel Environment Variables

Supabase Dashboard

AWS Secrets Manager
```

---

# File Upload Security

## Supported Upload Types

Allowed:

```text id="file01"
jpg

jpeg

png

pdf
```

---

## Maximum Upload Size

```text id="file02"
10 MB
```

MVP Limit.

---

## Virus Scanning

Future Requirement:

Uploaded files should be scanned before processing.

---

## Storage Rules

Files stored in:

```text id="file03"
AWS S3
```

Database stores metadata only.

Never store binary files in PostgreSQL.

---

# Activity Data Privacy

## Data Minimization

Store only data required for platform functionality.

---

### Good Example

```json id="priv01"
{
  "transport_mode": "car",
  "distance_km": 12
}
```

---

### Bad Example

```json id="priv02"
{
  "exact_gps_coordinates": "...",
  "full_route_history": "..."
}
```

---

## Location Data

Current Policy:

Do not store precise location history.

Store:

```text id="priv03"
distance

transport_mode

state
```

Only.

---

# Retention Policy

## Long-Term Storage

Keep:

* footprints
* missions
* streaks
* challenge history

---

## Short-Term Storage

Keep temporarily:

* OCR output
* upload processing data
* intermediate AI artifacts

---

## User Deletion

Users must be able to:

* delete account
* delete uploads
* revoke permissions

---

# AI Security Requirements

## Principle

AI is untrusted.

All AI outputs require validation.

---

# Prompt Injection Protection

AI inputs must be sanitized.

Examples:

* receipt text
* uploaded files
* user chat messages

---

## Forbidden AI Behaviors

AI must never:

* execute code
* access databases
* retrieve secrets
* modify system records

---

## Allowed AI Behaviors

AI may:

* summarize
* explain
* coach
* categorize

---

# Output Validation

Every AI response must pass:

## Validation 1

Correct schema.

---

## Validation 2

Length constraints.

---

## Validation 3

No fabricated numbers.

---

## Validation 4

No unsupported environmental claims.

---

## Validation 5

No security-sensitive content.

---

# Rate Limiting

Required on all public endpoints.

---

## Activity API

```text id="rate01"
60 requests/hour
```

---

## AI Chat

```text id="rate02"
30 requests/hour
```

---

## Insight Generation

```text id="rate03"
10 requests/hour
```

---

## Uploads

```text id="rate04"
20 requests/hour
```

---

# Logging Requirements

## Log What Matters

Allowed:

* endpoint
* response time
* status code
* request ID

---

## Never Log

```text id="log01"
JWT Tokens

Passwords

Secrets

Raw Receipts

Payment Data

Personal Documents
```

---

# Audit Logging

Audit events required for:

* profile updates
* role changes
* challenge administration
* account deletion
* security events

Stored in:

```text id="log02"
audit_logs
```

---

# Monitoring & Detection

## Monitoring Tool

Sentry

Tracks:

* exceptions
* crashes
* API failures
* worker failures

---

## Security Events

Monitor:

* failed logins
* excessive API usage
* upload abuse
* suspicious AI requests

---

# Backup Strategy

## PostgreSQL

Daily Backup

Retention:

```text id="backup01"
30 Days
```

---

## S3

Versioning Enabled

---

## Recovery Target

```text id="backup02"
RPO < 24 Hours

RTO < 4 Hours
```

---

# Compliance Requirements

## Required Principles

Support:

* Right to Access
* Right to Delete
* Consent Tracking
* Data Minimization

Stored in:

```text id="comp01"
privacy_consents
```

---

# Security Checklist

Before Production:

* [ ] JWT validation implemented
* [ ] RLS enabled
* [ ] TLS enabled
* [ ] Secrets externalized
* [ ] Upload validation implemented
* [ ] AI validation implemented
* [ ] Rate limiting enabled
* [ ] Audit logging enabled
* [ ] Backups configured
* [ ] Monitoring configured

---

# Incident Response

## Critical Incident

Examples:

* Data leak
* Unauthorized access
* Credential exposure

---

## Response Process

1. Contain
2. Investigate
3. Remediate
4. Recover
5. Document
6. Improve

---

# Architecture Constraints

Mandatory Rules:

1. JWT validation on every protected endpoint.
2. RLS enabled for user-owned data.
3. AI cannot access databases directly.
4. Sensitive data must be encrypted.
5. Secrets never stored in source code.
6. Uploads must be validated.
7. Logs must exclude sensitive information.
8. User deletion must be supported.
9. Audit logs are mandatory.
10. Privacy by design is non-negotiable.

---

# Final Statement

The Carbon Footprint Awareness Platform handles sensitive behavioral and environmental data.

Security and privacy are foundational requirements, not optional features.

Every engineering decision must prioritize user trust, data protection, and long-term maintainability.

No feature should be implemented in a way that compromises security, privacy, or transparency.
