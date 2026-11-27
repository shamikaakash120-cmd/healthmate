/**
 * @layer Repository (Settings)
 * @responsibility Parameterized SQLite persistence operations for key-value application settings.
 *
 * Imports getDb directly from core/database/database.js (not barrel index.js) to prevent require cycles.
 */
import { getDb } from '../../../core/database/database';

/**
 * Retrieves a single persisted setting value by key.
 *
 * @param {string} key Setting identifier in the `settings` table.
 * @returns {Promise<string | null>} Stored string value, or null if not found.
 * @throws {Error} If key is invalid or the query fails.
 */
export async function getSetting(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Setting key must be a non-empty string.');
  }

  try {
    const db = getDb();
    const row = await db.getFirstAsync(
      'SELECT value FROM settings WHERE key = ?;',
      [key]
    );
    return row ? String(row.value) : null;
  } catch (error) {
    throw new Error(
      `Failed to read setting "${key}": ${error?.message || 'Database error'}`
    );
  }
}

/**
 * Inserts or updates a single key-value setting in SQLite.
 *
 * @param {string} key Setting identifier.
 * @param {string | number | boolean} value Setting value (serialized as text).
 * @returns {Promise<{ key: string, value: string }>} Persisted key/value pair.
 * @throws {Error} If parameters are invalid or the query fails.
 */
export async function setSetting(key, value) {
  if (!key || typeof key !== 'string') {
    throw new Error('Setting key must be a non-empty string.');
  }
  if (value === undefined || value === null) {
    throw new Error(`Setting value for "${key}" cannot be null or undefined.`);
  }

  const serialized = String(value);

  try {
    const db = getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
      [key, serialized]
    );
    return { key, value: serialized };
  } catch (error) {
    throw new Error(
      `Failed to save setting "${key}": ${error?.message || 'Database error'}`
    );
  }
}

/**
 * Persists multiple settings atomically inside a single SQLite transaction.
 *
 * @param {Array<[string, string | number | boolean]>} entries Key-value pairs to store.
 * @returns {Promise<void>}
 * @throws {Error} If any entry is invalid or the transaction fails.
 */
export async function setSettingsBatch(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return;
  }

  for (const [key, value] of entries) {
    if (!key || typeof key !== 'string') {
      throw new Error('Every setting key must be a non-empty string.');
    }
    if (value === undefined || value === null) {
      throw new Error(`Setting value for "${key}" cannot be null or undefined.`);
    }
  }

  try {
    const db = getDb();
    await db.withTransactionAsync(async () => {
      for (const [key, value] of entries) {
        await db.runAsync(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);',
          [key, String(value)]
        );
      }
    });
  } catch (error) {
    throw new Error(
      `Failed to save settings: ${error?.message || 'Database error'}`
    );
  }
}

/**
 * Retrieves all stored key-value settings as a plain object map.
 *
 * @returns {Promise<Record<string, string>>} Key-to-value settings dictionary.
 * @throws {Error} If the database query fails.
 */
export async function getAllSettings() {
  try {
    const db = getDb();
    const rows = await db.getAllAsync('SELECT key, value FROM settings;');
    const result = {};

    for (const row of rows || []) {
      if (row && row.key != null) {
        result[row.key] = String(row.value);
      }
    }

    return result;
  } catch (error) {
    throw new Error(
      `Failed to load settings: ${error?.message || 'Database error'}`
    );
  }
}
