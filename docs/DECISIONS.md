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

## 2. Local Database: `expo-sqlite` (vs `sqflite`)
- **Decision:** Use the official modern Expo module `expo-sqlite` (`openDatabaseAsync`) with parameterized queries and schema versioning via `PRAGMA user_version`.
- **Justification:**
  - **Framework Ecosystem Compatibility:** The coursework specification mentions `sqflite`, which is a Flutter/Dart-exclusive package from pub.dev. In a React Native / Expo mobile application, `expo-sqlite` is the official, actively maintained equivalent providing embedded SQLite capabilities.
  - **Zero Latency & Offline-First:** SQLite runs directly on device storage, ensuring instantaneous CRUD execution without network requirements.
  - **Prepared Statements & Security:** All queries use parameterized inputs (`?` placeholders) to prevent SQL injection vulnerabilities.
  - **Schema Versioning (`PRAGMA user_version`):** Ensures tables (`health_records`, `settings`) and indexes (`idx_health_records_date`) are migrated safely without table loss on subsequent app launches.
  - **Awaited Initialization:** Database setup runs once at application bootstrap in `app/_layout.js` before exposing UI routes, guaranteeing no race conditions during initial queries.

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

## 9. Color Psychology & Low-Stress Emotional Design
- **Decision:** Ground the visual design in calming teal (`#2A9D8F`), warm off-white (`#F7F5F0`), deep slate text (`#1F2D3D`), and gentle pastel tints for metric containers.
- **Justification:**
  - **Teal as Primary:** Color psychology links teal with emotional balance, clarity, and rejuvenation. It avoids the clinical sterility of pure hospital blues and the agitation of high-energy neon colors.
  - **Soft Hues for Low Stress:** Traditional fitness apps often use aggressive neon alerts and harsh crimson red for missed goals, inducing guilt and anxiety. HealthMate utilizes soft warm tints (`#EDF7F1`, `#FDF1F1`, `#EDF4FC`) and gentle coral/terracotta for validation and calorie metrics, fostering positive reinforcement and long-term user retention.
  - **Intuitive Cognitive Mapping:**
    - **Steps (Soft Green `#4CAF7D`):** Evokes nature, vitality, and steady physical progression.
    - **Active Calories (Soft Coral Red `#E76F6F`):** Associates naturally with metabolic warmth and expended energy without visual alarm.
    - **Water (Soft Blue `#4A90D9`):** Direct psychological association with hydration and refreshment.

## 10. Timezone-Safe Local Calendar Date Management
- **Decision:** Handle all dates strictly as local calendar dates in `YYYY-MM-DD` format using dedicated pure functions (`toISODate`, `parseISODate`, `isValidISODate`), deliberately avoiding native `Date.toISOString()`.
- **Justification:**
  - **Preventing Off-By-One Day Shifts:** Standard JavaScript `Date.toISOString()` forces timestamps into UTC (`Z`). In local timezones ahead of UTC (e.g. BST `UTC+1` or IST `UTC+5:30`), a record logged at local midnight shifts to 23:00 or 18:30 on the preceding calendar day, corrupting historical logs and daily sum calculations.
  - **Local Parsing Consistency:** Parsing `YYYY-MM-DD` with `new Date("YYYY-MM-DD")` is treated by ECMAScript as UTC midnight, causing the same shifting bug when formatted in local time. HealthMate's `parseISODate` splits `[year, month, day]` and feeds numeric components to `new Date(year, month - 1, day)`, guaranteeing that the date stays pegged to the user's local calendar day across all regions and daylight saving adjustments.
