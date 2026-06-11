# API Reference Specification

This document defines the complete and authoritative API reference for all endpoints implemented from Sprint 1 through Sprint 5 of the Carbon Footprint Awareness Platform.

All endpoints under `/api/v1/` require token authentication via Supabase JWT, except where noted.

---

## 1. Global Headers & Authentication

All protected endpoints require the following request headers:
```http
Authorization: Bearer <SUPABASE_JWT_TOKEN>
Content-Type: application/json
```

### Authentication Architecture
* Authentication is handled on the backend via the `JWTAuthMiddleware`.
* Incoming Supabase JWTs are validated using JWKS signature keys (fetched from `SUPABASE_URL`) or verified locally for development/testing environments.
* The middleware extracts the authenticated user's `sub` (claims UUID) and stores it in the request state context as the user's identifier.

### Standard Response Formats

#### Successful Response Wrapper
All successful JSON responses return wrapped in a standard structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

#### Paginated Response Wrapper
For list/history endpoints:
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 12,
    "total_pages": 1
  },
  "message": "Retrieval successful"
}
```

#### Error Response Format
When error occurs, the standard format is returned:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Detailed error message explanation"
  }
}
```
Common HTTP Status Codes:
* `200 OK` - Request succeeded.
* `201 Created` - Resource created successfully.
* `400 Bad Request` - Validation or logic error (e.g. duplicating mission completion, insufficient freezes).
* `401 Unauthorized` - Token missing, expired, or signature validation failed.
* `404 Not Found` - Requested resource not found or belongs to another user.
* `422 Unprocessable Content` - Body/Query parsing failed (e.g. invalid category type, negative quantity).
* `500 Internal Server Error` - Database or server failure.

---

## 2. API Endpoints Catalog

### 2.1 Public Health Check
Verify backend availability and database connection health.

* **Endpoint**: `GET /health`
* **Authentication**: None (Public)
* **Response `200 OK`**:
  ```json
  {
    "status": "ok"
  }
  ```
* **Response `500 Internal Server Error`**:
  ```json
  {
    "detail": "Database connection check failed: <connection error details>"
  }
  ```

---

### 2.2 Users & Profiles
Manage user profiles, preferences, and onboarding flows.

#### Get Current User Profile
Retrieves the logged-in user's profile. If the profile does not exist yet (first-time login), it is automatically created along with default preferences.
* **Endpoint**: `GET /api/v1/users/me`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "auth_user_id": "31464673-9a3d-4c33-8a30-8027a00ef9f0",
      "email": "user@example.com",
      "full_name": null,
      "avatar_url": null,
      "created_at": "2026-06-12T00:50:00Z",
      "updated_at": "2026-06-12T00:50:00Z"
    },
    "message": "Profile retrieved successfully"
  }
  ```

#### Update User Profile
Updates details on the authenticated user's profile (`full_name`, `avatar_url`).
* **Endpoint**: `PATCH /api/v1/users/me`
* **Request Payload**:
  ```json
  {
    "full_name": "Aryan Deswall",
    "avatar_url": "https://example.com/avatars/aryan.png"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "auth_user_id": "31464673-9a3d-4c33-8a30-8027a00ef9f0",
      "email": "user@example.com",
      "full_name": "Aryan Deswall",
      "avatar_url": "https://example.com/avatars/aryan.png",
      "created_at": "2026-06-12T00:50:00Z",
      "updated_at": "2026-06-12T00:55:00Z"
    },
    "message": "Profile updated successfully"
  }
  ```

#### Get User Preferences
Retrieves preference settings for the authenticated user.
* **Endpoint**: `GET /api/v1/users/preferences`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "b3e0cf55-a0f1-432d-965b-bf98c50da300",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "state_code": "DL",
      "diet_type": "vegetarian",
      "transport_preference": "metro",
      "housing_type": "apartment",
      "notification_enabled": true,
      "created_at": "2026-06-12T00:50:00Z",
      "updated_at": "2026-06-12T00:52:00Z"
    },
    "message": "Preferences retrieved successfully"
  }
  ```

#### Update User Preferences
Updates one or more fields in the user preferences.
* **Endpoint**: `PATCH /api/v1/users/preferences`
* **Request Payload** (All fields optional):
  ```json
  {
    "state_code": "MH",
    "diet_type": "vegan",
    "transport_preference": "car",
    "housing_type": "independent_house",
    "notification_enabled": false
  }
  ```
  *Allowed values*:
  - `diet_type`: `vegetarian`, `vegan`, `non_vegetarian`, `eggetarian`
  - `housing_type`: `apartment`, `independent_house`, `hostel`, `pg`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "b3e0cf55-a0f1-432d-965b-bf98c50da300",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "state_code": "MH",
      "diet_type": "vegan",
      "transport_preference": "car",
      "housing_type": "independent_house",
      "notification_enabled": false,
      "created_at": "2026-06-12T00:50:00Z",
      "updated_at": "2026-06-12T01:02:00Z"
    },
    "message": "Preferences updated successfully"
  }
  ```

#### Complete Onboarding
Stores preferences and marks the onboarding flow complete for a user.
* **Endpoint**: `POST /api/v1/users/onboarding`
* **Request Payload** (All fields required):
  ```json
  {
    "state_code": "DL",
    "diet_type": "vegetarian",
    "transport_preference": "metro",
    "housing_type": "apartment"
  }
  ```
  *Allowed values*: Same as updates.
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "b3e0cf55-a0f1-432d-965b-bf98c50da300",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "state_code": "DL",
      "diet_type": "vegetarian",
      "transport_preference": "metro",
      "housing_type": "apartment",
      "notification_enabled": true,
      "created_at": "2026-06-12T00:50:00Z",
      "updated_at": "2026-06-12T00:52:00Z"
    },
    "message": "Onboarding completed successfully"
  }
  ```

---

### 2.3 Activity Logging
Log daily activities. Activities are immutable and trigger downstream carbon calculation and streak logic.

#### Log a New Activity
* **Endpoint**: `POST /api/v1/activities`
* **Request Payload**:
  ```json
  {
    "category": "transport",
    "activity_type": "metro",
    "quantity": 12.5,
    "unit": "km",
    "metadata": {
      "route": "Yellow Line",
      "confidence_score": 0.95
    }
  }
  ```
  *Supported Categories and Activity Types*:
  - **`transport`**: Types: `car`, `bus`, `metro`, `train`, `bike`, `walk`, `flight`
  - **`food`**: Types: `vegetarian_meal`, `vegan_meal`, `chicken_meal`, `mutton_meal`, `beef_meal`, `dairy`
  - **`electricity`**: Types: `electricity_usage`
  - **`shopping`**: Types: `clothing`, `electronics`, `general_purchase`
  
  *Validation Rules*:
  - `quantity` must be greater than or equal to `0`.
  - `activity_type` must be valid for the chosen `category`.
  - The corresponding emission factor must be active in the system database.
* **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "ac68a0a7-332d-450f-bf01-8027a00ef9ab",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "category": "transport",
      "activity_type": "metro",
      "quantity": "12.5",
      "unit": "km",
      "metadata": {
        "route": "Yellow Line",
        "confidence_score": 0.95
      },
      "created_at": "2026-06-12T00:50:00Z"
    },
    "message": "Activity logged successfully"
  }
  ```

#### List Activities
Returns a list of logged activities matching filter criteria. Supports pagination.
* **Endpoint**: `GET /api/v1/activities`
* **Query Parameters**:
  - `category` (Optional): Filter by activity category.
  - `activity_type` (Optional): Filter by activity type.
  - `start_date` (Optional): Filter by creation date range start (`YYYY-MM-DDThh:mm:ss` format).
  - `end_date` (Optional): Filter by creation date range end (`YYYY-MM-DDThh:mm:ss` format).
  - `page` (Optional): Page number, default `1` (minimum `1`).
  - `page_size` (Optional): Items per page, default `20` (minimum `1`, maximum `100`).
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ac68a0a7-332d-450f-bf01-8027a00ef9ab",
        "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
        "category": "transport",
        "activity_type": "metro",
        "quantity": "12.5",
        "unit": "km",
        "metadata": {
          "route": "Yellow Line",
          "confidence_score": 0.95
        },
        "created_at": "2026-06-12T00:50:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 1,
      "total_pages": 1
    },
    "message": "Activities retrieved successfully"
  }
  ```

#### Get Activities History
An alias of the list activities endpoint; accepts the exact same query parameters, validation rules, and response structure.
* **Endpoint**: `GET /api/v1/activities/history`
* **Response `200 OK`**: Same as `GET /api/v1/activities`.

#### Get Activity Details
Retrieves details of a specific logged activity. Returns `404` if the activity is not owned by the authenticated user.
* **Endpoint**: `GET /api/v1/activities/{id}`
* **Path Parameters**:
  - `id` (Required): The UUID of the activity event.
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "ac68a0a7-332d-450f-bf01-8027a00ef9ab",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "category": "transport",
      "activity_type": "metro",
      "quantity": "12.5",
      "unit": "km",
      "metadata": {
        "route": "Yellow Line",
        "confidence_score": 0.95
      },
      "created_at": "2026-06-12T00:50:00Z"
    },
    "message": "Activity details retrieved successfully"
  }
  ```

---

### 2.4 Carbon Footprints
Retrieve calculated carbon totals. Integrates plain-key and `_co2` suffixed key structures for backward-compatibility.

#### Get Today's Footprint
Retrieves carbon emissions totals for the current UTC date. If no activities are logged for today, all emissions fields will be returned as `0.0`.
* **Endpoint**: `GET /api/v1/footprints/today`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "transport": 2.4,
      "food": 1.5,
      "electricity": 0.0,
      "shopping": 0.0,
      "total": 3.9,
      "transport_co2": 2.4,
      "food_co2": 1.5,
      "electricity_co2": 0.0,
      "shopping_co2": 0.0,
      "total_co2": 3.9
    },
    "message": "Today's footprint retrieved successfully"
  }
  ```

#### Get Weekly Footprint
Retrieves the rolling weekly carbon footprint totals (last 7 days inclusive of today).
* **Endpoint**: `GET /api/v1/footprints/weekly`
* **Response `200 OK`**: Same JSON structure as `GET /api/v1/footprints/today`.

#### Get Monthly Footprint
Retrieves the rolling monthly carbon footprint totals (last 30 days inclusive of today).
* **Endpoint**: `GET /api/v1/footprints/monthly`
* **Response `200 OK`**: Same JSON structure as `GET /api/v1/footprints/today`.

#### Get All-Time Breakdown
Retrieves all-time cumulative carbon footprint totals by category.
* **Endpoint**: `GET /api/v1/footprints/breakdown`
* **Response `200 OK`**: Same JSON structure as `GET /api/v1/footprints/today`.

#### Get Specific Date Footprint
Retrieves totals for a target date.
* **Endpoint**: `GET /api/v1/footprints/{target_date}`
* **Path Parameters**:
  - `target_date` (Required): Date string in `YYYY-MM-DD` format.
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "transport": 0.0,
      "food": 1.5,
      "electricity": 0.0,
      "shopping": 0.0,
      "total": 1.5,
      "transport_co2": 0.0,
      "food_co2": 1.5,
      "electricity_co2": 0.0,
      "shopping_co2": 0.0,
      "total_co2": 1.5
    },
    "message": "Footprint for 2026-06-12 retrieved successfully"
  }
  ```
* **Response `400 Bad Request`**: Returned if the date format is malformed or invalid.

---

### 2.5 Daily Missions
Missions assign daily actionable tasks to users to promote carbon-reduction actions.

#### Get Today's Daily Mission
Retrieves the daily mission assigned for today. If none exists, a personalized mission is automatically selected and assigned using the user preferences and templates.
* **Endpoint**: `GET /api/v1/missions/today`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "d1a00a73-9a3d-4c33-bcf0-8027a00ef9ab",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "mission_template_id": "f5f00e73-b3c8-4a9f-acf0-8027a00ef901",
      "assigned_date": "2026-06-12",
      "status": "assigned",
      "completed_at": null,
      "created_at": "2026-06-12T00:52:00Z",
      "title": "Eat one vegetarian meal",
      "category": "food",
      "difficulty": "easy",
      "estimated_co2_saving": 1.5,
      "estimated_time_minutes": 30
    },
    "message": "Today's daily mission retrieved successfully"
  }
  ```

#### Get Recommended Mission (Preview)
Previews a personalized recommended mission template based on user profiles without committing an assignment to the database.
* **Endpoint**: `GET /api/v1/missions/recommended`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "title": "Eat one vegetarian meal",
      "category": "food",
      "difficulty": "easy",
      "estimated_co2_saving": 1.5,
      "estimated_time_minutes": 30
    },
    "message": "Recommended mission retrieved successfully"
  }
  ```

#### List Missions History
Retrieves historical logs of assigned user missions with pagination.
* **Endpoint**: `GET /api/v1/missions/history`
* **Query Parameters**:
  - `page` (Optional): Page number, default `1`.
  - `page_size` (Optional): Items per page, default `20` (max `100`).
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "d1a00a73-9a3d-4c33-bcf0-8027a00ef9ab",
        "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
        "mission_template_id": "f5f00e73-b3c8-4a9f-acf0-8027a00ef901",
        "assigned_date": "2026-06-12",
        "status": "completed",
        "completed_at": "2026-06-12T00:54:10Z",
        "created_at": "2026-06-12T00:52:00Z",
        "title": "Eat one vegetarian meal",
        "category": "food",
        "difficulty": "easy",
        "estimated_co2_saving": 1.5,
        "estimated_time_minutes": 30
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 1,
      "total_pages": 1
    },
    "message": "Missions retrieved successfully"
  }
  ```

#### Complete a Mission
Marks an assigned mission as completed. Doing so checks and triggers streak extensions if completed on time.
* **Endpoint**: `POST /api/v1/missions/{id}/complete`
* **Path Parameters**:
  - `id` (Required): The UUID of the user mission (not template ID).
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "d1a00a73-9a3d-4c33-bcf0-8027a00ef9ab",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "mission_template_id": "f5f00e73-b3c8-4a9f-acf0-8027a00ef901",
      "assigned_date": "2026-06-12",
      "status": "completed",
      "completed_at": "2026-06-12T01:05:00Z",
      "created_at": "2026-06-12T00:52:00Z",
      "title": "Eat one vegetarian meal",
      "category": "food",
      "difficulty": "easy",
      "estimated_co2_saving": 1.5,
      "estimated_time_minutes": 30
    },
    "message": "Mission processed successfully"
  }
  ```
* **Response `400 Bad Request`**: Returned if the mission is already completed.
* **Response `404 Not Found`**: Returned if the mission is not found or belongs to another user.

---

### 2.6 Streaks & Retention
Tracks user daily activity logging consistency and handles streak freezes.

#### Get Current Streak
Returns details of the user's active streak. This endpoint triggers "lazy self-healing" evaluation: if a user missed logging on the previous day but has streak freezes available, a freeze is consumed to preserve the streak.
* **Endpoint**: `GET /api/v1/streaks/current`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "current_streak": 6,
      "longest_streak": 12,
      "freeze_count": 1
    },
    "message": "Streak data processed successfully"
  }
  ```

#### List Streak Events History
Retrieves a paginated list of user streak transitions (events like `streak_started`, `streak_extended`, `streak_frozen`, `streak_broken`, etc.).
* **Endpoint**: `GET /api/v1/streaks/history`
* **Query Parameters**:
  - `page` (Optional): Page number, default `1`.
  - `page_size` (Optional): Items per page, default `20` (max `100`).
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e0d00f73-a3d8-4c9f-bcf0-8027a00ef90a",
        "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
        "event_type": "streak_extended",
        "previous_streak": 5,
        "new_streak": 6,
        "created_at": "2026-06-12T01:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total_items": 1,
      "total_pages": 1
    },
    "message": "Streak history retrieved successfully"
  }
  ```

#### Manually Use Streak Freeze
Manually consumes a streak freeze to protect a missed day or maintain streak status.
* **Endpoint**: `POST /api/v1/streaks/use-freeze`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "current_streak": 6,
      "longest_streak": 12,
      "freeze_count": 0
    },
    "message": "Streak freeze applied successfully"
  }
  ```
* **Response `400 Bad Request`**: Returned if the user has `0` freezes available or does not have an active streak to freeze.

#### Get Global Streak Statistics
Retrieves global aggregate statistics representing platform-wide user retention and streak patterns.
* **Endpoint**: `GET /api/v1/streaks/stats`
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "active_streaks": 1520,
      "average_streak_length": 5.4,
      "longest_streak": 45,
      "freezes_used": 348
    },
    "message": "Streak stats retrieved successfully"
  }
  ```
