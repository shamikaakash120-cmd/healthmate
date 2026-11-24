/**
 * @layer Core (Database)
 * @responsibility SQLite connection management, table schemas, indexes, and user_version migrations.
 */
import { openDatabaseAsync } from 'expo-sqlite';

/**
 * Name of the local SQLite database file.
 * @type {string}
 */
export const DB_NAME = 'healthmate.db';

/**
 * Current target schema version for migrations.
 * @type {number}
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Cached SQLite database instance singleton.
 * @type {import('expo-sqlite').SQLiteDatabase | null}
 */
let dbInstance = null;

/**
 * In-flight database initialization promise to prevent concurrent executions.
 * @type {Promise<import('expo-sqlite').SQLiteDatabase> | null}
 */
let initPromise = null;

/**
 * Opens and initializes the HealthMate SQLite database.
 *
 * @returns {Promise<import('expo-sqlite').SQLiteDatabase>} Resolved SQLite database instance.
 * @throws {Error} 
 */
export async function initDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await openDatabaseAsync(DB_NAME);

      // Enable Write-Ahead Logging (WAL) for concurrency & foreign keys
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
      `);

      // Read current schema version
      const versionResult = await db.getFirstAsync('PRAGMA user_version;');
      const currentVersion = versionResult?.user_version ?? 0;

      // Initial migration: Version 0 -> Version 1
      if (currentVersion < 1) {
        await db.execAsync(`
          -- Health records table strictly matching coursework specifications
          CREATE TABLE IF NOT EXISTS health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            steps INTEGER NOT NULL,
            calories INTEGER NOT NULL,
            water INTEGER NOT NULL
          );

          -- Fast date-based querying, filtering, and daily sum aggregations
          CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date);

          -- Key-value settings table for goals and app preferences
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );

          -- Advance schema version to 1
          PRAGMA user_version = 1;
        `);
      }

      dbInstance = db;
      return db;
    } catch (error) {
      initPromise = null; // Clear promise so retry is possible
      throw new Error(
        `Unable to initialize the HealthMate database. Details: ${error?.message || 'Unknown database error'}`
      );
    }
  })();

  return initPromise;
}

/**
 * Synchronously retrieves the active SQLite database instance.
 * @returns {import('expo-sqlite').SQLiteDatabase} Active SQLite database instance.
 * @throws {Error} 
 */
export function getDb() {
  if (!dbInstance) {
    throw new Error(
      'Database is not initialized. Ensure initDatabase() is called and awaited before calling getDb().'
    );
  }
  return dbInstance;
}
