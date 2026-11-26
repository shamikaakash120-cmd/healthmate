# HealthMate - Issues Log

This log records every error, issue, or unexpected behavior encountered during development, along with its root cause and the fix applied.

---

## Log Template
### [YYYY-MM-DD] Issue Title
- **Symptom:** Description of the error or unexpected behavior.
- **Root Cause:** Explanation of why it occurred.
- **Fix:** Step-by-step resolution applied.
- **Prevention:** Best practices to prevent recurrence.

---

### [2026-11-21] Network Restriction in Sandbox during Project Init
- **Symptom:** `npx create-expo-app` failed with `ENOTFOUND registry.npmjs.org`.
- **Root Cause:** Standard Sandbox execution isolates network access.
- **Fix:** Ran initialization and package installation with explicit network approval.
- **Prevention:** Execute all offline file/build commands inside sandbox and limit network-dependent commands to package installations.

### [2026-11-21] Non-Empty Directory Conflict on Create-Expo
- **Symptom:** `create-expo` refused to initialize in the project folder due to existing files.
- **Root Cause:** Initial repo contained default repository files (`README.md`).
- **Fix:** Temporarily backed up `README.md`, initialized Expo project with default template, and restored project documentation.
- **Prevention:** Initialize new templates in clean workspaces or handle pre-existing repository artifacts before templating.

### [2026-11-23] Stale TSX Buffer and Missing tsconfig.json in VS Code Problems Panel
- **Symptom:** VS Code's Problems panel reported 8 errors: 6 module resolution errors on `src/app/index.tsx` (`@/components/...`) and 2 config errors on `tsconfig.json` (`No inputs found`, `expo/tsconfig.base not found`).
- **Root Cause:** When `create-expo-app` generated the project, default TypeScript template files (`src/app/index.tsx`, `tsconfig.json`) were opened in VS Code editor tabs. When boilerplate files were purged to implement the JavaScript MVVM architecture, the open editor tab in VS Code remained in-memory as an unsaved/stale buffer. The TypeScript language server in VS Code continued evaluating the in-memory `.tsx` buffer and searched for the deleted `tsconfig.json`. Neither file existed on disk.
- **Fix:** Added `jsconfig.json` configuring VS Code explicitly for a JavaScript / React Native project, and instructed closing the stale, deleted `index.tsx` editor tab.
- **Prevention:** After deleting or restructuring template files, close any open editor tabs in VS Code and reload the window (`Ctrl+Shift+P` -> `Developer: Reload Window`).

### [2026-11-23] Git Network Failure: Could Not Resolve Host (github.com)
- **Symptom:** VS Code Git output logged `fatal: unable to access 'https://github.com/shamikaakash120-cmd/healthmate.git/': Could not resolve host: github.com` during `git pull --tags origin main`.
- **Root Cause:** A momentary drop in internet connectivity or temporary DNS resolution failure on the client machine when Git attempted to query GitHub.
- **Fix:** Tested and confirmed DNS resolution to `github.com` (IP: `20.247.166.64`) and verified remote connection with `git ls-remote`. Network connectivity is restored.
- **Prevention:** For transient DNS interruptions, verify network connection or flush DNS cache with `ipconfig /flushdns` before re-syncing.

### [2026-11-23] Expo SQLite Web Worker WASM Resolution
- **Symptom:** Metro bundler failed during web export with `Unable to resolve "./wa-sqlite/wa-sqlite.wasm" from "node_modules/expo-sqlite/web/worker.ts"`.
- **Root Cause:** Metro's default asset configuration does not include `.wasm` files in `resolver.assetExts`, preventing `expo-sqlite`'s web worker from resolving its WebAssembly database binary.
- **Fix:** Created `metro.config.js` appending `'wasm'` to `config.resolver.assetExts`.
- **Prevention:** Always include wasm asset extension support in Metro when using `expo-sqlite` with multi-platform / web capabilities.

### [2026-11-25] GO_BACK Action Unhandled by Navigator
- **Symptom:** Browser console logged `"The action 'GO_BACK' was not handled by any navigator."` when tapping Cancel or the close (×) icon in the RecordFormScreen, or after saving an entry, particularly when the route was accessed directly by URL (no prior navigation history).
- **Root Cause:** `router.back()` was called unconditionally in RecordFormScreen (close icon, Cancel button, and after-save handler). On web, when a user navigates directly to `/record-form` by URL, the Expo Router stack has no history, so there is no screen to go back to. `router.back()` triggers an unhandled `GO_BACK` action instead of gracefully falling back to a known route.
- **Fix:** Created `src/core/utils/navigation.js` exporting `safeGoBack(router, fallbackHref = '/')`. It guards with `router.canGoBack()`: if history exists it calls `router.back()`; otherwise it calls `router.replace(fallbackHref)` to redirect to the Home tab. All three `router.back()` calls in `RecordFormScreen.js` were replaced with `safeGoBack(router)`.
- **Files changed:** `src/core/utils/navigation.js` (new), `src/features/records/screens/RecordFormScreen.js`
- **Prevention:** Never call `router.back()` directly — always use `safeGoBack`. On web, any route can be opened by URL with no history. Add an ESLint rule or code-review checklist item: flag direct `router.back()` usage outside the navigation helper.

### [2026-11-25] Require Cycle: database/index.js → testCrud → records/repository → database/index.js
- **Symptom:** Metro console warned: `"Require cycle: src/core/database/index.js → testCrud.js → src/features/records/repository/index.js → recordRepository.js → src/core/database/index.js"`. This can cause modules to receive `undefined` exports at runtime, leading to subtle bugs.
- **Root Cause:** Two independent problems combined to form the cycle. (1) `src/core/database/index.js` re-exported everything from `./testCrud`, which imports from `src/features/records/repository`. (2) `recordRepository.js` imported `getDb` from `'../../../core/database'` (the barrel `index.js`) rather than directly from `database.js`, closing the circle. Metro resolves modules synchronously; a module can receive an incomplete (partially-initialized) version of a module it depends on when a cycle exists.
- **Fix:** Three targeted changes: (a) Removed `export * from './testCrud'` from `src/core/database/index.js` and added a comment explaining why. (b) Changed `recordRepository.js` to import `getDb` from `'../../../core/database/database'` (the concrete file, not the barrel). (c) Updated `app/dev-gallery.js` to import `runCrudTest` directly from `'../src/core/database/testCrud'` and `seedDatabase` from the barrel separately.
- **Files changed:** `src/core/database/index.js`, `src/features/records/repository/recordRepository.js`, `app/dev-gallery.js`
- **Prevention:** Never export dev/test utilities (e.g. `testCrud`) from production barrel files. Keep test helpers in isolated files imported only by dev screens. When a repository needs a database connection, import from the concrete module (`database.js`), not a barrel that also aggregates higher-level features.

### [2026-11-25] React DOM Warning: `collapsable` Attribute on SVG `<circle>`
- **Symptom:** Browser console logged `"Received `false` for a non-boolean attribute `collapsable`."` whenever `ProgressRing` rendered (on the Dashboard and Dev Gallery).
- **Root Cause:** `ProgressRing.js` wrapped `react-native-svg`'s `<Circle>` with `Animated.createAnimatedComponent(Circle)`. On web, `react-native-web`'s `useAnimatedProps` unconditionally injects `collapsable: false` into the reduced props, and `react-native-svg`'s `WebShape` forwards it onto the DOM `<circle>` element, triggering the React 19 non-boolean DOM attribute error.
- **Fix:** Removed `Animated.createAnimatedComponent(Circle)` from `src/core/components/ProgressRing.js` and rendered a plain `<Circle>` instead. Added React state (`animatedRatio`) updated via `animatedProgress.addListener(...)` inside `useEffect` while running `Animated.timing` over 300ms (`useNativeDriver: false`), removing the listener and stopping the animation in the effect cleanup function. Audited the entire codebase and confirmed no other `Animated.createAnimatedComponent` usage on SVG elements exists.
- **Files changed:** `src/core/components/ProgressRing.js`
- **Prevention:** Do not wrap `react-native-svg` elements (`Circle`, `Path`, `Rect`, etc.) with `Animated.createAnimatedComponent` when targeting React 19 / `react-native-web`. Drive animated SVG attributes via React state synced from `Animated.Value.addListener` or `requestAnimationFrame` with proper cleanup.

### [2026-11-25] UI/UX Consistency Audit: Accessibility Grouping, Dark-Mode Contrast, Hard-Coded Tokens & Layout Polish
- **Symptom:** A full design-system audit surfaced several subtle cross-screen issues: (1) `EmptyState` and `HeroProgressCard` placed `accessible` / `accessibilityLabel` on parent containers wrapping interactive `AppButton` CTAs, swallowing screen-reader focus; (2) dark mode `primaryText` (`#FFFFFF`) on lightened teal (`#3EB4A5`) and pastel metric fills yielded low contrast; (3) `QuickChip`, modal close/header buttons, `HistoryToolbar` action buttons, and `WeeklySummaryCard` tabs fell below 48dp touch targets; (4) hard-coded `rgba(...)` scrims, `#FFFFFF`/`#000` colors, fixed tab-bar height (`62dp`), and narrow layouts caused font-scaling fragility; and (5) `Toast` passed `useNativeDriver: true` on web and overlapped the bottom tab bar.
- **Root Cause:** Early components defined literal colors (`'#FFFFFF'`, `'rgba(...)'`), fixed pixel heights, and container-level accessibility labels before the complete token set (`overlay`, `elevatedShadow`, `touchTarget`) and cross-platform rules were finalized.
- **Fix:** Added `overlay`, `shadow`, `elevatedShadow`, `touchTarget`, and high-contrast dark `primaryText` (`#0F1A1C`) tokens in `src/core/theme/`; added safe-area `edges` props on tab screen containers; moved `accessible` wrappers off button parents in `EmptyState` and `HeroProgressCard`; enforced 48dp minimum touch targets and `flexWrap` layouts across buttons, chips, toolbars, tabs, and modals; lifted `Toast` above the tab bar and added calm 150–280ms `Animated` motion primitives (`PressableScale`, `FadeInView`, `AnimatedWeeklyBar`, and smooth `Toast` fade/slide with `Platform.OS !== 'web'` native driver).
- **Files changed:** `src/core/theme/colors.js`, `src/core/theme/shadows.js`, `src/core/theme/index.js`, `src/core/components/PressableScale.js` *(new)*, `src/core/components/FadeInView.js` *(new)*, `src/core/components/*`, `app/_layout.js`, `app/(tabs)/_layout.js`, `app/dev-gallery.js`, and Dashboard / History / Records / Settings screens and components.
- **Prevention:** Always source colors, shadows, overlays, and minimum 48dp touch targets exclusively from `useTheme()`, avoid nesting interactive buttons inside `accessible` text wrappers, and test layouts at large accessibility font scales (`flexWrap`) and in dark mode.

### [2026-11-26] Stale Metro Cache & Direct DB Import Cleanup (`Requiring unknown module` / Remaining Barrel Edge)
- **Symptom:** During the final cleanup pass (deleting `app/dev-gallery.js` and `src/core/database/testCrud.js`), the browser console and Metro HTTP endpoints logged `"Requiring unknown module \"1024\""` / `"845"` / `"872"`, `TransformError` mid-edit JSX mismatch in `SettingsScreen.js`, `"Route dev-gallery is extraneous"`, and `"Disconnected from Metro (1006)"`. In addition, `src/features/records/repository/recordRepository.js` still imported `getDb` from `'../../../core/database'` (the barrel) instead of `'../../../core/database/database'`.
- **Root Cause:** (1) An earlier Metro dev process kept running across file deletions and JSX edits, corrupting its incremental SSR / lazy split-bundle numeric module map (`845`, `872`, `1024`). (2) `recordRepository.js` line 10 had remained pointed at the `core/database` barrel.
- **Fix:** Updated `recordRepository.js` to import `getDb` directly from `'../../../core/database/database'`, verified zero syntax errors, zero unresolved imports, and zero require cycles across all 71 source files via `@babel/parser`, confirmed `app/_layout.js` defines only `(tabs)` and `record-form`, and verified a clean `npx expo start -c` server serves all HTML routes and lazy split bundles with HTTP `200`.
- **Files changed:** `src/features/records/repository/recordRepository.js`, `src/core/database/index.js`, `app/_layout.js`, `src/features/settings/screens/SettingsScreen.js`, `app/dev-gallery.js` *(deleted)*, `src/core/database/testCrud.js` *(deleted)*.
- **Prevention:** Always keep repository imports pointing directly at `src/core/database/database.js` (never barrel `index.js`), stop Metro and run `npx expo start -c` with a browser hard-reload (`Ctrl+Shift+R`) after deleting routes or refactoring barrel files.

### [2026-11-26] Hardening: Rapid Double-Tap Protection, Invalid Route IDs, Keyboard Overlap & Rotation
- **Symptom:** Edge-case review identified four UX hazards: (1) tapping `+` or Edit rapidly could stack multiple `/record-form` modals; (2) opening `/record-form?id=invalid` or a deleted ID silently fell back to an empty Add Entry screen instead of reporting the missing record; (3) bottom inputs inside `ScreenContainer scroll` had `KeyboardAvoidingView` nested inside the `ScrollView` with `behavior={undefined}` on Android; and (4) `app.json` locked `"orientation": "portrait"` and `ConfirmDeleteModal` lacked bounded vertical scrolling on short landscape viewports.
- **Root Cause:** Missing cooldown debouncing on `router.push`, falsy coercion (`Boolean(Number(params.id))`), inverted `KeyboardAvoidingView` / `ScrollView` nesting, and hardcoded portrait lock.
- **Fix:** Added `safePush(router, target)` (400ms cooldown) in `src/core/utils/navigation.js`; added explicit positive-integer ID checks plus `LoadingState` / `ErrorState` ("Go Back" / retry) in `RecordFormScreen.js`; guarded invalid/future web dates in `RecordFormScreen.js` and `DateSearchBar.js`; moved `<KeyboardAvoidingView>` outside `<ScreenContainer scroll>` and unlocked `"orientation": "default"` in `app.json`; centered scrollable content up to `maxWidth: 720`; and bounded `ConfirmDeleteModal` inside an inner `ScrollView` (`maxHeight: '88%'`).
- **Files changed:** `app.json`, `src/core/utils/navigation.js`, `src/core/utils/dateUtils.js`, `src/core/components/ScreenContainer.js`, `src/features/dashboard/screens/DashboardScreen.js`, `src/features/history/screens/HistoryScreen.js`, `src/features/history/components/DateSearchBar.js`, `src/features/history/components/ConfirmDeleteModal.js`, `src/features/records/screens/RecordFormScreen.js`, `src/features/records/viewmodel/useRecordsStore.js`, `src/features/settings/viewmodel/useSettingsStore.js`, `src/features/settings/screens/SettingsScreen.js`.
- **Prevention:** Route all modal pushes through `safePush`, validate dynamic URL params strictly, and test both keyboard input and landscape rotation on physical devices.
