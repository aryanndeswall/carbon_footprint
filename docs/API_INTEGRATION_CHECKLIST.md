# API Integration Checklist - Carbon Sense

This tracking document maps all API endpoints for the Carbon Sense platform, correlating frontend screens, hooks, and services to backend APIs, request/response payloads, and database services. Use this checklist to track development, testing, and integration status for each endpoint.

---

## Table of Contents

1. [Authentication & Onboarding](#1-authentication--onboarding)
2. [Dashboard](#2-dashboard)
3. [Missions](#3-missions)
4. [AI Coach](#4-ai-coach)
5. [What-If Simulator](#5-what-if-simulator)
6. [Profile & Gamification](#6-profile--gamification)
7. [OCR (Documents Ingestion)](#7-ocr-documents-ingestion)

---

## 1. Authentication & Onboarding

### User Sign In
* **Method:** POST
* **Route:** `/auth/v1/token?grant_type=password` (Supabase Auth API)
* **Frontend Screen:** [sign-in.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/auth/sign-in.tsx)
* **Frontend Hook:** Direct Supabase Auth SDK call (`supabase.auth.signInWithPassword`)
* **Backend Service:** Managed by Supabase Auth (Auth middleware: `JWTAuthMiddleware` validates JWT)
* **Expected Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
* **Expected Response:**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "...",
    "user": {
      "id": "31464673-9a3d-4c33-8a30-8027a00ef9f0",
      "email": "user@example.com"
    }
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### User Sign Up
* **Method:** POST
* **Route:** `/auth/v1/signup` (Supabase Auth API)
* **Frontend Screen:** [sign-up.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/auth/sign-up.tsx)
* **Frontend Hook:** Direct Supabase Auth SDK call (`supabase.auth.signUp`)
* **Backend Service:** Managed by Supabase Auth
* **Expected Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
* **Expected Response:**
  ```json
  {
    "id": "31464673-9a3d-4c33-8a30-8027a00ef9f0",
    "email": "user@example.com",
    "created_at": "2026-06-13T12:00:00Z"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Complete User Onboarding
* **Method:** POST
* **Route:** `/api/v1/users/onboarding`
* **Frontend Screen:** [onboarding.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/modals/onboarding.tsx)
* **Frontend Hook:** `useProfileData` (calls onboarding api)
* **Backend Service:** `UserService` (`app/services/user.py`)
* **Expected Request:**
  ```json
  {
    "state_code": "DL",
    "diet_type": "vegetarian",
    "transport_preference": "metro",
    "housing_type": "apartment"
  }
  ```
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

## 2. Dashboard

### Get Dashboard Data
* **Method:** GET
* **Route:** `/api/v1/dashboard` (Note: Mapped to frontend mock. Backend requires consolidation of endpoints /footprints/today, /streaks/current, and /missions/today, or a custom Dashboard route)
* **Frontend Screen:** [dashboard.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/dashboard.tsx)
* **Frontend Hook:** `useDashboardData`
* **Backend Service:** Planned `DashboardService` / Mock fallback handler in service layer
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "score": 82,
    "scoreTrend": "+3 this week",
    "streak": 12,
    "activitiesLoggedCount": 5,
    "mission": {
      "id": "mission-today",
      "title": "Eat one vegetarian meal",
      "category": "Food",
      "difficulty": "Easy",
      "scoreReward": 3,
      "carbonReward": 1.2,
      "status": "available",
      "description": "Swap out meat for one meal today."
    },
    "insights": {
      "id": "insight-latest",
      "title": "AI Coach Recommendation",
      "text": "Your transport habits improved by 18% this week. Take the metro today.",
      "suggestion": "Take the metro instead of driving today."
    },
    "forecast": {
      "period": "30 Day",
      "currentScore": 82,
      "projectedScore": 88,
      "confidence": 81,
      "summary": "Consistent daily actions could elevate your score."
    },
    "categories": [
      { "name": "Transport", "value": 2.4, "limit": 5.0, "progress": 0.48 },
      { "name": "Food", "value": 1.2, "limit": 3.0, "progress": 0.4 }
    ],
    "activities": [
      {
        "id": "act-1",
        "category": "Transport",
        "activity_type": "Metro Ride",
        "quantity": 12,
        "unit": "km",
        "timestamp": "2026-06-13T10:00:00Z"
      }
    ]
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Today's Footprint
* **Method:** GET
* **Route:** `/api/v1/footprints/today`
* **Frontend Screen:** [dashboard.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/dashboard.tsx) (HeroProgressRing, CategoryBreakdownGrid)
* **Frontend Hook:** `useFootprint` (global hook) / `useDashboardData`
* **Backend Service:** `CarbonEngineService` (`app/services/carbon_engine.py`)
* **Expected Request:** None
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Dashboard "What If?" Recommendations
* **Method:** GET
* **Route:** `/api/v1/simulations/recommendations`
* **Frontend Screen:** [dashboard.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/dashboard.tsx) (AIInsightCard / QuickActionsRow)
* **Frontend Hook:** `useDashboardData` / `useSimulatorData`
* **Backend Service:** `DecisionAssistantService` (`app/services/simulation.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "recommendations": [
        {
          "category": "transport",
          "recommendation": "Switch 2 car trips to metro",
          "carbon_saving": 4.5,
          "score_impact": 3
        }
      ]
    },
    "message": "Dashboard recommendations retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Log a New Activity
* **Method:** POST
* **Route:** `/api/v1/activities`
* **Frontend Screen:** [activity-log.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/modals/activity-log.tsx) (QuickActionsRow popup)
* **Frontend Hook:** Direct API post in `activity-log.tsx` modal
* **Backend Service:** `ActivityService` (`app/services/activity.py`)
* **Expected Request:**
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
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### List Activities
* **Method:** GET
* **Route:** `/api/v1/activities`
* **Frontend Screen:** [dashboard.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/dashboard.tsx) (RecentActivityList)
* **Frontend Hook:** `useDashboardData` / Custom Query
* **Backend Service:** `ActivityService` (`app/services/activity.py`)
* **Expected Request:** Query params: `?page=1&page_size=20&category=transport`
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

## 3. Missions

### Get Missions Screen Data
* **Method:** GET
* **Route:** `/api/v1/missions` (Note: Mapped to frontend mock. Backend requires consolidation of `/missions/today` and `/missions/history` or a summary endpoint)
* **Frontend Screen:** [missions.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/missions.tsx)
* **Frontend Hook:** `useMissionsData`
* **Backend Service:** Planned `MissionsSummaryService`
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "dailyMissions": [
      {
        "id": "daily-1",
        "title": "Eat one vegetarian meal",
        "description": "Swap out meat for a plant-based alternative today.",
        "category": "Food",
        "difficulty": "Easy",
        "rewardScore": 3,
        "rewardCarbon": 1.2,
        "progress": 0,
        "status": "available"
      }
    ],
    "weeklyMissions": [
      {
        "id": "weekly-1",
        "title": "Public Transport Champion",
        "currentProgress": 2,
        "totalTarget": 3,
        "rewardScore": 15,
        "isCompleted": false
      }
    ],
    "completedMissions": [
      {
        "id": "comp-1",
        "title": "Cold Water Wash Only",
        "completedAt": "2026-06-12T12:00:00Z",
        "rewardScore": 3
      }
    ],
    "achievements": {
      "id": "ach-1",
      "title": "Week Warrior",
      "progressText": "Week Warrior",
      "remainingCount": 2
    },
    "progress": {
      "completedCount": 3,
      "totalCount": 5,
      "scoreEarned": 9,
      "percentage": 60
    }
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Today's Daily Mission
* **Method:** GET
* **Route:** `/api/v1/missions/today`
* **Frontend Screen:** [missions.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/missions.tsx) (DailyMissionCard)
* **Frontend Hook:** `useMissions` (global) / `useMissionsData`
* **Backend Service:** `MissionEngineService` (`app/services/mission_engine.py`)
* **Expected Request:** None
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Recommended Mission Template (Preview)
* **Method:** GET
* **Route:** `/api/v1/missions/recommended`
* **Frontend Screen:** [missions.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/missions.tsx) (AchievementPreview / Recommended tab)
* **Frontend Hook:** `useMissionsData`
* **Backend Service:** `MissionEngineService` (`app/services/mission_engine.py`)
* **Expected Request:** None
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Complete a Mission
* **Method:** POST
* **Route:** `/api/v1/missions/{id}/complete`
* **Frontend Screen:** [missions.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/missions.tsx) (Mark Complete action button)
* **Frontend Hook:** `useMissionsData` (via `completeMissionAPI` service call)
* **Backend Service:** `MissionEngineService` (`app/services/mission_engine.py`)
* **Expected Request:** None (URL path parameter `id`)
* **Expected Response:**
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
    "message": "Mission marked as completed successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### List Missions History
* **Method:** GET
* **Route:** `/api/v1/missions/history`
* **Frontend Screen:** [missions.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/missions.tsx) (CompletedMissionCard / history list)
* **Frontend Hook:** `useMissionsData`
* **Backend Service:** `MissionEngineService` (`app/services/mission_engine.py`)
* **Expected Request:** Query parameters: `?page=1&page_size=20`
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

## 4. AI Coach

### Get Coach Dashboard Data
* **Method:** GET
* **Route:** `/api/v1/coach` (Note: Mapped to frontend mock. Backend requires integration of `/ai/insights/latest` and `/footprints/weekly` or dedicated coach endpoint)
* **Frontend Screen:** [coach.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/coach.tsx)
* **Frontend Hook:** `useCoachData`
* **Backend Service:** Planned `CoachDashboardService`
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "insight": {
      "headline": "Today's Insight",
      "summary": "Your transport emissions decreased by 18% this week.",
      "recommendation": "One more metro ride could increase your score by 3 points."
    },
    "recommendations": [
      {
        "id": "rec-1",
        "category": "Transport",
        "title": "Take Metro Tomorrow",
        "description": "Replace your vehicle commute with a metro ride.",
        "impact": "High",
        "difficulty": "Easy",
        "rewardScore": 3,
        "rewardCarbon": 4.2,
        "ctaLabel": "Log This Activity",
        "ctaNavigation": "/modals/activity-log?category=Transport"
      }
    ],
    "forecast": {
      "currentScore": 82,
      "projectedScore": 88,
      "confidence": 81,
      "explanation": "Your mission completion rate indicates strong upward momentum."
    },
    "trends": [
      { "category": "Transport", "state": "Improving", "percentage": 12, "period": "Last 30 Days" }
    ],
    "history": [
      {
        "id": "msg-1",
        "sender": "coach",
        "text": "Hi there! I analyzed your transport habits from last week.",
        "timestamp": "2026-06-13T10:00:00Z"
      }
    ]
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Query AI Coach (Chat)
* **Method:** POST
* **Route:** `/api/v1/coach/query` (Note: Mapped to frontend mock; backend maps to `/ai/chat` or planned query router)
* **Frontend Screen:** [coach.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/coach.tsx) (ConversationHistory)
* **Frontend Hook:** `useCoachData` (via `queryCoachAPI` service call)
* **Backend Service:** Planned `CoachChatService` / `AIInsightService`
* **Expected Request:**
  ```json
  {
    "query": "How can I reduce my food footprint?"
  }
  ```
* **Expected Response:**
  ```json
  {
    "response": "Observation:\n...\n\nReason:\n...\n\nRecommendation:\n...",
    "observation": "Overall habits are stable, with food footprint leading emission sources.",
    "reason": "High dairy and beef usage over the last 14 days.",
    "recommendation": "Substitute plant-based alternatives for cheese or beef once a day."
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Latest AI Insight
* **Method:** GET
* **Route:** `/api/v1/ai/insights/latest`
* **Frontend Screen:** [coach.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/coach.tsx) (CoachHero / InsightCard)
* **Frontend Hook:** `useCoachData` / `useCoach` (global)
* **Backend Service:** `AIInsightService` (`app/services/ai/service.py`)
* **Expected Request:** Query parameter `?type=daily_coach`
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "user_id": "31464673-9a3d-4c33-8a30-8027a00ef9f0",
      "insight_type": "daily_coach",
      "content": {
        "body": "Your transport emissions decreased by 18% this week. Keep up the metro trips!",
        "recommendation": "Take the metro to work twice next week to boost your score by 4 points."
      },
      "created_at": "2026-06-12T00:50:00Z"
    },
    "message": "Latest insight retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Weekly Summary
* **Method:** GET
* **Route:** `/api/v1/ai/weekly-summary`
* **Frontend Screen:** [coach.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/coach.tsx) (ForecastInsightCard / TrendCard)
* **Frontend Hook:** `useCoachData`
* **Backend Service:** `AIInsightService` (`app/services/ai/service.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "insight_type": "weekly_summary",
      "content": {
        "summary": "Weekly emissions overview details..."
      },
      "created_at": "2026-06-12T00:50:00Z"
    },
    "message": "Weekly summary retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Search Similar Memories (Semantic Search Context)
* **Method:** POST
* **Route:** `/api/v1/ai/memory/search`
* **Frontend Screen:** [coach.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/coach.tsx)
* **Frontend Hook:** `useCoachData` / planned hook
* **Backend Service:** `MemoryRetrievalService` (`app/services/ai/memory_retrieval.py`)
* **Expected Request:**
  ```json
  {
    "query": "commuting patterns",
    "limit": 5
  }
  ```
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
        "memory_text": "Takes metro Yellow Line daily",
        "similarity": 0.85
      }
    ],
    "message": "Semantic memory search executed successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

## 5. What-If Simulator

### Get Simulator Baseline
* **Method:** GET
* **Route:** `/api/v1/simulator/baseline` (Note: Mapped to frontend mock. Backend actual requires calling `/footprints/today` and `/simulations` to build this payload)
* **Frontend Screen:** [simulator.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/simulator.tsx)
* **Frontend Hook:** `useSimulatorData` (calls `getSimulatorBaseline` service)
* **Backend Service:** `SimulationService` (`app/services/simulation.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "baseline": {
      "footprintKg": 92,
      "sustainabilityScore": 82,
      "forecastScore": 85
    },
    "savedScenarios": [
      {
        "id": "saved-1",
        "name": "Metro Lifestyle",
        "category": "Transport",
        "savedAt": "2026-06-12T12:00:00Z",
        "scoreImpact": 6,
        "carbonReductionKg": 14,
        "input": {
          "category": "Transport",
          "params": [
            { "id": "car_trips", "label": "Car Trips Per Week", "unit": "trips", "currentValue": 2, "min": 0, "max": 7, "step": 1 }
          ]
        }
      }
    ]
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Run Simulation Scenario
* **Method:** POST
* **Route:** `/api/v1/simulator/run` (Note: Mapped to frontend mock. Backend actual maps to `/simulations` which runs projections and includes Gemini explanations)
* **Frontend Screen:** [simulator.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/simulator.tsx) (ScenarioBuilder sliders)
* **Frontend Hook:** `useSimulatorData` (calls `runSimulation` service)
* **Backend Service:** `SimulationService` (`app/services/simulation.py`)
* **Expected Request:**
  ```json
  {
    "input": {
      "category": "Transport",
      "params": [
        { "id": "car_trips", "currentValue": 2 }
      ]
    }
  }
  ```
* **Expected Response:**
  ```json
  {
    "id": "sim-12345",
    "generatedAt": "2026-06-13T12:00:00Z",
    "baseline": {
      "footprintKg": 92,
      "sustainabilityScore": 82,
      "forecastScore": 85
    },
    "projected": {
      "footprintKg": 78,
      "sustainabilityScore": 88,
      "forecastScore": 90
    },
    "impacts": [
      { "label": "Carbon Reduction", "value": "-14 kg CO₂", "direction": "positive" },
      { "label": "Score Increase", "value": "+6", "direction": "positive" }
    ],
    "aiExplanation": {
      "action": "Switching your car trips to metro or cycling.",
      "impact": "Could reduce your monthly footprint by approximately 14 kg CO₂.",
      "recommendation": "Start with one metro day this week.",
      "fullText": "Switching your car trips to metro or cycling. Could reduce your monthly footprint by approximately 14 kg CO₂. Start with one metro day this week."
    },
    "comparisons": [
      { "id": "c1", "label": "Metro Ride", "carbonImpactKg": 14, "scoreImpact": 6, "difficulty": "Easy", "impactLevel": "High", "rank": 1 }
    ]
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Save Simulation Scenario
* **Method:** POST
* **Route:** `/api/v1/simulator/saved` (Note: Mapped to frontend mock. Backend actual maps to `/simulations` which creates a scenario with name and parameters)
* **Frontend Screen:** [simulator.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/simulator.tsx) (Save Scenario modal dialog)
* **Frontend Hook:** `useSimulatorData` (calls `saveScenario` service)
* **Backend Service:** `SimulationService` (`app/services/simulation.py`)
* **Expected Request:**
  ```json
  {
    "name": "Metro Lifestyle Plan",
    "category": "Transport",
    "savedAt": "2026-06-13T12:00:00Z",
    "scoreImpact": 6,
    "carbonReductionKg": 14,
    "input": {
      "category": "Transport",
      "params": [
        { "id": "car_trips", "currentValue": 2 }
      ]
    }
  }
  ```
* **Expected Response:**
  ```json
  {
    "id": "saved-12345",
    "name": "Metro Lifestyle Plan",
    "category": "Transport",
    "savedAt": "2026-06-13T12:00:00Z",
    "scoreImpact": 6,
    "carbonReductionKg": 14,
    "input": { ... }
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Compare Simulation Scenarios
* **Method:** POST
* **Route:** `/api/v1/simulations/compare`
* **Frontend Screen:** [simulator.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/simulator.tsx) (Scenario Comparison panel)
* **Frontend Hook:** `useSimulatorData` / planned hook
* **Backend Service:** `DecisionAssistantService` (`app/services/simulation.py`)
* **Expected Request:**
  ```json
  {
    "scenarios": [
      { "scenario_id": "saved-1" },
      { "scenario_type": "Transport", "parameters": { "car_trips": 1 } }
    ]
  }
  ```
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "compared_scenarios": [
        {
          "name": "Metro Lifestyle Plan",
          "carbon_reduction": 14.0,
          "score_impact": 6,
          "rank": 1
        }
      ]
    },
    "message": "Simulation comparison completed successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

## 6. Profile & Gamification

### Get Profile Data
* **Method:** GET
* **Route:** `/api/v1/profile` (Note: Mapped to frontend mock. Backend requires calling `/users/me` and `/score` and `/achievements/unlocked` to build this payload)
* **Frontend Screen:** [profile.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/profile.tsx)
* **Frontend Hook:** `useProfileData`
* **Backend Service:** None (Mocked on frontend)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "user": {
      "name": "Aryan",
      "email": "aryan@carbonsense.com",
      "avatarUrl": null,
      "memberSince": "June 2026",
      "sustainabilityScore": 82,
      "currentStreak": 12
    },
    "impact": {
      "carbonSaved": 142.0,
      "activitiesLogged": 287,
      "missionsCompleted": 64,
      "communityContributions": 8
    },
    "achievements": [
      {
        "id": "ach-1",
        "badge": "🏅",
        "title": "Week Warrior",
        "description": "Completed every daily mission for a consecutive 7-day period.",
        "earnedAt": "2026-06-11T12:00:00Z"
      }
    ],
    "goals": [
      {
        "id": "goal-1",
        "title": "Reach Score 90",
        "description": "Improve sustainability metrics to reach score 90.",
        "currentValue": 82,
        "targetValue": 90,
        "unit": "Points",
        "type": "Reach Score 90",
        "filterQuery": "sort=impact",
        "status": "active"
      }
    ],
    "statistics": {
      "longestStreak": 27,
      "missionCompletionRate": 84,
      "monthlyProgress": 14,
      "scoreTrend": "up"
    }
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Current User Profile
* **Method:** GET
* **Route:** `/api/v1/users/me`
* **Frontend Screen:** [profile.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/profile.tsx) (ProfileHero)
* **Frontend Hook:** `useProfileData`
* **Backend Service:** `UserService` (`app/services/user.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "auth_user_id": "31464673-9a3d-4c33-8a30-8027a00ef9f0",
      "email": "user@example.com",
      "full_name": "Aryan Deswall",
      "avatar_url": null,
      "created_at": "2026-06-12T00:50:00Z",
      "updated_at": "2026-06-12T00:50:00Z"
    },
    "message": "Profile retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Update User Profile
* **Method:** PATCH
* **Route:** `/api/v1/users/me`
* **Frontend Screen:** [settings.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/settings.tsx)
* **Frontend Hook:** `useProfileData` / planned hook
* **Backend Service:** `UserService` (`app/services/user.py`)
* **Expected Request:**
  ```json
  {
    "full_name": "Aryan Deswall",
    "avatar_url": "https://example.com/avatars/aryan.png"
  }
  ```
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get User Preferences
* **Method:** GET
* **Route:** `/api/v1/users/preferences`
* **Frontend Screen:** [settings.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/settings.tsx)
* **Frontend Hook:** `useProfileData`
* **Backend Service:** `UserService` (`app/services/user.py`)
* **Expected Request:** None
* **Expected Response:**
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
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Update User Preferences
* **Method:** PATCH
* **Route:** `/api/v1/users/preferences`
* **Frontend Screen:** [settings.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/settings.tsx)
* **Frontend Hook:** `useProfileData` / planned hook
* **Backend Service:** `UserService` (`app/services/user.py`)
* **Expected Request:**
  ```json
  {
    "state_code": "MH",
    "diet_type": "vegan"
  }
  ```
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "b3e0cf55-a0f1-432d-965b-bf98c50da300",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "state_code": "MH",
      "diet_type": "vegan",
      "transport_preference": "metro",
      "housing_type": "apartment",
      "notification_enabled": true,
      "created_at": "2026-06-12T00:50:00Z",
      "updated_at": "2026-06-12T01:02:00Z"
    },
    "message": "Preferences updated successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get User Sustainability Score
* **Method:** GET
* **Route:** `/api/v1/score`
* **Frontend Screen:** [profile.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/profile.tsx) (ProfileHero)
* **Frontend Hook:** `useProfileData`
* **Backend Service:** `SustainabilityScoreService` (`app/services/gamification.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "user_id": "e0c7ba0c-15a0-4b2a-bf39-44585c54d193",
      "score": 82,
      "updated_at": "2026-06-13T12:00:00Z"
    },
    "message": "Sustainability score retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get User Score History
* **Method:** GET
* **Route:** `/api/v1/score/history`
* **Frontend Screen:** [profile.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/profile.tsx) (StatisticsSection charts)
* **Frontend Hook:** `useProfileData`
* **Backend Service:** `ScoreHistoryRepository` (`app/repositories/gamification.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "score": 80,
        "recorded_date": "2026-06-11"
      },
      {
        "id": "uuid",
        "score": 82,
        "recorded_date": "2026-06-12"
      }
    ],
    "message": "Score history retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Unlocked Achievements
* **Method:** GET
* **Route:** `/api/v1/achievements/unlocked`
* **Frontend Screen:** [profile.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/(tabs)/profile.tsx) (AchievementSection) / [achievements.tsx](file:///d:/carbon_footprint/apps/mobile/src/app/achievements.tsx)
* **Frontend Hook:** `useProfileData`
* **Backend Service:** `AchievementService` (`app/services/gamification.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ach-1",
        "badge": "🏅",
        "title": "Week Warrior",
        "description": "Completed every daily mission for a consecutive 7-day period.",
        "unlocked_at": "2026-06-11T12:00:00Z"
      }
    ],
    "message": "Unlocked achievements retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

## 7. OCR (Documents Ingestion)

### Upload Document
* **Method:** POST
* **Route:** `/api/v1/documents/upload` (API contract defines alias `/uploads/receipt` & `/uploads/electricity-bill`)
* **Frontend Screen:** Not Created (Planned for Sprint 9 / Phase 9)
* **Frontend Hook:** Not Created
* **Backend Service:** `DocumentStorageService` (`app/services/document.py`)
* **Expected Request:** `multipart/form-data` containing:
  - `document_type`: "receipt" | "electricity_bill" | "shopping_invoice"
  - `file`: binary upload file (< 5MB, PDF/JPG/PNG)
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "document_id": "ac68a0a7-332d-450f-bf01-8027a00ef9ab",
      "status": "processing"
    }
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### List Uploaded Documents
* **Method:** GET
* **Route:** `/api/v1/documents`
* **Frontend Screen:** Not Created
* **Frontend Hook:** Not Created
* **Backend Service:** `UploadedDocumentRepository` (`app/repositories/document.py`)
* **Expected Request:** None
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ac68a0a7-332d-450f-bf01-8027a00ef9ab",
        "document_type": "receipt",
        "file_url": "https://storage.carbonsense.app/receipts/doc.png",
        "processing_status": "uploaded",
        "created_at": "2026-06-13T12:00:00Z"
      }
    ],
    "message": "Documents retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Get Document Details
* **Method:** GET
* **Route:** `/api/v1/documents/{id}`
* **Frontend Screen:** Not Created
* **Frontend Hook:** Not Created
* **Backend Service:** `UploadedDocumentRepository` (`app/repositories/document.py`)
* **Expected Request:** None (URL path parameter `id`)
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "ac68a0a7-332d-450f-bf01-8027a00ef9ab",
      "document_type": "receipt",
      "file_url": "https://storage.carbonsense.app/receipts/doc.png",
      "processing_status": "extracted",
      "created_at": "2026-06-13T12:00:00Z"
    },
    "message": "Document details retrieved successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Extract Document Data
* **Method:** POST
* **Route:** `/api/v1/documents/{id}/extract`
* **Frontend Screen:** Not Created
* **Frontend Hook:** Not Created
* **Backend Service:** `DocumentReviewService` (`app/services/document.py`)
* **Expected Request:** None (URL path parameter `id`)
* **Expected Response:**
  ```json
  {
    "success": true,
    "data": {
      "document_id": "ac68a0a7-332d-450f-bf01-8027a00ef9ab",
      "extracted_data": {
        "category": "transport",
        "activity_type": "metro",
        "quantity": 12.5,
        "unit": "km",
        "metadata": {
          "confidence_score": 0.95
        }
      }
    },
    "message": "Document extraction completed successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Approve Document Extraction
* **Method:** POST
* **Route:** `/api/v1/documents/{id}/approve`
* **Frontend Screen:** Not Created
* **Frontend Hook:** Not Created
* **Backend Service:** `DocumentReviewService` (`app/services/document.py` updates doc status and saves corresponding `Activity` via `ActivityService`)
* **Expected Request:**
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
* **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Document approved and activity logged successfully"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested

---

### Reject Document Extraction
* **Method:** POST
* **Route:** `/api/v1/documents/{id}/reject`
* **Frontend Screen:** Not Created
* **Frontend Hook:** Not Created
* **Backend Service:** `DocumentReviewService` (`app/services/document.py`)
* **Expected Request:** None (URL path parameter `id`)
* **Expected Response:**
  ```json
  {
    "success": true,
    "message": "Document marked as rejected"
  }
  ```
* **Status Checklist:**
  - [ ] Endpoint Exists
  - [ ] Backend Tested
  - [ ] Frontend Hook Created
  - [ ] Loading State
  - [ ] Error State
  - [ ] Offline Handling
  - [ ] Cache Strategy
  - [ ] Tested
