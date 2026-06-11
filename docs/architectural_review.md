# Principal Architect Review: Carbon Footprint Awareness Platform (Sprints 1–5)

This document provides a comprehensive review of the current implementation, codebase architecture, and system documentation. It highlights architectural weaknesses, security concerns, database issues, scalability bottlenecks, missing features, and competitive risks, accompanied by prioritized, actionable recommendations.

---

## 1. Architectural Weaknesses

### 1.1 Synchronous Downstream Processing on Activity Logging
* **Issue**: When a user logs an activity (`POST /api/v1/activities`), the backend synchronously resolves the emission factor, computes the carbon footprint, updates or creates the `DailyFootprint` record, writes the `DailyFootprintSource` junction audit trail, and runs the streak evaluation (`evaluate_and_update_streak`).
* **Impact**: If any step in the carbon calculations or streak evaluation fails or database locking occurs, the HTTP request fails. This synchronous coupling increases request latency, raises transaction contention, and wastes API thread resources on compute/write heavy operations.
* **Recommendation**: Decouple the transactional ingestion of the activity from its downstream aggregation. The activity ingestion endpoint should quickly persist the immutable `ActivityEvent` to the database and return `201 Created` with a task ID. Offload footprint aggregation, carbon calculations, and streak updates to asynchronous background workers using **Celery & Redis**.

### 1.2 Fragile Package Path Modification (`sys.path`)
* **Issue**: The backend routes and services import packages from the shared `packages/carbon-core` module by dynamically modifying the system path relative to files:
  ```python
  packages_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../packages/carbon-core"))
  if packages_path not in sys.path:
      sys.path.insert(0, packages_path)
  ```
* **Impact**: Relative path adjustments are fragile and dependent on directory layout. If files are relocated, run from alternative working directories, or packaged into containers, imports will break.
* **Recommendation**: Package `carbon-core` as a standard editable python package (e.g., using Poetry's workspace dependencies or editable pip installs `pip install -e packages/carbon-core`) so it can be cleanly imported via standard Python pathing without dynamic path mutation.

### 1.3 startup Event Seeding Concurrency
* **Issue**: In [main.py](file:///d:/carbon_footprint/services/api/app/main.py#L28-L35), `seed_emission_factors` and `seed_mission_templates` are executed on the FastAPI `startup` lifecycle event.
* **Impact**: If running in a production container environment with multiple concurrent worker processes (e.g., Uvicorn/Gunicorn with multiple workers), these seed operations will run concurrently. This can lead to race conditions, database connection spikes, or primary key violations if seeds are not strictly idempotent.
* **Recommendation**: Extract seeding logic from the app startup sequence. Execute seeding as a separate step in the deployment pipeline (e.g., post-migration script or a CLI command run once per deploy).

---

## 2. Security Concerns

### 2.1 Production Bypass Risk in JWT Signature Validation
* **Issue**: In [jwt_auth.py](file:///d:/carbon_footprint/services/api/app/middleware/jwt_auth.py#L64-L76), signature validation is completely bypassed if the `SUPABASE_JWT_SECRET` setting is missing or uses placeholder strings:
  ```python
  else:
      # Development mode signature-less decoding with expiration check
      payload = jwt.decode(token, options={"verify_signature": False}, ...)
  ```
* **Impact**: If a configuration error occurs in production (e.g., environmental secret fails to load), the middleware will silently fallback to signature-less decoding. An attacker could forge a token with any user ID and bypass authentication.
* **Recommendation**: Enforce signature checks strictly in production. The system should throw a hard configuration error on startup if `ENV == "production"` and JWT keys/secrets are invalid. Disable signature-less decoding options entirely in the production build.

### 2.2 Row Level Security (RLS) Application-Bypass
* **Issue**: The platform's security specification defines PostgreSQL Row Level Security (RLS) as mandatory. However, the Python ORM layer connects to the database as a highly privileged service role that bypasses RLS policies, relying entirely on manual `user_id` filters in ORM queries.
* **Impact**: Human error in repository code (e.g., forgetting a `.filter(user_id == ...)` clause) will lead to data leaking vulnerability where users can retrieve or modify other users' activities/footprints.
* **Recommendation**: Configure the database connection pool to authenticate as a restricted application role, or execute a `SET LOCAL app.current_user_id = :user_id` statement within the transaction context of every request. Establish PostgreSQL RLS policies that enforce checks using this session variable.

### 2.3 Unvalidated Metadata Payloads
* **Issue**: The `metadata` field in `CreateActivityRequest` is a free-form JSON dictionary (`Dict[str, Any]`) stored directly in the `activity_events` database table as `JSONB`.
* **Impact**: Malicious users could send massive payloads to exhaust storage, or inject malicious scripts into metadata fields that trigger Cross-Site Scripting (XSS) when displayed in the frontend dashboard.
* **Recommendation**: Implement strict schema constraints and size limits (e.g., max 2KB) on the Pydantic model for metadata payloads. Sanitize string inputs to strip HTML and script tags.

---

## 3. Database Issues

### 3.1 Composite Key Race Condition in Daily Footprints
* **Issue**: In `FootprintAggregator.get_or_create_daily_footprint`, the service performs a `SELECT` query to check if a record exists for a `user_id` and `date`, and performs an `INSERT` if not found.
* **Impact**: In a multi-threaded or concurrent API context where a user logs multiple activities quickly, two processes will concurrently evaluate `not footprint` and attempt to insert. This will fail with a `UniqueViolation` database exception, crashing the API request.
* **Recommendation**: Define a composite unique constraint `UNIQUE(user_id, date)` on the `daily_footprints` table and utilize PostgreSQL's `ON CONFLICT (user_id, date) DO UPDATE` (upsert) to handle concurrent activity ingestion seamlessly.

### 3.2 Precision Drift in Footprint Aggregates
* **Issue**: Calculations are done using Python's `Decimal` types with high scale, but `DailyFootprint` columns (`transport_emissions`, `food_emissions`, etc.) are declared as `NUMERIC(12, 4)` or float-equivalent floats on return.
* **Impact**: Accumulating small emission increments over a day will cause precision loss (underflow) when rounded to 4 decimal places, leading to discrepancies between the sum of individual activities and the daily footprint aggregate.
* **Recommendation**: Increase database column scale for emissions values to `NUMERIC(18, 6)` or `NUMERIC(20, 8)` to retain precision during high-frequency micro-additions.

### 3.3 Indexing Gaps on Junction Tables
* **Issue**: The `daily_footprint_sources` junction table maps footprint records to activity events and emission factors. There are no explicit indexes on the individual foreign key fields (`activity_id`, `emission_factor_id`).
* **Impact**: As data grows, auditing calculations, reconstructing aggregates, or querying activities affected by a specific emission factor version will trigger costly sequential table scans, degrading database performance.
* **Recommendation**: Add indexes on:
  * `daily_footprint_sources(activity_id)`
  * `daily_footprint_sources(emission_factor_id)`
  * `daily_footprint_sources(daily_footprint_id)`

---

## 4. Scalability Bottlenecks

### 4.1 State Mutation inside `GET` Request (Streak Lazy Evaluation)
* **Issue**: Calling `GET /api/v1/streaks/current` executes `get_or_create_streak`, which lazily evaluates missed logging days, automatically consumes streak freezes, and writes events/updates to the database.
* **Impact**: This violates HTTP method safety guidelines (`GET` should not mutate state). It makes the endpoint prone to write-lock conflicts if accessed concurrently (e.g., from multiple frontend panels loading profiles) and prevents API caching.
* **Recommendation**: Relocate streak updates and lazy-healing checks to:
  * Event handlers that trigger only on mutation (activity logging, mission completion).
  * A nightly background Cron/Celery-Beat task that sweeps inactive users and applies freezes.
  Keep `GET /streaks/current` strictly read-only.

### 4.2 High-Frequency Database Writes on Activities Ingestion
* **Issue**: The current modular monolith architecture does not batch writes. Every logged activity triggers immediate and synchronous database writes to three separate tables (`activity_events`, `daily_footprints`, `daily_footprint_sources`).
* **Impact**: This creates write-iops bottlenecks under high user concurrency.
* **Recommendation**: Implement write-buffering or write-coalescing. Log activities to an append-only stream or cache, and batch-process footprints calculations/aggregates periodically (e.g., every 60 seconds) or asynchronously.

---

## 5. Missing Features

### 5.1 Factor Sunsetting Logic
* **Issue**: Although `EmissionFactor` has an `effective_from` field, it lacks a `valid_to` or `is_active` status flag. 
* **Impact**: Deprecating or updating a factor version requires inserting newer versions, but there is no mechanism to invalidate a factor for a specific historical range without complex datetime checks.
* **Recommendation**: Add a `valid_to` datetime column to the `emission_factors` table. Update `FactorResolver` to only retrieve factors where `at_time` falls between `effective_from` and `valid_to`.

### 5.2 Activity Correction & Archive Flags
* **Issue**: Activities are strictly immutable. If a correction is needed, a new activity is logged, but the old activity cannot be marked as archived or corrected in the API.
* **Impact**: Footprint totals will remain inflated unless manual database operations are performed.
* **Recommendation**: Add an `is_archived` (boolean) column to `activity_events`. Implement a deletion/archival service that sets this flag to `True` and triggers an asynchronous recalculation of the daily footprint aggregates for that activity's date.

---

## 6. Competitive Risks

### 6.1 Manual Logging Friction
* **Risk**: High user churn is common in sustainability platforms due to the friction of manually logging every meal, transit, and purchase. Competitors integrate automatic data ingestion (e.g., sync credit card transactions via Plaid, connect Google Fit/Apple Health for transit, and automatically scrape electricity utility bills).
* **Recommendation**: Prioritize the implementation of automatic integrations:
  * Health kit API sync for transport tracking (distance/modes).
  * OCR/AI bill readers (Sprint 6/OCR engine) to process utility statements automatically.

### 6.2 Lack of Offline-First Synchronization
* **Risk**: Users frequently track transit and travel on the go where cellular connectivity is intermittent. A completely server-bound architecture prevents logging activities offline, causing loss of user engagement.
* **Recommendation**: Implement an offline-first sync mechanism. Cache emission templates on the mobile client (SQLite/WatermelonDB) to allow offline activity logging. Queue events locally and sync them back to the backend once connectivity is restored.

---

## 7. Actionable Priority Roadmap

| Priority | Category | Concern | Actionable Recommendation |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | **Security** | Signature bypass on JWT validation | Remove signature-less decoding option in production configurations. |
| **P0 (Critical)** | **Database** | Unique constraint race conditions | Add `UNIQUE(user_id, date)` constraint and convert footprint insertions to PostgreSQL upserts. |
| **P1 (High)** | **Architecture** | Synchronous downstream writes | Decouple activity ingestion from calculations and streak updates using Celery background tasks. |
| **P1 (High)** | **Scalability** | State mutation on `GET` | Make `GET /streaks/current` read-only; offload lazy evaluations to background workers or mutations. |
| **P2 (Medium)** | **Database** | Missing indexes on junction tables | Create database indexes on foreign keys of `daily_footprint_sources`. |
| **P2 (Medium)** | **Product** | Missing factor sunsetting | Add `valid_to` column to `emission_factors` and update `FactorResolver` logic. |
| **P3 (Low)** | **Product** | Logging friction & offline sync | Introduce Plaid/Health APIs, automated OCR bill processing, and client-side SQLite sync queue. |
