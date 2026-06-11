# UI/UX Design Specification: Carbon Sense

This document defines the complete user experience guidelines, visual design tokens, component architecture, and interaction models for the Carbon Sense mobile client.

---

## 1. Information Architecture (IA)

Carbon Sense employs a flat tab-based navigation hierarchy, optimized for easy one-handed operation on mobile devices.

```text
Root App Shell
  ├── (auth)/                       # Authentication Modal Group
  │     ├── Login Screen
  │     └── Signup Screen
  ├── (onboarding)/                 # Onboarding Flow (Horizontal swipe carousel)
  │     ├── Preference Ingestion Screen
  │     └── Region/State Selection Screen
  └── (tabs)/                       # Main App Interface (Bottom Tab Bar)
        ├── Tab 1: Carbon Dashboard  # Today's Progress, Category Cards, Ingestion Trigger
        │     └── Modal: Add Activity Ingestion Wizard
        ├── Tab 2: Daily Missions   # Assigned Mission, Completing/Skipping, History
        ├── Tab 3: AI Coach Chat    # Interactive Advice, Suggestion Chips
        └── Tab 4: Profile & Streak # Calendar Overview, Freeze toggles, Milestones
```

---

## 2. Core User Journeys

### 2.1 First-Time User Onboarding
1. **Entry**: User lands on the Login/Signup screen.
2. **Signup**: User authenticates via Supabase (Email/Password or Social Auth).
3. **Onboarding Carousel**: A 4-step horizontal card carousel queries:
   * Diet preference (`vegetarian`, `vegan`, `eggetarian`, `non_vegetarian`).
   * Commute preference (`metro`, `bus`, `car`, `train`, `bike`, `walk`).
   * Housing classification (`apartment`, `independent_house`, `hostel`, `pg`).
   * Location (`state_code` for regional grid calculations).
4. **Completion**: Preferences are saved, and the user is redirected to the home dashboard.

### 2.2 Core Daily Engagement Loop
1. **Daily Check**: User opens the app.
2. **Streak Update**: The streak indicator at the top of the dashboard flashes, confirming yesterday's activity was verified and the current streak has extended.
3. **Daily Action**: The user views today's assigned Daily Mission (e.g. "Use Public Transport").
4. **Ingestion & Validation**: User clicks "Log Activity" to register their bus commute. The Carbon Engine calculates the emissions, updating the progress ring.
5. **Reward**: The user marks today's mission complete, receiving positive UI confirmation.

### 2.3 Streak Freeze Recovery Loop
1. **Missed Day**: User fails to log any activity on Monday.
2. **Recovery**: On Tuesday morning, the user opens the app.
3. **Lazy Self-Healing**: The app performs a lazy check. A bottom notification panel slides up: *"We applied a Streak Freeze to save your 8-day streak!"*
4. **Protection**: The streak flame remains lit, but the freeze counter decrements.

---

## 3. Wireframe & Layout Descriptions

### 3.1 Carbon Dashboard Screen
* **Status Bar**: Left: User Profile Icon; Center: Active Streak Flame Badge; Right: Network Status Icon.
* **Hero Progress Ring (Upper Third)**:
  * A circular SVG ring showing current progress.
  * *Text Center*: Large bold `3.42 kg CO₂` above a secondary label `Today's Emissions` (Target: 5.0 kg).
* **Ingestion CTA Button**: A floating action button (FAB) containing a `+` symbol positioned in the bottom-right corner.
* **Category Grid (Middle Third)**:
  * Two-column grid of cards: `Transport`, `Food`, `Electricity`, and `Shopping`.
  * Each card has a visual icon, emission value (e.g., `1.92 kg`), and a horizontal mini-progress bar.
* **Recent Logs Feed (Lower Third)**:
  * A list displaying the last 3 logged events. Swiping left on an event exposes a secondary "Archive" command.

### 3.2 Daily Missions Screen
* **Header**: Large title `Today's Action` and a subhead tracking weekly carbon savings (e.g., `12.5 kg CO₂ saved this week`).
* **Featured Mission Card (Upper Half)**:
  * A card with custom borders, displaying the category icon, difficulty tag (e.g., `Easy`), saving estimate (`1.5 kg CO₂`), and title: *"Eat one vegetarian meal"*.
  * *Action Buttons*: Primary green button: "Mark Completed"; Secondary outline button: "Skip for Today".
* **Progress Calendar**: A small 7-day horizontal timeline marking completed vs. missed missions.

### 3.3 Streak & Habits Screen
* **Header**: Title `Habits & Retention`.
* **Streak Stats Row**: Three metrics cards: `Current Streak` (flame icon), `Longest Streak` (trophy icon), and `Freezes` (snowflake icon).
* **Calendar Calendar Matrix (Middle)**:
  * Month calendar grid. Days are color-coded:
    * Green: Activity logged.
    * Blue: Streak freeze applied.
    * Grey: Inactive/Missed day.
* **Streak Milestones (Bottom)**:
  * Scrollable list of achievements (e.g., *"14-Day Streak: Green Champion"*). Progress bars show proximity to the next badge.

---

## 4. Visual Design Tokens & Systems

### 4.1 Typography Scale
Carbon Sense uses **Outfit** for headlines (clean, modern geometric feel) and **Inter** for reading text (high-legibility UI text).

| Token | Font Family | Size | Weight | Line Height | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `h1` | Outfit | 32dp | Bold (700) | 40dp | Screen Headers / Ring Totals |
| `h2` | Outfit | 24dp | SemiBold (600) | 30dp | Component Section Headers |
| `h3` | Outfit | 18dp | Medium (500) | 24dp | Card Titles / Dialog Headlines |
| `body` | Inter | 16dp | Regular (400) | 22dp | Primary Reading / Chat Text |
| `caption` | Inter | 12dp | Medium (500) | 16dp | Labels / Footnotes / Tags |

### 4.2 Unified Color System (HSL Tokens)

| Token Name | Light Mode Value | Dark Mode Value | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `background` | `hsl(210, 20%, 98%)` | `hsl(222, 47%, 11%)` | Primary view background |
| `surface` | `hsl(0, 0%, 100%)` | `hsl(224, 71%, 4%)` | Cards, lists, dialog backgrounds |
| `primary` | `hsl(142, 72%, 29%)` | `hsl(142, 69%, 45%)` | Climate action highlights / buttons |
| `text-primary` | `hsl(222, 47%, 11%)` | `hsl(210, 40%, 98%)` | Headers, titles, body reading |
| `text-muted` | `hsl(215, 16%, 47%)` | `hsl(215, 20%, 65%)` | Captions, dates, units |
| `border` | `hsl(214, 32%, 91%)` | `hsl(217, 32%, 17%)` | Dividers and input borders |
| `accent-freeze` | `hsl(200, 95%, 40%)` | `hsl(200, 95%, 55%)` | Streak freeze state highlights |
| `accent-flame` | `hsl(15, 100%, 50%)` | `hsl(18, 100%, 60%)` | Active streak visual highlights |
| `error` | `hsl(0, 84%, 60%)` | `hsl(0, 84%, 60%)` | Warning banners / validation errors |

---

## 5. Animations & Micro-Interactions

### 5.1 Progress Ring Invalidation
* **Action**: On screen load or activity logging, the circular SVG stroke fills from 0 to target percentage.
* **Animation**: Cubic Bezier easing (`ease-out`, duration: `1200ms`).

### 5.2 Floating Action Button (FAB) Press
* **Action**: Pressing the ingestion button scaling slightly down on press and expanding into the logging wizard modal.
* **Animation**: Scale transitions from `1.0` to `0.92` on touch start, returning to `1.0` with a spring rebound.

### 5.3 Active Streak Flame Pulse
* **Action**: The streak badge flame icon animates continuously to draw visual focus to habit preservation.
* **Animation**: Infinite loop scaling between `0.98` and `1.03` with a soft opacity cycle (duration: `3000ms`).

### 5.4 Tactile Haptic Feedback
Integrate device haptics to reinforce behaviors:
* **Medium Haptic Impact**: Triggered when successfully submitting an activity log or completing a mission.
* **Light Haptic Impact**: Triggered when tapping UI elements or tab icons.
* **Error Haptic Impact (Vibration Pulse)**: Triggered during input validation failure or when trying to use a freeze with 0 count.

---

## 6. Accessibility (a11y) Standards

### 6.1 Contrast Compliance
* All text-on-background pairings must maintain a minimum contrast ratio of **4.5:1** (WCAG AA standard). Primary action items (white text on green buttons) must maintain a contrast ratio of **7:1** (WCAG AAA).

### 6.2 Target Area Sizing
* All interactive items (buttons, icons, menu links, inputs) must have a minimum touch target size of **48dp x 48dp** to prevent mis-taps.

### 6.3 Screen Reader Compatibility
* Map interactive elements with appropriate screen reader tags:
  * Ingestion buttons labeled: `accessibilityLabel="Log new activity" accessibilityRole="button"`.
  * Streak status labeled: `accessibilityLabel="Current streak: 6 days. Click to view habit details."`.
* All SVG progress rings must include an accessible fallback description label.
* Support native Dynamic Font Scaling gracefully without text overlapping or clipping.
