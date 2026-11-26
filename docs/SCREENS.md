# HealthMate — Screens, Navigation Flow & Wireframes

All screens are registered through Expo Router in `app/` and delegate rendering strictly to feature screen modules under `src/features/*/screens/`. Screens contain **zero SQL and zero domain calculations**; they subscribe to ViewModel state and dispatch ViewModel actions.

---

## Navigation Overview

```text
app/_layout.js (Root Stack: initDatabase -> seedDatabase -> loadSettings + <Toast />)
 ├── (tabs) [app/(tabs)/_layout.js — Bottom Tab Navigator]
 │    ├── index    ("Home")     -> DashboardScreen
 │    ├── history  ("History")  -> HistoryScreen
 │    └── settings ("Settings") -> SettingsScreen
 └── record-form [presentation: 'modal'] -> RecordFormScreen
```

- **Double-tap guard:** Forward modal navigation uses `safePush(router, target)` (`src/core/utils/navigation.js`) with a 400ms cooldown so rapid taps never stack duplicate `/record-form` screens.
- **Web deep-link / refresh safety:** Closing or finishing `/record-form` calls `safeGoBack(router, '/')`, which runs `router.back()` only when `router.canGoBack()` is true and falls back to `router.replace('/')` when opened directly by URL.

---

## 1. Dashboard Screen (`app/(tabs)/index.js` -> `DashboardScreen.js`)

- **Purpose:** Gives the user a calm, immediate daily snapshot: greeting (`Good morning` / `afternoon` / `evening` / `night`), animated daily goal rings, neutral `"vs yesterday"` cards, consecutive-day streak banner, and an interactive 7-day bar chart.
- **ViewModel:** `useDashboardViewModel()` (`useDashboardStore`, `useRecordsStore`, `useSettingsStore`).
- **Key Components:**
  - `ScreenContainer` (`scroll`, `RefreshControl` pull-to-refresh)
  - `LoadingState` / `ErrorState` (with `retry`)
  - `HeroProgressCard` (3 responsive `ProgressRing` gauges + dynamic calm encouragement banner + `"Log Today"` CTA when empty)
  - `MetricCard` x3 (`steps`, `calories`, `water` with `vs yesterday` badges)
  - `StreakBannerCard` (flame icon + `"X-day streak"` message + `Xd` badge)
  - `WeeklySummaryCard` (3 selectable metric tabs, 7-day total & daily average callout, plain-View `AnimatedWeeklyBar` chart highlighting today)
  - `FloatingActionButton` (`plus`, opens `/record-form`)
- **Navigation Flow:** Refreshes automatically on tab focus (`useFocusEffect`) and when records/goals update; tapping `"Log Today"` or `+` FAB calls `safePush(router, '/record-form')`.

### Text Wireframe — Dashboard

```text
+----------------------------------------------------+
| Tue, 24 Nov 2026                                   |
| Good morning                       [2 entries today]|
|                                                    |
| +------------------------------------------------+ |
| | Today's Progress                         [76%] | |
| |                                                | |
| |   ( 7.6k )        ( 380 )        ( 1.6k )      | |
| |    steps           kcal             ml         | |
| |    Steps          Calories        Water        | |
| |  of 10,000         of 500        of 2,000      | |
| |                                                | |
| |  [You're halfway there! 76% toward goals]      | |
| +------------------------------------------------+ |
|                                                    |
| Today's Totals                        vs yesterday |
| +------------------------------------------------+ |
| | (o) Steps        7,600 steps    [↑ 1,200 vs yd]| |
| | (o) Calories       380 kcal     [↓ 40 vs yd]   | |
| | (o) Water        1,600 ml       [Same as yd]   | |
| +------------------------------------------------+ |
|                                                    |
| This week                              Last 7 days |
| +------------------------------------------------+ |
| | (🔥) 4-day streak. Keep it up!           [4d]  | |
| +------------------------------------------------+ |
| | Weekly Summary                     6 days logged| |
| | [ Steps ]   [ Calories ]   [ Water ]           | |
| | 7-day total: 54,120 steps | Daily avg: 7,731   | |
| |  6.4k  8.9k  4.1k 10.2k  7.8k  9.6k [9.3k]     | |
| |   W     T     F     S     S     M    [T]   (+) | |
| +------------------------------------------------+ |
| [ Home ]           [ History ]        [ Settings ] |
+----------------------------------------------------+
```

---

## 2. History Screen (`app/(tabs)/history.js` -> `HistoryScreen.js`)

- **Purpose:** Lets users browse, filter, sort, edit, delete, and export logged entries without cluttering the list.
- **ViewModel:** `useRecordsStore` (`records`, `searchDate`, `rangeStart`, `rangeEnd`, `sortOrder`, `isExporting`, `selectFilteredRecords`).
- **Key Components:**
  - `HistoryToolbar` containing:
    - `DateSearchBar` (pill calendar row opening native Android/iOS `DateTimePicker` or Web date input)
    - Compact action buttons: **Date range**, **Sort** (`Newest` / `Oldest` / `Most steps` / `Most water`), and **Export** (`CSV`)
    - Dismissible active-filter chip (`Filtered: ...` or `Range: ...` with `×` clear button)
  - `FlatList` of `FadeInView` + `HistoryRecordCard` rows (each card shows relative/formatted date heading, 48dp Edit `pencil-outline` and Delete `trash-can-outline` buttons, and metric pills)
  - `EmptyState` (adapts copy for empty DB vs single-date mismatch vs range mismatch, with **Clear filter** or **Add entry** button)
  - Supporting Modals:
    - `DateRangeModal` (From/To bottom sheet validating `From <= To` and no future dates)
    - `SortMenuModal` (radio-style menu for `newest`, `oldest`, `most_steps`, `most_water`)
    - `ConfirmDeleteModal` (bounded scrollable card asking confirmation before `removeRecord(id)`)
  - `FloatingActionButton` (`plus`, opens `/record-form`)
- **Navigation Flow:** Tapping Edit passes `{ pathname: '/record-form', params: { id: String(record.id) } }` via `safePush`; tapping `+` opens `/record-form` in Add mode.

### Text Wireframe — History

```text
+----------------------------------------------------+
| Daily Activity Log                                 |
| History                                [11 entries]|
|                                                    |
| [ 📅 Filter by date                           v ]  |
| [ Date range ]   [ Newest ]   [ Export CSV ]       |
| ( Filtered: Tue, 18 Aug 2026 [x] )  <- when active |
|                                                    |
| +------------------------------------------------+ |
| | Today                          [Edit] [Delete] | |
| | Tue, 24 Nov 2026                               | |
| | ---------------------------------------------- | |
| | (walk) 5,400 steps  (fire) 270 kcal  (wtr) 1.4k| |
| +------------------------------------------------+ |
| | Yesterday                      [Edit] [Delete] | |
| | Mon, 23 Nov 2026                               | |
| | (walk) 8,650 steps  (fire) 420 kcal  (wtr) 2.1k| |
| +------------------------------------------------+ |
|                                              (+)   |
| [ Home ]           [ History ]        [ Settings ] |
+----------------------------------------------------+
```

---

## 3. Add / Edit Entry Screen (`app/record-form.js` -> `RecordFormScreen.js`)

- **Purpose:** Low-effort modal form for creating a new record or editing an existing one, featuring friendly date selection, numeric keypads, `next -> done` keyboard progression, and one-tap quick-add chips.
- **ViewModel:** `useRecordsStore` (`addRecord`, `editRecord`, `getRecordForEdit`, `lastSaveStatus`).
- **Key Components:**
  - `KeyboardAvoidingView` wrapping `ScreenContainer` (`scroll`, `maxWidth: 720`, `automaticallyAdjustKeyboardInsets`)
  - `LoadingState` & `ErrorState` (for malformed route IDs, missing/deleted entries, or DB errors, paired with `"Go Back"`)
  - `PressableScale` Close (`×`) button (`48dp`, calls `safeGoBack(router)`)
  - Friendly tappable Date row (`Today · Tue, 24 Nov 2026` + `Change`) opening native `DateTimePicker` (iOS modal spinner / Android dialog / Web `<input type="date">` guarded against future or invalid dates)
  - Three `AppTextInput` fields + quick-add `QuickChip` pairs:
    - Steps (`+1000`, `+2500`) -> `returnKeyType="next"` focuses Calories
    - Calories Burned (`+50`, `+100`) -> `returnKeyType="next"` focuses Water
    - Water (`+250`, `+500`) -> `returnKeyType="done"` triggers `handleSubmit()`
  - Primary **Save Entry** / **Update Entry** button (`loading={isSaving}`) & Secondary **Cancel** button
- **Navigation Flow:** Entered from Dashboard/History `+` FAB (create) or History card Edit icon (edit with `?id=...`). On valid save, triggers `showSuccessToast('Entry saved. Great work!')` and exits via `safeGoBack(router)`.

### Text Wireframe — Add / Edit Entry Modal

```text
+----------------------------------------------------+
| New Health Log                                     |
| Add Entry                                    ( x ) |
|                                                    |
| +------------------------------------------------+ |
| | Date                                           | |
| | [ 📅 Today · Tue, 24 Nov 2026     Change 📝 ]  | |
| |                                                | |
| | Steps                                          | |
| | [ 🚶 e.g. 7500                        steps ]  | |
| |   (+1000)   (+2500)                            | |
| |                                                | |
| | Calories Burned                                | |
| | [ 🔥 e.g. 450                          kcal ]  | |
| |   (+50)     (+100)                             | |
| |                                                | |
| | Water (ml)                                     | |
| | [ 💧 e.g. 1500                           ml ]  | |
| |   (+250)    (+500)                             | |
| |                                                | |
| | [ ✓ Save Entry                             ]   | |
| | [ Cancel                                   ]   | |
| +------------------------------------------------+ |
+----------------------------------------------------+
```

---

## 4. Settings Screen (`app/(tabs)/settings.js` -> `SettingsScreen.js`)

- **Purpose:** Configures personalized daily goals used by the Dashboard rings, applies immediate app-wide theme overrides, shows app version metadata, and lets users restore 10-day sample records.
- **ViewModel:** `useSettingsStore` (`dailyGoals`, `themeMode`, `isSavingGoals`, `isSeeding`, `saveDailyGoals`, `resetDailyGoals`, `setThemeMode`, `reseedSampleData`) + `useRecordsStore` (`loadRecords`, `loadTodayTotals`).
- **Key Components:**
  - `KeyboardAvoidingView` + `ScreenContainer` (`scroll`)
  - **Daily goals** `AppCard`: 3 `AppTextInput` fields (`Steps` `500–50,000`, `Calories Burned` `100–5,000`, `Water (ml)` `500–6,000`), inline range validation, **Save Goals**, and **Reset to Defaults** when customized.
  - **Appearance** `AppCard`: live mode summary + `ThemeSegmentedControl` (`System`, `Light`, `Dark`).
  - **About HealthMate** `AppCard`: app icon badge, name, `Version 1.0.0` (from `expo-constants` / `app.json`), and local-privacy statement.
  - **Sample Data** `AppCard`: **Restore Sample Records** secondary button triggering `reseedSampleData()` + refreshing records and showing a confirmation Toast.
- **Navigation Flow:** Accessed directly via the Settings bottom tab; theme changes update `useThemeStore` immediately with zero navigation reload.

### Text Wireframe — Settings

```text
+----------------------------------------------------+
| Preferences                                        |
| Settings                                           |
|                                                    |
| +------------------------------------------------+ |
| | Daily goals                                    | |
| | Set personal targets for your Dashboard...     | |
| | Steps          [ 🚶 10000             steps ]  | |
| | Calories       [ 🔥 500                kcal ]  | |
| | Water (ml)     [ 💧 2000                 ml ]  | |
| | [ ✓ Save Goals                             ]   | |
| | ( ↺ Reset to Defaults )                        | |
| +------------------------------------------------+ |
| | Appearance                                     | |
| | Following system setting (currently Light)     | |
| | [ [System] | Light | Dark ]                    | |
| +------------------------------------------------+ |
| | About HealthMate  · Version 1.0.0              | |
| | Calm daily tracking... stored locally in SQLite| |
| +------------------------------------------------+ |
| | Sample Data                                    | |
| | [ 🔄 Restore Sample Records                ]   | |
| +------------------------------------------------+ |
| [ Home ]           [ History ]        [ Settings ] |
+----------------------------------------------------+
```
