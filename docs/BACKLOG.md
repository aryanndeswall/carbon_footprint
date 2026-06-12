# Product Backlog: Sprints 6–10

This document defines the complete product backlog, user stories, technical tasks, acceptance criteria, dependencies, and estimations (story points) for Sprints 6 through 10 of the Carbon Footprint Awareness Platform.

---

## Sprint 6: Gemini Integration (AI Foundation)

* **Epic**: AI-Powered Environmental Coaching Foundation
* **Goal**: Provide users with personalized, context-aware daily coaching summaries and weekly reports.
* **Story Points**: 13 SP (Total)

### User Story: Daily Personalized Coaching
> **As a** logged-in user,
> **I want** to receive a daily personalized coaching tip based on my recent carbon footprints and preferences,
> **So that** I know exactly how to reduce my emissions.
* **Story Points**: 5 SP
* **Technical Tasks**:
  1. Set up the `google-genai` Python client wrapper service (`GeminiClient`).
  2. Implement `PromptBuilder` to compile system prompts and inject PostgreSQL user profiles and footprint totals.
  3. Create `OutputValidator` to parse and validate Gemini's JSON responses against a Pydantic schema.
  4. Write the `ai_insights` database model and repository.
  5. Expose the API endpoints: `GET /api/v1/ai/insights/latest` and `POST /api/v1/ai/insights/generate`.
* **Acceptance Criteria**:
  * Given a user with carbon footprints logged today, when they call `GET /api/v1/ai/insights/latest?type=daily_coaching`, they receive a structured JSON response containing `headline`, `body`, `actionable_tip`, and `focus_category`.
  * Given an unreachable Gemini API, when a tip is requested, the system falls back to a locally cached database summary or a static text template.
* **Dependencies**: Sprint 5 Database schema fully migrated.

### User Story: Weekly Footprint Summaries
> **As a** user,
> **I want** to receive a weekly report summarizing my carbon progress and streak status,
> **So that** I can track my habit-formation trends.
* **Story Points**: 8 SP
* **Technical Tasks**:
  1. Expand `PromptBuilder` to ingest weekly activity aggregates and streak histories.
  2. Add Pydantic validation schemas for the weekly summary payload (including categories saved, highlights array, and goals).
  3. Set up a Celery task `generate_weekly_insights` to run asynchronously.
  4. Implement Redis cache locks to prevent duplicate weekly generation runs.
* **Acceptance Criteria**:
  * Given a request to generate a weekly report, when the Celery task executes, it calls Gemini with the user's weekly carbon totals, validates the JSON output, caches the result in the `ai_insights` table, and updates the client.
* **Dependencies**: Celery & Redis worker pool configured.

---

## Sprint 7: pgvector Integration (Vector Memory Layer)

* **Epic**: AI Long-Term Memory Retrieval
* **Goal**: Enhance AI coaching personalization by semantically retrieving previous behavior patterns, mission completions, and preferences.
* **Story Points**: 8 SP (Total)

### User Story: Personalized Memory Retrieval
> **As a** user,
> **As a** user talking to the AI Coach,
> **I want** the coach to remember my past completed missions and preferences,
> **So that** its advice remains contextually consistent.
* **Story Points**: 8 SP
* **Technical Tasks**:
  1. Add `pgvector` extension enablement to Alembic migrations.
  2. Create the `ai_memory_embeddings` table schema with a vector column (size: `768` for Gemini embeddings).
  3. Write the `MemoryRetrievalService` handling semantic vector searches using Cosine Distance (`<=>`).
  4. Create an event listener that triggers embedding generation for newly completed missions or updated preferences, writing to the vector index.
  5. Update the `PromptBuilder` in the AI Service to retrieve the top 3 semantically relevant memory blocks and inject them into the LLM context.
* **Acceptance Criteria**:
  * Given a user who completed a "Vegetarian Lunch" mission last week, when they request coaching, the retrieved context includes the vector record of the vegetarian completion, and the coach references this history.
  * Given an empty vector database, the query returns empty lists and falls back safely without raising execution errors.
* **Dependencies**: Sprint 6 Gemini integration complete, PostgreSQL instance updated with pgvector extension.

---

## Sprint 8: Groups & Challenges (Community Layer)

* **Epic**: Social Engagement & Accountability
* **Goal**: Enable users to participate in community challenges, compare carbon savings on leaderboards, and join sustainability groups.
* **Story Points**: 21 SP (Total)

### User Story: Join & Interact in Groups
> **As a** user,
> **I want** to create or join a sustainability group,
> **So that** I can share my green journey with my friends or coworkers.
* **Story Points**: 8 SP
* **Technical Tasks**:
  1. Design database schemas for `groups` and `group_members` tables.
  2. Write models, repositories, and migration scripts.
  3. Implement API endpoints:
     * `POST /api/v1/groups` (Create Group)
     * `POST /api/v1/groups/{id}/join` (Join Group)
     * `GET /api/v1/groups/{id}` (Get Group Details & Member Count)
* **Acceptance Criteria**:
  * Given an authenticated user, when they submit a group name, the group is created and they are registered as the group owner in `group_members`.
  * Given a user trying to join an already joined group, the request returns a `400 Bad Request` conflict.
* **Dependencies**: Sprint 1 user authentication.

### User Story: Community Challenges & Leaderboards
> **As a** competitive user,
> **I want** to join time-bounded carbon-saving challenges and view my ranking on a leaderboard,
> **So that** I am motivated to keep logging activities.
* **Story Points**: 13 SP
* **Technical Tasks**:
  1. Create database schemas for `challenges` and `challenge_participants` tables.
  2. Build a leaderboard calculation service using database window functions (`DENSE_RANK()`) to compute member rankings based on CO₂ savings.
  3. Implement API endpoints:
     * `GET /api/v1/challenges` (List Active Challenges)
     * `POST /api/v1/challenges/{id}/join` (Join Challenge)
     * `GET /api/v1/challenges/{id}/leaderboard` (Get ranked list of participants)
  4. Cache leaderboard responses in Redis with a 15-minute expiration window to optimize database queries.
* **Acceptance Criteria**:
  * Given active participants in a challenge, when `GET /api/v1/challenges/{id}/leaderboard` is called, it returns a sorted array of users ranked by cumulative CO₂ savings during the challenge date window.
* **Dependencies**: Carbon Engine aggregate tables from Sprint 3.

---

## Sprint 9: OCR Receipt & Bill Ingestion (Automation Layer)

* **Epic**: Ingestion Automation & Friction Reduction
* **Goal**: Allow users to upload photos of utility bills and grocery receipts to automatically log activities via AI parsing.
* **Story Points**: 21 SP (Total)

### User Story: Image Uploads to AWS S3
> **As a** user,
> **I want** to upload receipts and bills directly from my camera,
> **So that** I don't have to input numbers manually.
* **Story Points**: 8 SP
* **Technical Tasks**:
  1. Configure AWS S3 bucket policies and setup `boto3` integration in the Python backend.
  2. Design the `uploads` table schema to store file URLs, content types, and processing status.
  3. Create an endpoint `POST /api/v1/uploads` accepting `multipart/form-data`.
  4. Implement file validation (allowing only JPEG, PNG, and PDF, with a maximum file size of 10MB).
* **Acceptance Criteria**:
  * Given a valid receipt image, when uploaded to `POST /api/v1/uploads`, it returns `201 Created` with the S3 file URL, and the status is set to `uploaded`.
* **Dependencies**: AWS S3 credentials set up in environment settings.

### User Story: AI OCR Processing
> **As a** user,
> **I want** the uploaded utility bill to be parsed automatically by the AI,
> **So that** the electricity activity is logged without manual inputs.
* **Story Points**: 13 SP
* **Technical Tasks**:
  1. Implement a Celery background task `process_upload_ocr` that runs asynchronously.
  2. Integrate Gemini multimodal vision capabilities to extract utility consumption values (e.g. `kWh` from bills, transit modes from boarding passes).
  3. Create a parser that maps extracted values to the deterministic `CreateActivityRequest` structure.
  4. Trigger the Activity Logging service asynchronously upon successful OCR validation.
* **Acceptance Criteria**:
  * Given an uploaded PDF utility bill, when the Celery task completes processing, the status of the upload record is updated to `completed`, and a new `electricity_usage` activity is automatically logged to the user's event history.
* **Dependencies**: AWS S3 uploading, Celery workers configured, Gemini multimodal client enabled.

---

## Sprint 10: Engagement & Notifications (Retention Layer)

* **Epic**: Engagement & Notification Layer
* **Goal**: Keep users actively returning to protect streaks and complete daily actions via push and in-app notifications.
* **Story Points**: 13 SP (Total)

### User Story: Streak Alerts & Reminders
> **As a** forgetful user,
> **I want** to receive a push notification reminder when my streak is in danger,
> **So that** I remember to log an activity or use a freeze.
* **Story Points**: 8 SP
* **Technical Tasks**:
  1. Integrate an Expo Push Notification token repository in the backend.
  2. Expose endpoint `POST /api/v1/users/push-tokens` to save client push tokens.
  3. Write a Celery Beat cron job `check_streak_dangers` that runs daily at 8:00 PM local time.
  4. Identify users who have not logged any activity today and trigger a push message payload if their streak is active.
* **Acceptance Criteria**:
  * Given a user with a 6-day streak who has not logged any activities by 8:00 PM, when the cron job runs, they receive a push notification reminding them to log an activity.
* **Dependencies**: Streak tables from Sprint 5, Expo Push server credentials.

### User Story: In-App Notification Center
> **As a** user,
> **I want** an in-app notification center to view alerts about completed missions, group invites, and challenge rankings,
> **So that** I stay updated on my community progress.
* **Story Points**: 5 SP
* **Technical Tasks**:
  1. Design the `notifications` database schema (columns: `id`, `user_id`, `title`, `body`, `is_read`, `created_at`).
  2. Implement backend endpoints:
     * `GET /api/v1/notifications` (Fetch user notifications)
     * `PATCH /api/v1/notifications/{id}/read` (Mark specific notification as read)
  3. Write service events that insert notification rows when challenges end or missions complete.
* **Acceptance Criteria**:
  * Given notifications in the database, when the user calls `GET /api/v1/notifications`, it returns an array of alerts, and calling the read endpoint updates the `is_read` flag.
* **Dependencies**: Basic User endpoints.
