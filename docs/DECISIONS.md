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

## 4. Navigation: `Expo Router` (File-Based Navigation vs. Imperative React Navigation)
- **Decision:** Use `Expo Router` with bottom tabs (`app/(tabs)/_layout.js`) and stack/modal routes (`app/record-form.js`).
- **Justification:**
  - **File-Based Routing Convention:** Traditional React Navigation requires manual registration of screen stacks, nested navigator components, and verbose linking configuration objects. Expo Router automatically derives navigation hierarchy from the file system (`app/`), mirroring modern industry conventions (like Next.js App Router).
  - **Strict Architectural Separation:** By having `app/` contain only route definitions, files in `app/` remain thin wrappers that import screens from `src/features/`. Route files contain zero presentation styling and zero logic, perfectly reinforcing our MVVM separation.
  - **Route Groups & URL Hygiene:** Route groups using parentheses (e.g. `(tabs)`) allow grouping bottom navigation screens without adding artificial path segments (`/` instead of `/tabs/index`), ensuring clean routing and simple deep linking.
  - **Modal Handling:** Declarative presentation flags (`presentation: 'modal'`) in `_layout.js` enable native modal slide-up transitions on mobile and accessible overlay behaviors on web without complex custom transition spec objects.
  - **Built-in Deep Linking & Accessibility:** Screen titles, screen reader accessibility announcements, and URL query handling (`useLocalSearchParams()`) are deeply integrated out of the box.

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

## 11. State Management: Choosing Zustand over React Context API and Redux Toolkit
- **Decision:** Adopt `zustand` as the state management backbone for all feature ViewModels.
- **Justification:**
  - **Comparison with React Context API:**
    - *Render Performance:* In React Context, any state modification causes *every* consuming component in the tree to re-render, regardless of whether that component cares about the modified property. For instance, updating `todayTotals` would trigger unwanted re-renders of record lists and filter forms. Zustand uses selector-based subscriptions (`useRecordsStore(state => state.todayTotals)`), ensuring components re-render strictly when their targeted state slice changes.
    - *No Provider Wrapping:* Context requires wrapping the application hierarchy in nested providers (`<RecordsProvider>`, `<ThemeProvider>`, etc.), creating visual clutter and artificial component nesting. Zustand stores are global singletons accessible anywhere without providers.
    - *Outside-Component Access:* Context values can only be accessed inside React component bodies via hooks. Zustand stores expose `.getState()` and `.setState()`, enabling seamless reads and dispatches from background tasks, utility routines, or test scripts.
  - **Comparison with Redux Toolkit (RTK):**
    - *Minimal Boilerplate:* Redux requires distinct definitions for action types, creators, slices, reducers, selectors, and thunk middleware. In Zustand, state properties and async actions live together inside a single intuitive factory.
    - *Bundle Size & Simplicity:* Redux and RTK add significant bundle weight (~12–15 kB minified). Zustand has an ultra-lightweight footprint (~1.1 kB) and zero external dependencies, perfect for a lean coursework mobile app where data storage is already governed by SQLite.
    - *Natural Fit for MVVM:* Zustand stores act as pure ViewModels: UI components simply subscribe to reactive store state and dispatch actions, while the store handles business logic, invokes domain validators, and orchestrates repository calls.

## 12. Automated Testing Approach: `Jest` with `jest-expo`
- **Decision:** Adopt `Jest` paired with the official `jest-expo` preset (`__tests__/` outside `app/`) focused on unit testing pure Model, Utility, and ViewModel derivation functions (`validateRecord`, `dateUtils`, `csv`, and Dashboard progress, comparison, encouragement, weekly, and streak logic).
- **Justification:**
  - **Expo Ecosystem Alignment:** `jest-expo` mirrors Metro's module resolution, Babel transforms, and React Native globals for SDK 58 without brittle manual Babel or environment configuration.
  - **Router Safety:** Keeping test files inside a top-level `__tests__/` directory rather than under `app/` ensures Expo Router never treats test modules as navigable screen routes.
  - **MVVM Testability Payoff:** Because validation, local calendar math, CSV serialization, daily goal ratios, encouragement messaging, weekly averages, and streak counting live in pure functions, tests run deterministically with Jest fake timers (`jest.setSystemTime`) without live SQLite connections or fragile UI snapshots.
  - **Regression Evidence:** Provides repeatable automated verification via `npm test` covering boundary cases (blank fields, negatives, decimals, maximum limits, future dates, leap days, month rollovers, CSV quoting, empty weeks, and active vs. broken streaks).

## 13. Navigation Guardrails (`safeGoBack` & `safePush`)
- **Decision:** Centralize navigation helpers in `src/core/utils/navigation.js` rather than calling `router.back()` or `router.push()` directly inside screens.
- **Justification:**
  - **Web Direct-URL Safety:** Refreshing or deep-linking directly to `/record-form` leaves Expo Router without stack history, causing an unhandled `GO_BACK` exception. `safeGoBack` checks `router.canGoBack()` first and falls back to `router.replace('/')`.
  - **Rapid Double-Tap Protection:** `safePush` enforces a 400ms cooldown between modal pushes so eager double taps on the Dashboard or History `+` FAB / Edit buttons never open stacked duplicate modals.

## 14. Responsive Orientation & Soft-Keyboard Handling
- **Decision:** Set `"orientation": "default"` in `app.json`, constrain scrollable screen content to `maxWidth: 720`, place `<KeyboardAvoidingView>` outside `<ScreenContainer scroll>`, and enable `keyboardDismissMode="interactive"` + `automaticallyAdjustKeyboardInsets`.
- **Justification:**
  - Users can rotate freely to landscape on phones and tablets without clipping modals (`ConfirmDeleteModal` wraps content inside a `maxHeight: '88%'` `ScrollView`) or stretching forms uncomfortably across wide screens.
  - Lower form inputs (`Water (ml)` and `Daily Water Goal`) shift reliably above the soft keyboard on both iOS and Android.

## 15. Production Hygiene: Screen-to-DB Isolation & Removal of Dev Scaffolding
- **Decision:** Remove temporary developer screens (`app/dev-gallery.js`, `src/core/database/testCrud.js`), keep repositories importing `getDb` directly from `src/core/database/database.js`, and route Settings sample-data seeding through `useSettingsStore.reseedSampleData()`.
- **Justification:**
  - Ensures **zero SQL queries and zero database imports** inside UI screens (even Settings sample-data restore routes strictly through the ViewModel).
  - Eliminates require cycles permanently and keeps the shipped route tree clean (`/`, `/history`, `/settings`, `/record-form`).
