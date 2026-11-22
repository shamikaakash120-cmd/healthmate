# HealthMate - Architectural & Technical Decisions

This document details the architectural decisions, design patterns, and libraries selected for the HealthMate application, along with justifications for technical documentation and marking review.

---

## 1. Architectural Pattern: Feature-Based MVVM
- **Decision:** Implement Model-View-ViewModel (MVVM) structured by feature (`records`, `dashboard`, `history`, `settings`) with a centralized `core/` module.
- **Justification:**
  - Strict separation of concerns: UI screens contain zero database queries and zero business logic.
  - Repositories encapsulate raw SQL and database interactions.
  - ViewModels (Zustand stores) decouple UI state from persistence.
  - Highly testable and cleanly explainable for university coursework evaluation.

## 2. Local Database: `expo-sqlite`
- **Decision:** Use official Expo module `expo-sqlite` with parameterized queries.
- **Justification:**
  - Native embedded SQLite engine with zero cloud latency.
  - Direct requirement for the coursework's embedded database criterion.
  - Guaranteed SDK compatibility with standard Expo workflows.
  - Parameterized queries eliminate SQL injection vulnerabilities.

## 3. State Management: `Zustand`
- **Decision:** Use `zustand` for lightweight, store-based state management.
- **Justification:**
  - Minimal boilerplate compared to Redux Toolkit.
  - Decoupled from React render cycle; allows direct subscription and state updates.
  - Easily maps to the ViewModel role in MVVM architecture.

## 4. Navigation: `Expo Router` (Tabs + Stack)
- **Decision:** Use file-based routing via `Expo Router` with bottom tabs and nested stacks.
- **Justification:**
  - Intuitive directory-based routing (`app/`).
  - Native animations and deep linking built in.
  - Bottom tabs ensure thumb-friendly one-handed navigation adhering to modern UX patterns.

## 5. UI & Design System: Material Design 3 with Calm Palette
- **Decision:** Implement a custom design tokens system inspired by Material Design 3, centered on a calm, low-anxiety palette (warm off-white background, soft teal primary, deep slate typography, and consistent metric colors).
- **Justification:**
  - Coursework marking criteria emphasizes consistent, wireframe-worthy UX.
  - Calming colors reduce cognitive load for health tracking.
  - 8-pt spacing grid and fixed touch targets (min 48dp) ensure accessibility.

## 6. Icons: `@expo/vector-icons` (`MaterialCommunityIcons`)
- **Decision:** Exclusively use `MaterialCommunityIcons` from `@expo/vector-icons`.
- **Justification:**
  - Visual consistency across the entire app.
  - Rich health/fitness icon collection (e.g., `walk`, `fire`, `water`).

## 7. Date Picking: `@react-native-community/datetimepicker`
- **Decision:** Use the community standard date/time picker for calendar selections.
- **Justification:**
  - Native iOS and Android platform date pickers provide familiar, accessible UX.
  - Fully maintained within the Expo ecosystem.

## 8. Data Visualizations: `react-native-svg`
- **Decision:** Use `react-native-svg` exclusively for circular progress rings and custom metric gauges.
- **Justification:**
  - Avoids bloated third-party charting packages.
  - High performance, pixel-crisp rendering on all screen densities.
