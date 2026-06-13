# Carbon Sense Global Design Consistency Review

This document compiles the design consistency audit of the generated Stitch screens for Carbon Sense (Dashboard, Missions, Simulator, AI Coach, and Profile) against the platform's visual source of truth (`DESIGN_SYSTEM.md`), functional specifications, and reusable layout parameters.

---

## 1. Executive Summary

The five generated Carbon Sense screens present a unified visual identity. The interface transitions cleanly between screens, using Outfit for hero metrics/headings and Inter for data-rich labels, mimicking the gamified progress of Duolingo, the visual ring feedback of Apple Fitness, and the calm layering of modern fintech.

All layouts utilize a vertical stacking system with soft, rounded cards (24px/32px radius) resting on a clean cool background (`#F8FAFC`). Whitespace is generous, preventing cognitive load and separating Carbon Sense from traditional scientific ESG dashboards.

The global design status is evaluated as: **PASS WITH FIXES**. Minor color hardcodings and settings layout cleanups are required prior to code execution.

---

## 2. Screen-by-Screen Review

### A. Dashboard Screen (Screen ID: `6a1735d6ffba47a194a8226701907fcd`)
*   **Role**: Command Center.
*   **Visual Check**: Dominant Sustainability Score circular ring at the top, Daily Mission card immediately below, and 2x2 thin category grids. 
*   **Consistency**: Adheres to the score-first layout. Spacing follows base-8 grids. Uses Outlined Lucide icons for sync states (`cloud_done` / `cloud_off`).
*   **Gaps**: The Forecast card has been updated to match the AI Insight style, but still contains inline slates.

### B. Missions Screen (Screen ID: `76c99c2109684eebadf56bb8c2137c89`)
*   **Role**: Habit Engine.
*   **Visual Check**: 60% SVG summary progress ring, state-driven cards (Available, In-Progress, Completed, Expired) with confetti hooks, weekly challenge progress bars, and the Week Warrior gradient badge.
*   **Consistency**: Typography is fully aligned. Card shapes match Dashboard cards exactly (24px radius).
*   **Gaps**: The completed green state background (`#DCFCE7`) must use the shared `theme.colors.success_container` token.

### C. What-If Simulator Screen (Screen ID: `f464542544a448f481bcd98e6dd5de76`)
*   **Role**: Decision Laboratory.
*   **Visual Check**: Large Scenario Builder card with horizontal chips, side-by-side Current vs. Projected score cards with a connecting "impact path", green reduction stats pills, and alternatives comparison rows.
*   **Consistency**: Uses Simulation Blue (`#38BDF8`) for slider tracks and simulation inputs, visually separating "what-if" projection states from real-world tracked data.
*   **Gaps**: The comparison cards stack horizontally. To maintain usability, they must stack vertically on viewports narrower than 360px.

### D. AI Coach Screen (Screen ID: `fe929af582b3480fab546b9874d9260b`)
*   **Role**: Intelligence and Mentoring.
*   **Visual Check**: "Today's Insight" bulb hero card in soft green, Recommended Actions (max 3) with difficulty tags, 30-Day Forecast score path, behavior trend badges, and a minimal message input.
*   **Consistency**: Action > Conversation rule is upheld. Chat history is collapsed at the bottom to avoid looking like a support chatbot.
*   **Gaps**: The suggested prompt chips match the simulator chip sizes, but the message bar input must map borders to the shared input primitive.

### E. Profile Screen (Screen ID: `9590411cdd794872b7ca5790a010dba0`)
*   **Role**: Sustainability Passport (Identity).
*   **Visual Check**: Profile Hero with avatar and streak flame badge, 2x2 Impact Summary grid, achievements preview, active goals list with progress lines, lifetime statistics columns, and collapsed settings.
*   **Consistency**: Score circle matching the dashboard styling creates high visual continuity. Muting administrative settings keeps the user focused on accomplishment pride.
*   **Gaps**: Settings links should trigger a slide-up bottom sheet instead of rendering inline sub-pages.

---

## 3. Design System Violations (DESIGN_SYSTEM.md)

1.  **Hardcoded Slates**: Several screens reference tailwind slate fills (`bg-slate-100`, `bg-slate-200`, `bg-white`) rather than shared theme variables.
    *   *Correction*: Map to `theme.colors.background`, `theme.colors.surface`, and `theme.colors.border`.
2.  **Simulation Blue Overuse**: The Simulator correctly uses `#38BDF8` (Freeze Blue) for projection tracks, but the AI Coach stable trend also uses blue.
    *   *Correction*: Reserve Freeze Blue (`#38BDF8`) exclusively for simulations and forecasts. Muted gray or stable blue can be used for stable trend states.
3.  **Accent Fire Orange**: The Profile uses orange for streak flame, while goals use orange for progress.
    *   *Correction*: Flame Orange (`#F97316`) is strictly reserved for streaks and achievements. Goal progress should use primary Climate Green (`#22C55E`).

---

## 4. Component Reuse Opportunities

To optimize the frontend codebase, we will implement these 8 shared primitives:
*   **`Avatar`**: Reused in Dashboard Header (small) and Profile Hero (XL).
*   **`Card`**: Standardized elevation level 1/2 card with standard 24px rounded borders.
*   **`Badge`**: Status chips supporting difficulty (Easy/Medium/Hard) and streak flame.
*   **`ProgressBar`**: Linear indicator used for goals, weekly missions, and category metrics.
*   **`ProgressRing`**: SVG circular progress indicator used for Dashboard Score and Profile Score.
*   **`Button`**: Primary (Climate Green pill) and Secondary (Outlined).
*   **`Input`**: Text bar used for AI Coach and Simulator save actions.
*   **`Skeleton`**: Localized placeholders for loading states.

---

## 5. Required Fixes

1.  **Collapse Profile Settings**: Group inline settings links into a single collapsible "Settings" row that triggers a bottom sheet drawer.
2.  **Add Preset Chips**: Add the preset choices ("Use Metro", "Cycle to Work", "Veggie Day") into the Simulator Scenario Builder.
3.  **Stack Comparison Cards**: Force side-by-side Current vs. Projected cards to stack vertically on viewports < 360px.
4.  **Mute Chat History**: Collapse old conversations on AI Coach tab to show only the last response by default.
5.  **Offline Banner Sync**: Match offline banners across Dashboard, Coach, and Simulator screens.

---

## 6. Recommended Global Design Tokens

```typescript
export const theme = {
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    border: '#E2E8F0',
    primary: '#22C55E', // Climate Green
    primary_dim: '#15803D', // Deep Emerald
    streak: '#F97316', // Flame Orange
    simulation: '#38BDF8', // Freeze Blue
    text_primary: '#0F172A', // Dark Charcoal
    text_secondary: '#64748B',
    success_container: '#F0FDF4',
    success_text: '#15803D'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  roundness: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  }
};
```

---

## 7. Final Approval Status

### **PASS WITH FIXES**

The visual alignment, grid pacing, typography, and card-elevation systems are highly consistent. Implementing the 5 required layout fixes and mapping the hardcoded tokens to the recommended global design tokens will deliver a production-ready, premium mobile experience.
