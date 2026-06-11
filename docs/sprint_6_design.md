# Sprint 6 Detailed Design Specification: Gemini Integration & AI Coaching Foundation

This document defines the complete technical design and architecture for Sprint 6 (AI Foundation & Gemini Integration) of the Carbon Footprint Awareness Platform.

---

## 1. Objectives & Success Criteria

### Objectives
* Integrate the **Gemini 2.5 Flash** API as the core AI service.
* Establish a structured, deterministic prompt construction architecture that pulls context safely from PostgreSQL.
* Implement a robust, schema-enforced output validation layer.
* Set up caching and rate-limiting structures to optimize LLM call latency and token costs.
* Expose endpoints to fetch the latest personalized coaching insights and trigger summaries.

### Success Criteria
* Users receive context-aware, personalized daily coaching messages and weekly summaries.
* Every AI response is validated against a strict JSON schema before persistence or delivery.
* System remains 100% functional (with fallback templates) if the Gemini API is offline or returns invalid schemas.

---

## 2. Architecture & Service Layer

The AI module is implemented as a new service domain in the modular monolith. It consists of the following components:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              AI SERVICE                                │
│                                                                        │
│  ┌───────────────┐     ┌───────────────┐      ┌─────────────────────┐  │
│  │   API Layer   │ ──> │  AI Service   │ ──>  │   Prompt Builder    │  │
│  └───────────────┘     └───────┬───────┘      └─────────────────────┘  │
│                                │                                       │
│                                ▼                                       │
│                        ┌───────────────┐      ┌─────────────────────┐  │
│                        │ Gemini Client │ ──>  │ Google GenAI SDK    │  │
│                        └───────┬───────┘      └─────────────────────┘  │
│                                │                                       │
│                                ▼                                       │
│                        ┌───────────────┐                              │
│                        │   Validator   │                              │
│                        └───────┬───────┘                              │
│                                │ (If Valid)                            │
│                                ▼                                       │
│                        ┌───────────────┐                              │
│                        │  PostgreSQL   │ (Cache & Audit Trail)         │
│                        └───────────────┘                              │
└────────────────────────────────────────────────────────────────────────┘
```

### Components
1. **`GeminiClient`** (`services/api/app/services/ai/client.py`):
   A low-level wrapper around the official Google GenAI SDK. Handles API request timeouts, connection pooling, retries, and API key management.
2. **`PromptBuilder`** (`services/api/app/services/ai/prompts.py`):
   Formats system and user prompt strings. Dynamically injects structured user profile preferences, footprint summaries, and streak metadata into standard templates.
3. **`OutputValidator`** (`services/api/app/services/ai/validator.py`):
   Parses raw JSON strings returned by the LLM and validates them against target Pydantic models. Flags safety issues or environmental claims inconsistency.
4. **`AIService`** (`services/api/app/services/ai/service.py`):
   The central orchestrator. Resolves cached database insights, requests data aggregates, invokes prompt builders, runs the client call, triggers validation, and persists results.

---

## 3. Database Schema Changes

A new table, `ai_insights`, will cache generated insights to prevent redundant API consumption.

### Table: `ai_insights`

```sql
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    insight_type VARCHAR(50) NOT NULL, -- 'daily_coaching', 'weekly_summary'
    content JSONB NOT NULL,            -- Structured payload containing summaries & recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for fast retrieval of latest insights
CREATE INDEX idx_ai_insights_user_created ON ai_insights(user_id, created_at DESC);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
```

---

## 4. Prompt Architecture & Gemini Integration Strategy

### Model Selection
* **Model**: `gemini-2.5-flash`
* **Rationale**: Extreme low latency, low token cost, native JSON output capabilities, and safety guardrails.

### Prompt Builder Context Payload
Prompts must inject structured user context as key-value JSON parameters to prevent fuzzy context mixing. The dynamic context payload injected into the prompt includes:
```json
{
  "user_profile": {
    "diet_type": "vegetarian",
    "transport_preference": "metro",
    "state_code": "DL"
  },
  "footprint_aggregates": {
    "today": {
      "transport": 1.92,
      "food": 1.5,
      "total": 3.42
    },
    "weekly_total": {
      "transport": 14.5,
      "food": 10.5,
      "total": 25.0
    }
  },
  "streak_details": {
    "current_streak": 6,
    "longest_streak": 12
  },
  "recent_missions": [
    {
      "title": "Use public transport",
      "status": "completed",
      "completed_at": "2026-06-11T12:00:00Z"
    }
  ]
}
```

### Prompt Definitions

#### A. Daily Coaching Prompt
* **System Instructions**:
  ```text
  You are Carbon Sense Coach, a highly professional environmental advisor.
  Your goal is to provide encouraging, context-aware carbon footprint insights and one actionable daily tip.
  You MUST return your output in JSON matching the specified schema.
  CRITICAL RULES:
  - Do NOT calculate carbon values. Use only the provided totals.
  - Do NOT make scientific assertions unsupported by the user data.
  - Keep recommendations specific and realistic.
  ```
* **Expected Output JSON Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "headline": { "type": "string" },
      "body": { "type": "string" },
      "actionable_tip": { "type": "string" },
      "focus_category": { "type": "string", "enum": ["transport", "food", "electricity", "shopping"] }
    },
    "required": ["headline", "body", "actionable_tip", "focus_category"]
  }
  ```

#### B. Weekly Summary Prompt
* **System Instructions**:
  ```text
  You are Carbon Sense Auditor. Summarize the user's weekly footprint and contrast it with previous aggregates.
  Acknowledge streak completions and completed missions.
  You MUST return your output in JSON matching the specified schema.
  CRITICAL RULES:
  - Never fabricate numbers. Contrast raw data values directly.
  - Focus on highlighting carbon savings and progress.
  ```
* **Expected Output JSON Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "summary_text": { "type": "string" },
      "total_saved_co2": { "type": "number" },
      "highlights": {
        "type": "array",
        "items": { "type": "string" }
      },
      "next_week_goals": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["summary_text", "total_saved_co2", "highlights", "next_week_goals"]
  }
  ```

---

## 5. Output Validation & Fallback Layer

```text
               ┌───────────────────────┐
               │  Gemini API Response  │
               └───────────┬───────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │    Parse JSON String  │
               └───────────┬───────────┘
                           │
                 (Success) ├──(Fails)───┐
                           ▼            ▼
               ┌───────────────────────┐ ┌────────────────────────┐
               │   Validate Pydantic   │ │ Log Warning & Retry   │
               └───────────┬───────────┘ └───────────┬────────────┘
                           │                         │
                 (Valid)  ├──(Invalid)─┐            │
                           ▼            ▼            ▼
               ┌───────────────────────┐ ┌────────────────────────┐
               │   Persist to DB &     │ │ Apply Default Static   │
               │   Return to Client    │ │ Template Fallback     │
               └───────────────────────┘ └────────────────────────┘
```

### Output Validation Pipeline
1. **Format Validation**: Ensure the returned string is valid JSON.
2. **Schema Enforce**: Pass parsed JSON to Pydantic models matching output schemas.
3. **Safety Check**: Check for blacklisted words or forbidden commands (guard against prompt injection).

### LLM Error Recovery & Fallback Strategies
* **Retry Loop**: If validation fails, trigger one retry with explicit validation error feedback appended to the prompt.
* **Database Fallback**: If the retry fails or the API is unreachable, fetch the most recently cached insight of the same type.
* **Static Fallback**: If no cached insight exists, compile a static template based on the user's preferences:
  ```json
  {
    "headline": "Keep Up the Clean Travel!",
    "body": "Your preference for metro transit is a great way to limit daily emissions. Try walking for trips under 1 km today.",
    "actionable_tip": "Avoid idling vehicle engines in traffic today.",
    "focus_category": "transport"
  }
  ```

---

## 6. Testing Strategy

### Unit Tests
* **Prompt Builder Tests**: Verify that dynamic variables are properly structured and injected.
* **Validation Layer Tests**:
  * Assert that valid JSON matching the Pydantic schema passes validation.
  * Assert that malformed JSON or JSON with missing fields raises a validation error.
  * Test validation constraints against negative numbers in savings or invalid categories.

### Integration Tests
* **Mock Gemini Client**:
  Create a pytest fixture that intercepts HTTP requests to the Gemini API endpoint (`https://generativelanguage.googleapis.com/...`) and returns preset JSON mock payloads.
* **Endpoint Assertions**:
  * **`GET /api/v1/ai/insights/latest?type=daily_coaching`**:
    Assert that it returns `200 OK` and reads cached values from the database.
  * **`POST /api/v1/ai/insights/generate`**:
    Assert that it successfully queries user totals, makes the mock API call, stores the resulting validated insight, and updates the database.
