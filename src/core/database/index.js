/**
 * @layer Core (Database)
 * @responsibility Barrel export for database connection, initialization, and seeding.
 *                testCrud is intentionally NOT re-exported here to prevent a require
 *                cycle: testCrud → records/repository → database/index.
 *                Import runCrudTest directly from './testCrud' in dev-only files.
 */
export * from './database';
export * from './seed';
export * from './testCrud';

