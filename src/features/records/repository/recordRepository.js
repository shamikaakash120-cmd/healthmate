/**
 * @layer Repository (Records)
 * @responsibility Sole layer executing parameterized SQL queries for health records.
 *
 * Imports getDb directly from core/database/database.js (not barrel index.js) to prevent require cycles.
 */
import { getDb } from '../../../core/database/database';

/**
 * Inserts a new health record into the SQLite database.
 *
 * @param {object} record
 * @param {string} record.date - Date in YYYY-MM-DD format.
 * @param {number} record.steps - Total steps.
 * @param {number} record.calories - Active calories burned.
 * @param {number} record.water - Water intake in millilitres.
 * @returns {Promise<{ id: number, date: string, steps: number, calories: number, water: number }>}
 * @throws {Error} If the database query fails.
 */
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

/**
 * Retrieves all health records, ordered chronologically newest first, then by ID descending.
 *
 * @returns {Promise<Array<{ id: number, date: string, steps: number, calories: number, water: number }>>}
 * @throws {Error} If the database query fails.
 */
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

/**
 * Retrieves a single health record by its unique database row ID.
 *
 * @param {number} id - Record primary key.
 * @returns {Promise<{ id: number, date: string, steps: number, calories: number, water: number } | null>}
 * @throws {Error} If the database query fails.
 */
export async function getRecordById(id) {
  try {
    const db = getDb();
    const row = await db.getFirstAsync(
      'SELECT id, date, steps, calories, water FROM health_records WHERE id = ?;',
      [id]
    );
    return row || null;
  } catch (error) {
    throw new Error(`Failed to fetch health record with ID ${id}: ${error?.message || 'Database error'}`);
  }
}

/**
 * Retrieves all records logged on a specific calendar date (YYYY-MM-DD).
 *
 * @param {string} date - Local date string (YYYY-MM-DD).
 * @returns {Promise<Array<{ id: number, date: string, steps: number, calories: number, water: number }>>}
 * @throws {Error} If the database query fails.
 */
export async function getRecordsByDate(date) {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      'SELECT id, date, steps, calories, water FROM health_records WHERE date = ? ORDER BY id DESC;',
      [date]
    );
    return rows || [];
  } catch (error) {
    throw new Error(`Failed to fetch records for date "${date}": ${error?.message || 'Database error'}`);
  }
}

/**
 * Retrieves all records falling within an inclusive date range [startDate, endDate].
 *
 * @param {string} startDate - Start date in YYYY-MM-DD format.
 * @param {string} endDate - End date in YYYY-MM-DD format.
 * @returns {Promise<Array<{ id: number, date: string, steps: number, calories: number, water: number }>>}
 * @throws {Error} If the database query fails.
 */
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

/**
 * Updates an existing health record by its ID.
 *
 * @param {object} record
 * @param {number} record.id - ID of the record to update.
 * @param {string} record.date - Updated date (YYYY-MM-DD).
 * @param {number} record.steps - Updated steps.
 * @param {number} record.calories - Updated calories.
 * @param {number} record.water - Updated water in ml.
 * @returns {Promise<{ id: number, date: string, steps: number, calories: number, water: number }>}
 * @throws {Error} If the record does not exist or the query fails.
 */
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

/**
 * Deletes a health record from the database by its ID.
 *
 * @param {number} id - Record primary key.
 * @returns {Promise<boolean>} True if a record was deleted, false if no record matched.
 * @throws {Error} If the database query fails.
 */
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

/**
 * Calculates the sum totals of steps, calories, and water for a specific calendar date.
 * Returns zeros ({ steps: 0, calories: 0, water: 0 }) if no records exist for that date.
 *
 * @param {string} date - Date in YYYY-MM-DD format.
 * @returns {Promise<{ steps: number, calories: number, water: number }>}
 * @throws {Error} If the database query fails.
 */
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

/**
 * Retrieves aggregated daily metric totals grouped by date within an inclusive date range.
 *
 * @param {string} startDate - Start date (YYYY-MM-DD).
 * @param {string} endDate - End date (YYYY-MM-DD).
 * @returns {Promise<Array<{ date: string, steps: number, calories: number, water: number }>>}
 * @throws {Error} If the database query fails.
 */
export async function getTotalsBetween(startDate, endDate) {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      `SELECT 
        date,
        COALESCE(SUM(steps), 0) AS steps,
        COALESCE(SUM(calories), 0) AS calories,
        COALESCE(SUM(water), 0) AS water
       FROM health_records
       WHERE date BETWEEN ? AND ?
       GROUP BY date
       ORDER BY date ASC;`,
      [startDate, endDate]
    );

    return (rows || []).map((row) => ({
      date: row.date,
      steps: Number(row.steps),
      calories: Number(row.calories),
      water: Number(row.water),
    }));
  } catch (error) {
    throw new Error(
      `Failed to calculate grouped totals between "${startDate}" and "${endDate}": ${error?.message || 'Database error'}`
    );
  }
}

/**
 * Retrieves distinct calendar dates (YYYY-MM-DD) having at least one health record
 * on or before `upToDate`, ordered newest first for streak calculation.
 *
 * @param {string} upToDate - Upper-bound date (inclusive) in YYYY-MM-DD format.
 * @returns {Promise<string[]>} Array of distinct YYYY-MM-DD strings sorted descending.
 * @throws {Error} If the database query fails.
 */
export async function getDistinctRecordDates(upToDate) {
  try {
    const db = getDb();
    const rows = await db.getAllAsync(
      'SELECT DISTINCT date FROM health_records WHERE date <= ? ORDER BY date DESC;',
      [upToDate]
    );
    return (rows || []).map((row) => row.date).filter(Boolean);
  } catch (error) {
    throw new Error(
      `Failed to fetch distinct record dates up to "${upToDate}": ${error?.message || 'Database error'}`
    );
  }
}
