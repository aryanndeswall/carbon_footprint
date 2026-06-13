# FE-9.5 Documentation Patch — Changelog

**Status: ✅ ALL P0 AND P1 FIXES APPLIED**
**Patch Date:** 2026-06-13
**Source Reviews:** `fe9_navigation_review.md`, `design_review_report.md`

---

## Summary

| Fix ID | Priority | Document | Description | Status |
|--------|----------|----------|-------------|--------|
| F-1 | 🔴 P0 | DASHBOARD_SCREEN_SPEC.md | First-Run Banner section added | ✅ Done |
| F-2 | 🟡 P1 | DASHBOARD_SCREEN_SPEC.md | Hero Summary zero state defined | ✅ Done |
| F-3 | 🔴 P0 | MISSION_SCREEN_SPEC.md | First-run arrival highlight state added | ✅ Done |
| F-4 | 🟡 P1 | DASHBOARD_SCREEN_SPEC.md | 60-second staleness rule added | ✅ Done |
| F-5 | 🟡 P1 | DASHBOARD_SCREEN_SPEC.md | Skip mission post-state defined | ✅ Done |
| F-6 | 🔴 P0 | AI_COACH_SCREEN_SPEC.md | Recommendation Card CTA table added | ✅ Done |
| F-7 | 🟡 P1 | AI_COACH_SCREEN_SPEC.md | Coach → Simulator handoff CTA added | ✅ Done |
| F-8 | 🟡 P1 | DASHBOARD_SCREEN_SPEC.md | Simulate chip in Quick Actions Row | ✅ Done |
| F-9 | 🔴 P0 | SIMULATOR_SCREEN_SPEC.md | Post-simulation CTA bar defined | ✅ Done |
| F-10 | 🟡 P1 | PROFILE_SCREEN_SPEC.md | Settings gear icon in Profile header | ✅ Done |
| F-11 | 🟡 P1 | PROFILE_SCREEN_SPEC.md | Goal → Mission cross-link added | ✅ Done |
| NAV-1 | 🟡 P1 | NAVIGATION_ARCHITECTURE.md | Coach tab notification badge defined | ✅ Done |
| NAV-2 | 🟡 P1 | NAVIGATION_ARCHITECTURE.md | FAB clearance rule + Simulator exception | ✅ Done |
| NAV-3 | 🟡 P1 | NAVIGATION_ARCHITECTURE.md | Back navigation type table added | ✅ Done |
| NAV-4 | 🟡 P1 | NAVIGATION_ARCHITECTURE.md | 2 missing deep links added | ✅ Done |
| DR-1 | 🟡 P1 | AI_COACH_SCREEN_SPEC.md | Conversation history collapsed by default | ✅ Done |
| DR-2 | 🟡 P1 | PROFILE_SCREEN_SPEC.md | Settings bottom sheet (not inline pages) | ✅ Done |
| P2-1 | 🟢 P2 | SIMULATOR_SCREEN_SPEC.md | Help action → bottom sheet tutorial | ✅ Done |

---

## 1. DASHBOARD_SCREEN_SPEC.md

### Changelog

**New Sections Added:**
- Section 2: First-Run Banner (F-1)
- Hero Summary → Zero State (F-2)
- Daily Mission Card → Skip Behavior (F-5)
- Quick Actions Row → Simulate Chip (F-8)
- Data Refresh → Staleness Rule (F-4)

**Updated Sections:**
- Top-Level Layout: renumbered all sections (11 → 12 total)
- Daily Mission Card → Completion Behavior: clarified ring animation + streak pulse
- Quick Actions Row: renamed "Examples" to "Default Activity Chips", added Simulate chip spec

---

### F-1: First-Run Banner

**Before:** No onboarding hook existed on Dashboard. New users landed on an empty screen with only generic empty state copy.

**After:** A dedicated First-Run Banner section (Section 2) defines:
- Visibility rule: shown only when `user.activitiesLogged === 0`
- Required elements: welcome headline, value statement, primary CTA
- CTA navigates to Missions tab with first mission highlighted
- FAB pulses once on first app open
- Auto-dismisses after first activity logged

---

### F-2: Hero Summary Zero State

**Before:** No behavior defined for score ring when score = 0. Spec only said "avoid highlighting zero values aggressively."

**After:** Explicit zero state defined:
- Ring displays in neutral unfilled state (dashed/dimmed stroke)
- Score number replaced with motivational copy: "Let's get started!"
- Ring fill animation begins only after first activity logged
- Secondary carbon value hidden in zero state

---

### F-4: Data Staleness Rule

**Before:** Spec said "refresh on screen focus" without defining staleness threshold or implementation mechanism.

**After:** Staleness rule explicitly added:
- Maximum acceptable data age on tab re-focus: **60 seconds**
- Must use `useFocusEffect` + query invalidation (not just `refetchOnWindowFocus`)

---

### F-5: Mission Skip Post-State

**Before:** "Skip for Today" action had no defined post-state. Card behavior after skip was undefined.

**After:** Skip behavior fully defined:
1. Card collapses to minimal "Mission Skipped" state
2. Card is NOT removed (remains as motivational nudge)
3. "See More Missions →" secondary link appears
4. Link navigates to Missions tab
5. Collapsed card uses muted styling

---

### F-8: Simulate Chip

**Before:** Quick Actions Row contained only activity logging chips (Metro Ride, Bus Commute, etc.).

**After:** A `🔮 Simulate` chip is added as the final chip in the row:
- Always present and visible
- Freeze Blue accent (`theme.colors.simulation`)
- Navigates directly to `/simulator`

---

## 2. MISSION_SCREEN_SPEC.md

### Changelog

**New Sections Added:**
- Header → First-Run Arrival State (F-3)
- Empty States → New User definition updated with generation guarantee

---

### F-3: First Mission Surfacing

**Before:** No mechanic defined for surfacing the first mission to a new user. The Missions tab had generic empty state copy.

**After:** First-Run Arrival State defined in the Header section:
- First mission card highlighted with pulsing Climate Green border on arrival from Dashboard CTA
- One-time coach tip displayed above first mission card
- Tip auto-dismisses after 4 seconds or on tap
- Triggered ONLY ONCE per account lifetime

New User empty state clarified:
- First mission is always pre-populated server-side upon account creation
- Maximum delay before first mission appears: **3 seconds**
- Skeleton shown while loading, never a blank empty state

---

## 3. AI_COACH_SCREEN_SPEC.md

### Changelog

**New Sections Added:**
- Recommendation Card CTA Behavior table (F-6)
- Forecast Insight Card → Simulator Handoff CTA (F-7)
- Conversation History → Display Rule: collapsed by default (Design Review DR-1)

**Updated Sections:**
- Recommendation Card Structure: added "Primary CTA Button" to required elements

---

### F-6: Recommendation Card CTA Behavior

**Before:** Recommendation Cards had no defined tap behavior. The most critical CTA in the app was completely undefined.

**After:** Full CTA routing table defined by `category`:

| Category | CTA Label | Navigation |
|----------|-----------|------------|
| Transport | Log This Activity | Activity Log Modal, Transport pre-selected |
| Food | Log This Activity | Activity Log Modal, Food pre-selected |
| Energy | Log This Activity | Activity Log Modal, Electricity pre-selected |
| Mission Related | View Mission | Mission Details (`/missions/{id}`) |
| Score Goal | Simulate This | Simulator (`/simulator`) with goal preset |
| General | Explore Options | Simulator with category pre-selected |

Rules: CTA always visible, one-tap resolution, no chat dialog as primary response.

---

### F-7: Coach → Simulator Handoff

**Before:** Navigation spec said Coach can navigate to Simulator, but no CTA was defined on any Coach card.

**After:** Forecast Insight Card includes a secondary CTA:
```
🔮 What if I changed my habits? →
```
- Navigates to `/simulator` with no preset (user chooses)
- Ghost button / text link style (visually secondary)

---

### DR-1: Conversation History Collapsed

**Before:** Conversation history displayed fully expanded by default, risking chatbot appearance.

**After:** History collapsed by default. Only most recent exchange visible. Previous exchanges accessible via "Show Earlier Conversations ↑" toggle.

---

## 4. SIMULATOR_SCREEN_SPEC.md

### Changelog

**New Sections Added:**
- Post-Simulation CTAs (F-9) — full section with Save Scenario, Log This Activity, Turn into Mission
- Help Action Definition (P2) — bottom sheet tutorial spec
- `PostSimulationCTABar` and `HelpBottomSheet` added to Component Hierarchy

**Updated Sections:**
- Simulator Flow: added "Post-Simulation CTAs" step in flow diagram
- Help Action in Header: defined behavior

---

### F-9: Post-Simulation CTAs

**Before:** After simulation results generated, no CTA existed. Simulator was a functional dead-end.

**After:** Sticky CTA bar defined for post-result state:

```
[💾 Save Scenario]   [✅ Log This Activity]
```

- **Save Scenario**: persists to Saved Scenarios, shows toast confirmation
- **Log This Activity**: opens Activity Log Modal pre-seeded with primary simulated behavior
- **Turn into Mission** (V1.5): secondary option, hidden if backend doesn't support it
- Sticky bar sits above tab bar and FAB
- FAB hidden on Simulator screen (conflict prevention)

---

### P2: Help Action Definition

**Before:** Help action in Simulator header was listed but undefined.

**After:** Help action opens a bottom sheet tutorial:
- Title: "How It Works"
- 4-step tutorial: choose scenario → adjust sliders → see results → save/log
- Auto-shown on first Simulator visit
- Shown on Help tap thereafter

---

## 5. PROFILE_SCREEN_SPEC.md

### Changelog

**New Sections Added:**
- Header → Settings Quick-Access Icon (F-10)
- Goals Section → Goal → Mission Cross-Link (F-11)
- Settings Section → Bottom Sheet behavior (Design Review DR-2)

---

### F-10: Settings Quick Access

**Before:** Settings section appeared at the bottom of a scrollable screen below 5 major sections. No quick access from header.

**After:** Settings gear icon (`⚙️`) added to Profile header top-right:
- Opens Settings Bottom Sheet directly
- Provides immediate access without scrolling

---

### F-11: Goal → Mission Cross-Link

**Before:** Goals and Missions were completely siloed. No navigation link between them.

**After:** Each Goal card includes "View Related Missions →" secondary link with category-based filtering:

| Goal Type | Filter |
|-----------|--------|
| Reach Score 90 | All missions by score impact |
| Maintain Streak | Daily missions by ease |
| Reduce Transport | Transport missions |
| Reduce Food | Food missions |
| Reduce Energy | Energy missions |

---

### DR-2: Settings Bottom Sheet

**Before:** Settings links rendered as inline sub-pages within the Profile screen.

**After:** Settings Section is a single collapsed row:
```
Settings & Options   >
```
Tapping opens a slide-up bottom sheet with all settings items. Dismiss by swipe or backdrop tap.

---

## 6. NAVIGATION_ARCHITECTURE.md

### Changelog

**New Sections Added:**
- Main Application → Tab Notification Badges table (NAV-1)
- FAB → Clearance Rule + Exceptions (NAV-2)
- Back Navigation Behavior table (NAV-3)
- Deep Link Definitions table (NAV-4)

**Updated Sections:**
- Deep Link Architecture: added `carbonsense://dashboard` and `carbonsense://activity/log`

---

### NAV-1: Coach Tab Badge

**Before:** No notification badge behavior defined for Coach tab.

**After:** Badge table added for all 5 tabs:
- Coach tab: red dot badge when `hasUnreadInsight === true`
- Badge clears on tab open
- Managed via `useCoachData` hook (`hasUnreadInsight: boolean`)

---

### NAV-2: FAB Rules

**Before:** FAB described as "present globally" with no clearance or exception rules.

**After:**
- Clearance rule: `marginBottom = tabBarHeight + 16px`
- Exception: FAB hidden on Simulator screen (conflict with CTA bar)

---

### NAV-3: Back Navigation Table

**Before:** Back navigation behavior for `forecast/` and `simulator/` routes was undefined.

**After:** Full back navigation type table covering all 14 screen contexts. `forecast/` and `simulator/` are root stack screens — back pops to calling screen. Implementation note added for `_layout.tsx` configuration.

---

### NAV-4: Missing Deep Links

**Before:** 6 deep links defined. `carbonsense://dashboard` and `carbonsense://activity/log` were missing.

**After:** 8 deep links defined. Full definition table with destination and use case for each.

---

## Post-Patch Status

All 11 friction points from FE-9 have been resolved in documentation.

| Flow | Previous Status | Post-Patch Status |
|------|-----------------|-------------------|
| New User Flow | ❌ FAIL | ✅ PASS |
| Returning User Flow | ✅ PASS | ✅ PASS |
| AI Coach Flow | ❌ FAIL | ✅ PASS |
| Simulator Flow | ❌ FAIL | ✅ PASS |
| Profile Flow | ⚠️ PASS WITH FIXES | ✅ PASS |
| Navigation Architecture | ⚠️ PASS WITH FIXES | ✅ PASS |
| FAB Behavior | ⚠️ PASS WITH FIXES | ✅ PASS |
| Back Navigation | ⚠️ PASS WITH FIXES | ✅ PASS |
| Deep Links | ⚠️ PASS WITH FIXES | ✅ PASS |

**All specs are now implementation-ready. Proceed to FE-10.**
