# HealthMate — Key CRUD & Search Code Snippets

All code below is excerpted directly from the HealthMate source files, illustrating parameterized SQLite operations, domain validation, and ViewModel orchestration.

---

## 1. Create Record (Parameterized `INSERT` — `src/features/records/repository/recordRepository.js`)

```js
export async function createRecord(record) {
  try {
    const db = getDb();
    const result = await db.runAsync(
      'INSERT INTO health_records (date, steps, calories, water) VALUES (?, ?, ?, ?);',
      [record.date, record.steps, record.calories, record.water]
    );

    return {
      id: result.lastInsertRowId,
      date: record.date,
      steps: record.steps,
      calories: record.calories,
      water: record.water,
    };
  } catch (error) {
    throw new Error(`Failed to create health record: ${error?.message || 'Database error'}`);
  }
}
```

**Explanation:** Uses `expo-sqlite`'s `runAsync` with `?` parameter bindings so raw inputs are never interpolated into SQL. Returns the inserted `lastInsertRowId` merged with the typed record payload.

---

## 2. Read & Aggregate Daily Totals (`src/features/records/repository/recordRepository.js`)

```js
export async function getAllRecords() {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      'SELECT id, date, steps, calories, water FROM health_records ORDER BY date DESC, id DESC;'
    );
    return rows || [];
  } catch (error) {
    throw new Error(`Failed to fetch health records: ${error?.message || 'Database error'}`);
  }
}

export async function getTotalsForDate(date) {
  try {
    const db = getDb();
    const row = await db.getFirstAsync(
      `SELECT 
        COALESCE(SUM(steps), 0) AS steps,
        COALESCE(SUM(calories), 0) AS calories,
        COALESCE(SUM(water), 0) AS water
       FROM health_records
       WHERE date = ?;`,
      [date]
    );

    return {
      steps: row ? Number(row.steps) : 0,
      calories: row ? Number(row.calories) : 0,
      water: row ? Number(row.water) : 0,
    };
  } catch (error) {
    throw new Error(`Failed to calculate daily totals for "${date}": ${error?.message || 'Database error'}`);
  }
}
```

**Explanation:** `getAllRecords` powers the unfiltered History list in newest-first order (`idx_health_records_date` accelerates date sorting). `getTotalsForDate` uses `COALESCE(SUM(...), 0)` so multiple entries on the same calendar date combine cleanly and empty dates return zeros instead of `null`.

---

## 3. Search by Single Date & Date Range (`src/features/records/repository/recordRepository.js` & `useRecordsStore.js`)

```js
// recordRepository.js
export async function getRecordsBetween(startDate, endDate) {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      'SELECT id, date, steps, calories, water FROM health_records WHERE date BETWEEN ? AND ? ORDER BY date DESC, id DESC;',
      [startDate, endDate]
    );
    return rows || [];
  } catch (error) {
    throw new Error(
      `Failed to fetch records between "${startDate}" and "${endDate}": ${error?.message || 'Database error'}`
    );
  }
}

// useRecordsStore.js
setDateRange: async (start, end) => {
  const validation = validateDateRange(start, end);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  set({ rangeStart: start, rangeEnd: end, searchDate: null });
  await get().loadRecords();
  return { success: true, error: null };
},
```

**Explanation:** Setting a single `searchDate` clears any active range, and setting a range validates `From <= To` and no future dates before executing parameterized `WHERE date BETWEEN ? AND ?` in SQLite.

---

## 4. Update Record (`src/features/records/repository/recordRepository.js`)

```js
export async function updateRecord(record) {
  try {
    const db = getDb();
    const result = await db.runAsync(
      'UPDATE health_records SET date = ?, steps = ?, calories = ?, water = ? WHERE id = ?;',
      [record.date, record.steps, record.calories, record.water, record.id]
    );

    if (result.changes === 0) {
      throw new Error(`Record with ID ${record.id} was not found.`);
    }

    return {
      id: record.id,
      date: record.date,
      steps: record.steps,
      calories: record.calories,
      water: record.water,
    };
  } catch (error) {
    throw new Error(`Failed to update health record: ${error?.message || 'Database error'}`);
  }
}
```

**Explanation:** Executes a parameterized `UPDATE ... WHERE id = ?` and explicitly verifies `result.changes` so stale or missing row IDs fail loudly instead of reporting silent success.

---

## 5. Delete Record (`src/features/records/repository/recordRepository.js` & `useRecordsStore.js`)

```js
// recordRepository.js
export async function deleteRecord(id) {
  try {
    const db = getDb();
    const result = await db.runAsync(
      'DELETE FROM health_records WHERE id = ?;',
      [id]
    );
    return result.changes > 0;
  } catch (error) {
    throw new Error(`Failed to delete record with ID ${id}: ${error?.message || 'Database error'}`);
  }
}

// useRecordsStore.js
removeRecord: async (id) => {
  set({ error: null });
  try {
    const success = await deleteRecord(id);
    if (success) {
      await Promise.all([get().loadRecords(), get().loadTodayTotals()]);
    }
    return { success };
  } catch (err) {
    const errorMsg = err?.message || 'Failed to delete record.';
    set({ error: errorMsg });
    return { success: false };
  }
},
```

**Explanation:** After confirming `DELETE` inside `ConfirmDeleteModal`, the ViewModel removes the row by primary key and refreshes both History (`loadRecords`) and Dashboard totals (`loadTodayTotals`) concurrently.

---

## 6. Validate, Convert, and Double-Submit Guard (`src/features/records/viewmodel/useRecordsStore.js`)

```js
addRecord: async (input) => {
  if (get().lastSaveStatus === 'saving') {
    return {
      success: false,
      errors: { form: 'A save operation is currently in progress. Please wait.' },
    };
  }

  set({ lastSaveStatus: 'saving', error: null });

  const validation = validateRecord(input);
  if (!validation.valid) {
    set({ lastSaveStatus: 'error' });
    return { success: false, errors: validation.errors };
  }

  try {
    const domainRecord = toHealthRecord(input);
    const created = await createRecord(domainRecord);
    set({ lastSaveStatus: 'success' });
    await Promise.all([get().loadRecords(), get().loadTodayTotals()]);
    return { success: true, errors: null, record: created };
  } catch (err) {
    const errorMsg = err?.message || 'Failed to save health record.';
    set({ lastSaveStatus: 'error', error: errorMsg });
    return { success: false, errors: { form: errorMsg } };
  }
```

**Explanation:** Enforces the MVVM validation flow: double-tap guard -> pure Model validation (`validateRecord`) -> integer coercion (`toHealthRecord`) -> repository write -> reactive store refresh.

---

## 7. Settings Atomic Batch Persist & History CSV Serialization

```js
// settingsRepository.js
export async function setSettingsBatch(entries) {
  // ...input key/value checks omitted for brevity...
  const db = getDb();
  await db.withTransactionAsync(async () => {
    for (const [key, value] of entries) {
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
        [key, String(value)]
      );
    }
  });
}

// csv.js
export const HEALTH_RECORDS_CSV_HEADER = 'id,date,steps,calories,water';

export function recordsToCsv(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return HEALTH_RECORDS_CSV_HEADER;
  }

  const rows = records.map((record) =>
    [
      record?.id ?? '',
      record?.date ?? '',
      record?.steps ?? '',
      record?.calories ?? '',
      record?.water ?? '',
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [HEALTH_RECORDS_CSV_HEADER, ...rows].join('\n');
}
```

**Explanation:** Saving custom daily goals writes all three targets atomically inside one SQLite transaction (`withTransactionAsync`) so partial writes cannot occur. Exporting visible History records delegates formatting to pure RFC 4180 helper `recordsToCsv` before saving to `Paths.cache` and invoking `Sharing.shareAsync`.
