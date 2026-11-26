# HealthMate — Libraries & Dependencies

Every package listed in `package.json` is documented below, distinguishing **directly imported application dependencies** from **Expo framework / native peer runtime packages** managed by Expo SDK 58 (`~58.0.26`).

---

## 1. Directly Imported Application Libraries

| Package | Version | Why It Was Chosen | Where Used |
| :--- | :--- | :--- | :--- |
| `react` | `19.3.0` | Core declarative UI library powering component state, memoization, and hooks across mobile and web. | All JSX screens & components |
| `react-native` | `0.88.1` | Native cross-platform UI primitives (`View`, `FlatList`, `Modal`, `Animated`, `KeyboardAvoidingView`, `ScrollView`, `TextInput`). Built-in `Animated` provides smooth 150–300ms motion with zero extra animation dependencies. | Core & feature UI modules |
| `expo-router` | `~58.0.32` | File-based navigation (`app/`), nested Bottom Tabs + Modal stack presentation, `useFocusEffect`, `useLocalSearchParams`, and URL deep-linking hygiene without boilerplate React Navigation wiring. | `app/_layout.js`, `app/(tabs)/*`, screens, `navigation.js` |
| `expo-sqlite` | `~58.0.18` | Official modern Expo embedded SQLite module (`openDatabaseAsync`, parameterized queries, transactions, and web WASM support). Replaces Flutter's `sqflite` within the React Native / Expo ecosystem. | `src/core/database/database.js` |
| `zustand` | `^5.1.0` | Ultra-lightweight selector-based state management mapping cleanly to MVVM ViewModels without Context provider trees or Redux boilerplate, plus `.getState()` access during app boot and callbacks. | `useRecordsStore`, `useDashboardStore`, `useSettingsStore`, `useThemeStore`, `useToastStore` |
| `react-native-svg` | `15.16.0` | Crisp vector `<Svg>` and `<Circle>` gauges for the Dashboard `ProgressRing` without adding heavy third-party charting libraries. | `src/core/components/ProgressRing.js` |
| `@react-native-community/datetimepicker` | `9.2.1` | Native iOS spinner modal and Android system calendar dialog for date selection on mobile (paired with `<input type="date">` fallback on web). | `RecordFormScreen.js`, `DateSearchBar.js`, `DateRangeModal.js` |
| `@expo/vector-icons` | `^15.0.2` | Bundled vector icon fonts allowing `MaterialCommunityIcons` exclusively across tabs, metrics (`walk`, `fire`, `water`), buttons, toolbars, and states. | Tabs, buttons, cards, toolbars, modals |
| `expo-file-system` | `~58.0.14` | Modern Expo file API (`File`, `Paths.cache`) to write generated CSV files cleanly into the app cache directory on mobile without manual permission prompts. | `useRecordsStore.js` (`exportCsv`) |
| `expo-sharing` | `~58.0.23` | Opens the native iOS/Android share sheet for the cached CSV export file (`text/csv`, UTI `public.comma-separated-values-text`). | `useRecordsStore.js` (`exportCsv`) |
| `expo-constants` | `~58.0.16` | Reads app metadata (`Constants.expoConfig.version` / `name`) dynamically for the "About HealthMate" card in Settings. | `SettingsScreen.js` |

---

## 2. Core Expo & Native Runtime Dependencies (`package.json`)

Installed as part of the Expo SDK 58 managed template so native navigation transitions, gestures, splash screen, fonts, system appearance, and web rendering operate reliably:

| Package | Version | Runtime Role |
| :--- | :--- | :--- |
| `expo` | `~58.0.26` | Managed Expo SDK runtime, CLI (`npx expo start`, `expo export`), config plugin loader, and native module autolinking. |
| `react-native-screens` | `~4.30.1` | Native navigation container optimizations backing Expo Router's `<Stack>` and `<Tabs>` transitions. |
| `react-native-safe-area-context` | `~5.11.1` | Native safe-area inset provider mounted by Expo Router for notch/home-indicator handling. |
| `react-native-gesture-handler` | `~3.3.0` | Native touch/gesture recognition required by Expo Router navigation stacks. |
| `react-native-reanimated` & `react-native-worklets` | `4.7.1` / `0.13.0` | Expo Router / SDK 58 peer navigation & animation runtime dependencies. |
| `react-dom` & `react-native-web` | `19.3.0` / `~0.21.4` | Renders React Native primitives in the browser for local web previews and static bundle exports (`localhost:8081`). |
| `expo-linking` | `~58.0.17` | URL scheme (`"scheme": "healthmate"`) and route resolution used internally by `expo-router`. |
| `expo-splash-screen` | `~58.0.14` | Manages native launch splash screen display (`app.json` plugin config). |
| `expo-font` | `~58.0.12` | Asynchronous font asset loading backing `@expo/vector-icons`. |
| `expo-status-bar` & `expo-system-ui` | `~58.0.5` / `~58.0.7` | System UI background (`userInterfaceStyle: "automatic"`) and status bar integration. |
| `expo-device`, `expo-glass-effect`, `expo-image`, `expo-symbols`, `expo-web-browser`, `@expo/ui` | `~58.0.5` / `~58.0.5` / `~58.0.18` / `~58.0.5` / `~58.1.0` / `~58.0.29` | Default Expo SDK 58 template modules retained for SDK runtime compatibility. |

---

## 3. Development & Testing Dependencies

| Package | Version | Why It Was Chosen |
| :--- | :--- | :--- |
| `jest` | `~30.5.2` | Industry-standard JavaScript test runner executing fast unit test suites (`npm test`) with fake calendar timers (`jest.setSystemTime`) for date, validation, CSV, and dashboard derivation tests. |
| `jest-expo` | `~58.0.15` | Official Expo SDK 58 Jest preset providing Metro-compatible transforms and React Native globals without fragile custom Babel configuration. |
