# HealthMate — Mermaid Diagrams (Copy-Paste for draw.io)

Open this file in the raw editor and copy either block below into **draw.io** (`Arrange -> Insert -> Advanced -> Mermaid...`).

## 1. Architecture Diagram

```text
flowchart TD
  Router["Expo Router (app/)"] --> UI["Screens and Components (Dashboard, History, Form, Settings)"]
  UI --> Theme["Core Theme and Shared UI (src/core/theme, src/core/components)"]
  UI --> VM["ViewModels / Zustand Stores (useDashboardViewModel, useRecordsStore, useSettingsStore)"]
  VM --> Model["Models and Pure Utils (healthRecord.js, settingsModel.js, dateUtils, csv)"]
  VM --> Repo["Repositories (recordRepository.js, settingsRepository.js)"]
  Repo --> DB["Database Core (database.js, seed.js)"]
  DB --> SQLite[("SQLite: healthmate.db")]
```

## 2. Entity-Relationship (ER) Diagram

```text
erDiagram
  health_records {
    INTEGER id PK
    TEXT date
    INTEGER steps
    INTEGER calories
    INTEGER water
  }

  settings {
    TEXT key PK
    TEXT value
  }
```
