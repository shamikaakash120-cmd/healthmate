# HealthMate 🌿
> **Personal Health & Wellness Tracker Mobile Application**  
> Kingston University BSc (Hons) Top-Up — *CI6330 Mobile Application Development*

---

## 📌 Project Overview
**HealthMate** is a calm, intuitive, and practical personal health and wellness tracker built with **React Native** and **Expo**. It empowers users to monitor their daily activity—specifically **Steps**, **Active Calories**, and **Water Intake**—using an embedded local SQLite database, clear visual progress indicators, and a clean, accessible interface following Material Design 3 guidelines.

---

## 🏗️ Architectural Pattern: MVVM (Feature-Based)
The application strictly enforces **Model-View-ViewModel (MVVM)** architecture organized by feature to maintain clean separation of concerns:

- **Presentation Layer (`app/`, `src/features/*/screens/`, `components/`):**
  - Pure UI components containing zero SQL queries and zero business logic.
  - File-based navigation using Expo Router (`app/`).
- **ViewModel Layer (`src/features/*/viewmodel/`):**
  - Managed via **Zustand** stores.
  - Encapsulates UI state, business validation calls, and repository invocations.
- **Data Repository Layer (`src/features/*/repository/`, `src/core/database/`):**
  - The exclusive boundary that interacts with the embedded database.
  - Executes strictly parameterized queries using `expo-sqlite`.
- **Domain Model Layer (`src/features/*/model/`):**
  - Defines data contracts, schema definitions, and input validation rules.
- **Core Module (`src/core/`):**
  - Shared design tokens (palette, spacing, typography), database setup, and formatting utilities.

---

## 🛠️ Tech Stack & Key Libraries
- **Framework:** React Native with Expo (SDK 58)
- **Language:** JavaScript (ES6+)
- **Navigation:** Expo Router (File-based tabs and stack routes)
- **Database:** `expo-sqlite` (Embedded local storage, parameterized queries)
- **State Management:** `zustand`
- **Design System:** Custom Material Design 3 tokens (Calm palette)
- **Icons:** `@expo/vector-icons` (`MaterialCommunityIcons` only)
- **Date Picker:** `@react-native-community/datetimepicker`
- **Charts / Visualizations:** `react-native-svg` (Circular progress rings)

---

## 🎨 Design Philosophy & Metric Tokens
- **Background:** Calm warm off-white (`#F7F5F0`) / Surface white (`#FFFFFF`)
- **Primary Accent:** Soft teal (`#2A9D8F`)
- **Typography:** Deep slate text (`#1F2D3D`), Muted slate (`#6B7A8C`)
- **Steps:** Soft green (`#4CAF7D`) • Unit: `steps` • Icon: `walk`
- **Calories:** Soft coral red (`#E76F6F`) • Unit: `kcal` • Icon: `fire`
- **Water:** Soft blue (`#4A90D9`) • Unit: `ml` • Icon: `water`
- **Grid & Radii:** 8-pt spacing grid, 20dp card border radius, minimum 48dp touch targets.

---

## 📂 Project Structure
```
HealthMate/
├── app/                      # Expo Router route wrappers (thin routing)
│   ├── _layout.js            # Root stack navigation layout
│   └── index.js              # Entry route pointing to Dashboard
├── src/
│   ├── core/                 # Shared infrastructure
│   │   ├── database/         # SQLite setup & migrations
│   │   ├── theme/            # Theme tokens, colors, spacing, typography
│   │   ├── utils/            # Date and numeric utility helpers
│   │   └── components/       # Reusable base UI components
│   └── features/
│       ├── records/          # Health records CRUD feature
│       │   ├── model/        # Data validation and contracts
│       │   ├── repository/   # Parameterized SQL database operations
│       │   ├── viewmodel/    # Zustand store for records
│       │   ├── screens/      # Record entry and edit views
│       │   └── components/   # Record cards and form components
│       ├── dashboard/        # Today's overview & progress rings
│       ├── history/          # Date filtering and historical logs
│       └── settings/         # Goals, theme preference, database seeding
├── docs/                     # Coursework documentation & logs
│   ├── ISSUES_LOG.md         # Errors encountered, root causes, and fixes
│   └── DECISIONS.md          # Architectural decisions & library justifications
├── app.json                  # Expo application configuration
└── package.json              # Project dependencies and scripts
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun
- Expo Go app on iOS/Android or an emulator

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npx expo start
```

### 3. Open the App
- Press `a` in the terminal to run on an **Android Emulator** or connected device.
- Press `i` to run on an **iOS Simulator** (macOS required).
- Press `w` to run on a **Web Browser**.
- Scan the QR code using the **Expo Go** app on your physical device.
