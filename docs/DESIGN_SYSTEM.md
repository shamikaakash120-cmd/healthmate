# HealthMate — Design System & UX Principles

HealthMate's visual system lives in `src/core/theme/` and is consumed reactively across every screen and component via `useTheme()`. No screen hard-codes hex colors, typography sizes, or shadows.

---

## 1. Colour Palette (`src/core/theme/colors.js`)

HealthMate intentionally avoids harsh neon fitness greens, aggressive reds, and sterile stark whites in favour of a **warm, soothing palette** that lowers daily tracking anxiety while preserving crisp legibility across both Light and Dark themes.

| Token | Light Hex / Value | Dark Hex / Value | Role & Psychological Reasoning |
| :--- | :--- | :--- | :--- |
| `background` | `#F7F5F0` | `#151C24` | Warm off-white paper canvas (Light) / deep low-glare slate (Dark) reduces eye fatigue. |
| `surface` | `#FFFFFF` | `#222D3B` | Clean elevated card container separating metrics cleanly from canvas. |
| `surfaceAlt` | `#EFECE6` | `#2B3848` | Subtle muted surface for input wells, badges, track fills, and segmented control tracks. |
| `primary` | `#2A9D8F` | `#3EB4A5` | Calm herbal teal; evokes balance and clarity rather than competitive urgency. Lightened in Dark mode for contrast. |
| `primaryText` | `#FFFFFF` | `#0F1A1C` | Text/icons on filled primary buttons. Deep dark-slate `#0F1A1C` ensures accessible contrast on `#3EB4A5` in Dark mode. |
| `text` | `#1F2D3D` | `#F3F5F7` | Deep warm slate (softer than `#000000`) / crisp light slate for high readability. |
| `textMuted` | `#6B7A8C` | `#94A3B8` | Secondary captions, timestamps, units, and subtle `"vs yesterday"` comparisons. |
| `border` | `#E2DFD8` | `#2F3E50` | Delicate hairline separator for cards, inputs, and tab bars. |
| `overlay` | `rgba(15, 23, 32, 0.45)` | `rgba(6, 10, 15, 0.65)` | Scrim behind Delete, Sort, Date Range, and iOS Date Picker modals. |
| `error` / `errorBg` | `#D9534F` / `#FDF2F2` | `#F08080` / `#382426` | Soft warm coral-red and gentle tint for helpful inline validation and destructive confirmations. |
| `success` / `successBg` | `#4CAF7D` / `#EDF7F1` | `#5ECB91` / `#1D3327` | Gentle herbal green used when daily goals are met and for success Snackbars. |
| `steps` / `stepsTint` | `#4CAF7D` / `#EDF7F1` | `#5ECB91` / `#1E3A2B` | Soft natural green symbolizing outdoor walking and steady daily movement. |
| `calories` / `caloriesTint` | `#E76F6F` / `#FDF1F1` | `#EF7E7E` / `#3C2426` | Soft terracotta/coral symbolizing metabolic warmth without visual alarm; also accents active streaks. |
| `water` / `waterTint` | `#4A90D9` / `#EDF4FC` | `#5EA1E6` / `#1F3147` | Oceanic sky-blue intuitively mapped to hydration and refreshment. |

---

## 2. Typography Scale (`src/core/theme/typography.js`)

Material Design 3-inspired proportions tuned for glanceable numbers and comfortable reading at larger OS accessibility font scales (`flexWrap` + line heights).

| Variant | Size (dp) | Line Height | Weight | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | `32` | `40` | `700` | `-0.5` | Hero highlights when full-screen numerals are emphasized. |
| `title` | `22` | `28` | `600` | `0` | Top-level screen titles (`History`, `Settings`, greeting, large ProgressRing value). |
| `heading` | `18` | `24` | `600` | `0.15` | Section & card headings (`Today's Progress`, `Weekly Summary`, modal headers). |
| `body` | `16` | `22` | `400` | `0.25` | Descriptions, form field values, date rows, encouragement text. |
| `caption` | `13` | `18` | `500` | `0.4` | Labels, units, timestamps, toolbar pills, validation errors, chips. |
| `metricNumber` | `28` | `34` | `700` | `-0.2` | Prominent numeric totals inside `MetricCard`. |

---

## 3. Spacing Grid, Radii, Touch Targets & Elevation

### 8-pt Spacing Scale (`src/core/theme/spacing.js`)

| Token | Value | Primary Application |
| :--- | :--- | :--- |
| `SPACING.xs` | `4dp` | Micro gaps, icon-to-label spacing, segmented track padding |
| `SPACING.sm` | `8dp` | Standard stack gaps (`MetricCard` stack, chip spacing, pill padding) |
| `SPACING.md` | `16dp` | Inner card padding (`AppCard`), input horizontal padding, form field spacing |
| `SPACING.lg` | `24dp` | Screen horizontal/vertical outer padding (`ScreenContainer padded`) & FAB right offset |
| `SPACING.xl` | `32dp` | Major block spacing & FAB bottom offset (`Toast` sits above tab bar) |
| `SPACING.xxl` | `40dp` | `EmptyState` vertical breathing room |
| `SPACING.xxxl` | `48dp` | Scrollable bottom clearance so the FAB never covers the final card |

### Corner Radii (`RADIUS`) & Minimum Touch Target (`TOUCH_TARGET`)
- `RADIUS.card = 20dp` — Soft pebble-like cards (`AppCard`) and bottom-sheet top corners.
- `RADIUS.button = 14dp` — Primary/secondary buttons, segmented control, toolbar buttons, and inputs.
- `RADIUS.sm = 8dp` — Date rows, bar-chart bars, icon badges, inline filter chips.
- `RADIUS.pill = 9999dp` — Search bar, quick-add `QuickChip`s, progress ring containers, `FloatingActionButton` (`56dp x 56dp`).
- `TOUCH_TARGET.min = 48dp` — Shared across buttons, icon buttons (`close`, `edit`, `delete`), `QuickChip`, `ThemeSegmentedControl` segments, and `WeeklySummaryCard` tabs to comply with WCAG / Material mobile tap accessibility.

### Soft Elevation (`src/core/theme/shadows.js`)
- `SHADOWS.soft` / `SHADOWS.softDark` — Subtle `elevation: 2`, `shadowRadius: 8–10` (`#1F2D3D` at `6%` light opacity) giving cards soft separation without harsh borders.
- `SHADOWS.elevated` / `SHADOWS.elevatedDark` — `elevation: 6`, `shadowRadius: 12` reserved strictly for floating elements (`FloatingActionButton`, `Toast`).

---

## 4. Iconography (`@expo/vector-icons/MaterialCommunityIcons`)

Using one unified icon family eliminates visual weight mismatch across platforms:

| Context | Icon Name | Element |
| :--- | :--- | :--- |
| Steps Metric | `walk` | `METRICS.steps.icon`, `MetricCard`, `AppTextInput`, Sort menu |
| Calories Metric & Streak | `fire` | `METRICS.calories.icon`, `StreakBannerCard`, `MetricCard`, `AppTextInput` |
| Water Metric | `water` | `METRICS.water.icon`, `MetricCard`, `AppTextInput`, Sort menu |
| Bottom Tabs | `view-dashboard-outline`, `calendar-clock-outline`, `cog-outline` | Home, History, Settings tabs |
| Actions & Navigation | `plus`, `pencil-outline`, `trash-can-outline`, `close`, `check`, `check-circle` | FAB, card actions, save/confirm buttons |
| Filters & Export | `calendar-month-outline`, `calendar-range`, `sort-calendar-descending`, `file-delimited-outline` | `HistoryToolbar`, `DateSearchBar`, `SortMenuModal` |
| Appearance & States | `theme-light-dark`, `white-balance-sunny`, `weather-night`, `sprout-outline`, `check-decagram-outline` | `ThemeSegmentedControl`, encouragement & empty states |

---

## 5. UX Principles Applied

1. **Calm, Judgment-Free Tracking:**
   - Negative changes vs yesterday render in muted slate (`arrow-down` in `colors.textMuted`, never shaming red), while increases render in calm primary teal (`arrow-up` in `colors.primary`).
   - Empty states use reassuring copy (`"Ready when you are. Log your first entry."`) rather than scolding alerts.
2. **Thumb-Friendly Ergonomics:**
   - Primary navigation lives at the bottom edge (3 tabs >= `62dp` tall), primary creation sits under the natural right-thumb arc (`56dp` FAB), and every tappable element meets `48dp` height/width.
   - Modal form **Save** and **Cancel** buttons sit at the bottom of the card directly below inputs, and `DateRangeModal` / `SortMenuModal` anchor cleanly within comfortable thumb reach.
3. **Low-Effort Input:**
   - `AppTextInput numeric` opens platform numeric keypads automatically.
   - `returnKeyType="next"` + `onSubmitEditing` chains focus seamlessly from `Steps -> Calories -> Water -> Submit` on both **Add/Edit Entry** and **Settings Goals**.
   - Metric-colored `QuickChip`s (`+1000` / `+2500` steps, `+50` / `+100` kcal, `+250` / `+500` ml) increment fields in a single tap without typing.
4. **Restrained, Purposeful Motion (`150ms` – `300ms`):**
   - `PressableScale` applies a gentle `0.97`–`0.93` scale over `150ms` (`Easing.out(Easing.quad)`).
   - `FadeInView` staggers History cards smoothly (`220ms` max `150ms` delay).
   - `ProgressRing` animates strokes over `300ms` via `Animated.Value` + `addListener` (preventing web SVG `collapsable` warnings), and `AnimatedWeeklyBar` fills chart columns smoothly over `280ms`.
   - Global `Toast` slides and fades over `220ms` / `200ms` with `Platform.OS !== 'web'` native driver compatibility.
