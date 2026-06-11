# API_CONTRACTS.md

# API Contracts & Integration Specification

## Purpose

This document defines the official API contract for the Carbon Footprint Awareness Platform.

This file acts as the source of truth for:

* FastAPI route definitions
* Request schemas
* Response schemas
* Authentication requirements
* Error handling standards
* Pagination conventions
* AI integration contracts

All frontend applications, backend services, AI agents, and third-party integrations must follow these contracts.

---

# API Design Principles

## Principle 1

Consistency over convenience.

All endpoints should follow predictable patterns.

---

## Principle 2

Never return unstructured responses.

All responses must follow standardized schemas.

---

## Principle 3

Frontend should never calculate business logic.

The backend is authoritative.

---

## Principle 4

All API versions must be backwards compatible whenever possible.

---

# Base URL

## Development

```text id="r41twv"
http://localhost:8000/api/v1
```

---

## Production

```text id="r8n71z"
https://api.carbonsense.app/api/v1
```

---

# Authentication

Provider:

Supabase Auth

Authentication Type:

```text id="9t4fh5"
Bearer JWT
```

FastAPI must validate the Supabase JWT from the Authorization header before processing any protected request.

---

# Request Headers

Required:

```http id="y2ctfx"
Authorization: Bearer <token>
Content-Type: application/json
```

---

# Standard Success Response

All successful responses should follow:

```json id="8ngj1u"
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

---

# Standard Error Response

```json id="j9ncyw"
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Requested resource not found"
  }
}
```

---

# Pagination Format

```json id="20n2fx"
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 150,
    "total_pages": 8
  }
}
```

---

# User Endpoints

## Get Current User

### Endpoint

```http id="r93n1f"
GET /users/me
```

### Response

```json id="thpr6y"
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@email.com",
    "full_name": "John Doe",
    "state_code": "DL",
    "timezone": "Asia/Kolkata"
  }
}
```

---

## Update User Profile

### Endpoint

```http id="h8wt44"
PATCH /users/me
```

### Request

```json id="h5nnva"
{
  "full_name": "John Doe",
  "state_code": "DL",
  "diet_type": "vegetarian"
}
```

---

# Activity Endpoints

## Create Activity

### Endpoint

```http id="sl3mlp"
POST /activities
```

### Request

```json id="e9iwql"
{
  "event_type": "transport",
  "source": "manual",
  "payload": {
    "mode": "car",
    "distance_km": 15
  }
}
```

---

### Response

```json id="e1zz7q"
{
  "success": true,
  "data": {
    "activity_id": "uuid"
  }
}
```

---

## Get Activities

### Endpoint

```http id="9a8gci"
GET /activities
```

### Query Parameters

```text id="b4y8kk"
?page=1
&page_size=20
&type=transport
```

---

## Get Activity Details

### Endpoint

```http id="9kk4r4"
GET /activities/{activity_id}
```

---

# Carbon Footprint Endpoints

## Get Today's Footprint

### Endpoint

```http id="agjlwm"
GET /footprints/today
```

### Response

```json id="gt3i4z"
{
  "success": true,
  "data": {
    "total_co2": 4.8,
    "food_co2": 1.2,
    "transport_co2": 2.4,
    "electricity_co2": 0.8,
    "shopping_co2": 0.4
  }
}
```

---

## Get Daily Footprint

### Endpoint

```http id="zvfubk"
GET /footprints/{date}
```

Example:

```http id="xux8ya"
GET /footprints/2026-06-01
```

---

## Get Weekly Summary

### Endpoint

```http id="lf1yde"
GET /footprints/weekly
```

---

## Get Monthly Summary

### Endpoint

```http id="zc0m8y"
GET /footprints/monthly
```

---

# Mission Endpoints

## Get Today's Missions

### Endpoint

```http id="0jlwmr"
GET /missions/today
```

### Response

```json id="5lztjt"
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Use Public Transport",
      "difficulty": "easy",
      "estimated_co2_saved": 1.5
    }
  ]
}
```

---

## Complete Mission

### Endpoint

```http id="3r3ldf"
POST /missions/{mission_id}/complete
```

### Response

```json id="gq22pb"
{
  "success": true,
  "message": "Mission completed"
}
```

---

## Get Mission History

### Endpoint

```http id="jx44hu"
GET /missions/history
```

---

# Streak Endpoints

## Get Current Streak

### Endpoint

```http id="o4bzci"
GET /streaks/current
```

### Response

```json id="kt8q3s"
{
  "success": true,
  "data": {
    "current_streak": 7,
    "longest_streak": 15,
    "streak_freezes": 2
  }
}
```

---

# AI Endpoints

## Get Latest Insight

### Endpoint

```http id="lzhcje"
GET /ai/insights/latest
```

---

## Generate Insight

### Endpoint

```http id="rlrw46"
POST /ai/insights/generate
```

### Response

```json id="1ynitq"
{
  "success": true,
  "data": {
    "job_id": "uuid"
  }
}
```

---

## Get Insight Job Status

### Endpoint

```http id="6xyg7o"
GET /ai/jobs/{job_id}
```

---

## Coach Chat

### Endpoint

```http id="l3thh4"
POST /ai/chat
```

### Request

```json id="h3g71m"
{
  "message": "How can I reduce my food footprint?"
}
```

### Response

```json id="v4a58p"
{
  "success": true,
  "data": {
    "response": "Reducing meat consumption..."
  }
}
```

---

# Community Endpoints

## Create Group

### Endpoint

```http id="v48rmj"
POST /groups
```

### Request

```json id="odow2f"
{
  "name": "College Sustainability Club",
  "description": "Community challenge group"
}
```

---

## Join Group

### Endpoint

```http id="0hbwji"
POST /groups/{group_id}/join
```

---

## Leave Group

### Endpoint

```http id="6e57bi"
POST /groups/{group_id}/leave
```

---

## Get Group Details

### Endpoint

```http id="o6olrw"
GET /groups/{group_id}
```

---

## Group Leaderboard

### Endpoint

```http id="iw8v1n"
GET /groups/{group_id}/leaderboard
```

---

# Challenge Endpoints

## Get Active Challenges

### Endpoint

```http id="uq99up"
GET /challenges
```

---

## Join Challenge

### Endpoint

```http id="3m1nv4"
POST /challenges/{challenge_id}/join
```

---

## Challenge Progress

### Endpoint

```http id="mjlwmz"
GET /challenges/{challenge_id}/progress
```

---

# Upload Endpoints

## Upload Receipt

### Endpoint

```http id="3k42dc"
POST /uploads/receipt
```

### Content Type

```text id="5wb6pb"
multipart/form-data
```

### Response

```json id="cajmh0"
{
  "success": true,
  "data": {
    "upload_id": "uuid",
    "status": "processing"
  }
}
```

---

## Upload Electricity Bill

### Endpoint

```http id="0whf9f"
POST /uploads/electricity-bill
```

---

## Upload Mission Proof

### Endpoint

```http id="wq0v0k"
POST /uploads/mission-proof
```

---

# Notification Endpoints

## Get Notifications

### Endpoint

```http id="77l7yn"
GET /notifications
```

---

## Mark Notification Read

### Endpoint

```http id="0gobmb"
PATCH /notifications/{notification_id}/read
```

---

# Admin Endpoints

## Community Statistics

### Endpoint

```http id="vtzt4x"
GET /admin/community-stats
```

### Response

```json id="b5fqgk"
{
  "success": true,
  "data": {
    "total_users": 1200,
    "missions_completed": 9500,
    "total_co2_saved": 45000
  }
}
```

---

# Async Job Contracts

## Job Response

```json id="gcnsm0"
{
  "job_id": "uuid",
  "status": "queued"
}
```

---

## Job Status Values

```text id="l6mrut"
queued

processing

completed

failed
```

---

# Rate Limiting

## Activity Creation

```text id="dw4nlu"
60 requests/hour
```

---

## AI Chat

```text id="g0fh8s"
30 requests/hour
```

---

## Insight Generation

```text id="i1e9qm"
10 requests/hour
```

---

## Uploads

```text id="2oow1u"
20 requests/hour
```

---

# Validation Standards

All requests must validate:

* required fields
* field types
* ownership
* authorization
* payload size

Validation failures return:

```http id="mg9ct4"
422 Unprocessable Entity
```

---

# HTTP Status Standards

```text id="s6t3u1"
200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

429 Rate Limited

500 Internal Server Error
```

---

# API Versioning Strategy

Current:

```text id="9yd1mk"
v1
```

All routes must be prefixed:

```text id="mn1yq2"
/api/v1
```

Future breaking changes require:

```text id="qtv8si"
/api/v2
```

---

# Final Statement

The API layer is the contract between all clients and the Carbon Footprint Awareness Platform.

Clients must rely only on documented contracts.

Business logic remains server-side.

Carbon calculations remain deterministic and authoritative.

AI endpoints remain advisory and cannot alter system-of-record data.
