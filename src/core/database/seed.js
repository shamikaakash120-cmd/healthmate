/**
 * @layer Core (Database)
 * @responsibility Seeds initial realistic health records if the database table is empty.
 */
import { getLastNDates } from '../utils/dateUtils';
import { getDb } from './database';

/**
 * Seeds 11 realistic health records across the last 10 days,including one day with two separate entries (morning & evening),
 * @param {boolean} [force=false] 
 * @returns {Promise<boolean>} 
 * @throws {Error} 
 */
export async function seedDatabase(force = false) {
  try {
    const db = getDb();

    // Check if records already exist
    if (!force) {
      const countRow = await db.getFirstAsync('SELECT COUNT(*) AS count FROM health_records;');
      if (countRow && countRow.count > 0) {
        return false; // Table already contains data; do not overwrite or duplicate
      }
    }

    // Generate dynamic dates for the last 10 calendar days ending today
    const dates = getLastNDates(10);

    // Realistic, believable health tracking data
    const seedRecords = [
      { date: dates[0], steps: 6420, calories: 310, water: 1800 },
      { date: dates[1], steps: 8950, calories: 440, water: 2100 },
      { date: dates[2], steps: 4120, calories: 200, water: 1500 },
      { date: dates[3], steps: 10230, calories: 510, water: 2600 },
      { date: dates[4], steps: 7840, calories: 385, water: 2000 },
      // Day with two entries (e.g. morning jog + evening family walk)
      { date: dates[5], steps: 4500, calories: 225, water: 1000 },
      { date: dates[5], steps: 5100, calories: 250, water: 1200 },
      { date: dates[6], steps: 9300, calories: 465, water: 2300 },
      { date: dates[7], steps: 11400, calories: 570, water: 2800 },
      { date: dates[8], steps: 8650, calories: 420, water: 2150 },
      { date: dates[9], steps: 5400, calories: 270, water: 1400 },
    ];

    // Atomically insert all seed entries within a transaction
    await db.withTransactionAsync(async () => {
      for (const record of seedRecords) {
        await db.runAsync(
          'INSERT INTO health_records (date, steps, calories, water) VALUES (?, ?, ?, ?);',
          [record.date, record.steps, record.calories, record.water]
        );
      }
    });

    return true;
  } catch (error) {
    throw new Error(`Failed to seed database: ${error?.message || 'Database error'}`);
  }
}
